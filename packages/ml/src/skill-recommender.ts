import { Skill, SkillRecommendation, UserSkillUsage, SkillCategory } from "@synapse/protocol";

export interface RecommendationConfig {
  maxRecommendations: number;
  minSimilarityScore: number;
  categoryWeights: Record<string, number>;
  recencyWeight: number;
  popularityWeight: number;
  relevanceWeight: number;
}

const DEFAULT_CONFIG: RecommendationConfig = {
  maxRecommendations: 10,
  minSimilarityScore: 0.3,
  categoryWeights: {
    coding: 1.5,
    analysis: 1.3,
    writing: 1.2,
    automation: 1.1,
    communication: 1.0,
  },
  recencyWeight: 0.2,
  popularityWeight: 0.3,
  relevanceWeight: 0.5,
};

export class SkillRecommender {
  private config: RecommendationConfig;
  private userHistory: Map<string, UserSkillUsage[]> = new Map();
  private skillEmbeddings: Map<string, number[]> = new Map();

  constructor(config: Partial<RecommendationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(skills: Skill[]): Promise<void> {
    for (const skill of skills) {
      const embedding = await this.generateEmbedding(skill);
      this.skillEmbeddings.set(skill.id, embedding);
    }
  }

  private async generateEmbedding(skill: Skill): Promise<number[]> {
    const text = `${skill.name} ${skill.description ?? ""} ${(skill.tags ?? []).join(" ")} ${skill.category ?? ""}`;
    return this.textToEmbedding(text);
  }

  private async textToEmbedding(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);
    
    const hashWeights: Record<string, number> = {
      coding: 1.0, code: 0.9, programming: 0.85, development: 0.8,
      analysis: 1.0, analytics: 0.9, data: 0.8, research: 0.75,
      writing: 1.0, text: 0.9, content: 0.85, documentation: 0.8,
      automation: 1.0, automated: 0.9, script: 0.85, workflow: 0.8,
      communication: 1.0, chat: 0.9, message: 0.85, voice: 0.8,
    };

    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const weight = hashWeights[word] ?? 0.5;
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] += Math.sin(hash * (i + 1) + index) * weight;
      }
    });

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  recordUsage(userId: string, usage: UserSkillUsage): void {
    const history = this.userHistory.get(userId) ?? [];
    history.push(usage);
    if (history.length > 100) {
      history.shift();
    }
    this.userHistory.set(userId, history);
  }

  async getRecommendations(
    userId: string,
    skills: Skill[],
    context?: { query?: string; category?: SkillCategory; tags?: string[] }
  ): Promise<SkillRecommendation[]> {
    const recommendations: SkillRecommendation[] = [];
    const userHistory = this.userHistory.get(userId) ?? [];

    const categoryCounts = new Map<string, number>();
    userHistory.forEach((usage) => {
      const count = categoryCounts.get(usage.category ?? "other") ?? 0;
      categoryCounts.set(usage.category ?? "other", count + 1);
    });

    const preferredCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);

    const contextEmbedding = context?.query 
      ? await this.textToEmbedding(context.query)
      : null;

    const contextTags = new Set(context?.tags ?? []);

    for (const skill of skills) {
      let relevanceScore = 0;
      let popularityScore = 0;
      let recencyScore = 0;

      if (contextEmbedding && this.skillEmbeddings.has(skill.id)) {
        const skillEmbedding = this.skillEmbeddings.get(skill.id)!;
        relevanceScore = this.cosineSimilarity(contextEmbedding, skillEmbedding);
      }

      if (context?.category && skill.category === context.category) {
        relevanceScore += 0.3 * (this.config.categoryWeights[skill.category] ?? 1.0);
      }

      if (contextTags.size > 0 && skill.tags) {
        const matchingTags = skill.tags.filter((tag) => contextTags.has(tag));
        relevanceScore += 0.2 * (matchingTags.length / Math.max(contextTags.size, 1));
      }

      for (const prefCategory of preferredCategories.slice(0, 3)) {
        if (skill.category === prefCategory) {
          relevanceScore += 0.1 * (this.config.categoryWeights[prefCategory] ?? 1.0);
          break;
        }
      }

      popularityScore = Math.min((skill.downloads ?? 0) / 10000, 1.0) * (skill.rating ?? 0) / 5.0;

      const skillUsage = userHistory.filter((u) => u.skillId === skill.id);
      if (skillUsage.length > 0) {
        const lastUsage = skillUsage[skillUsage.length - 1];
        const daysSinceUse = (Date.now() - new Date(lastUsage.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        recencyScore = Math.max(0, 1 - daysSinceUse / 30);
      }

      const finalScore = 
        relevanceScore * this.config.relevanceWeight +
        popularityScore * this.config.popularityWeight +
        recencyScore * this.config.recencyWeight;

      if (finalScore >= this.config.minSimilarityScore) {
        recommendations.push({
          skill,
          score: finalScore,
          reasons: this.generateReasons({
            relevanceScore,
            popularityScore,
            recencyScore,
            context,
            skill,
            userHistory,
          }),
        });
      }
    }

    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, this.config.maxRecommendations);
  }

  private generateReasons(params: {
    relevanceScore: number;
    popularityScore: number;
    recencyScore: number;
    context?: { query?: string; category?: SkillCategory; tags?: string[] };
    skill: Skill;
    userHistory: UserSkillUsage[];
  }): string[] {
    const reasons: string[] = [];

    if (params.context?.category && params.skill.category === params.context.category) {
      reasons.push(`Matches your interest in ${params.context.category}`);
    }

    if (params.context?.tags && params.context.tags.length > 0) {
      const matchingTags = params.skill.tags?.filter((tag) => 
        params.context!.tags!.includes(tag)
      ) ?? [];
      if (matchingTags.length > 0) {
        reasons.push(`Related to: ${matchingTags.slice(0, 2).join(", ")}`);
      }
    }

    if (params.relevanceScore > 0.7) {
      reasons.push("Highly relevant to your query");
    }

    if (params.popularityScore > 0.6) {
      reasons.push("Popular among users");
    }

    if (params.recentlyUsed !== undefined && params.recentlyUsed) {
      reasons.push("Used recently");
    }

    const similarSkillUsage = params.userHistory.filter(
      (u) => u.skillId === params.skill.id && u.success
    );
    if (similarSkillUsage.length >= 3) {
      reasons.push("Frequently used successfully");
    }

    return reasons;
  }

  async findSimilarSkills(skillId: string, skills: Skill[], limit: number = 5): Promise<Skill[]> {
    const skillEmbedding = this.skillEmbeddings.get(skillId);
    if (!skillEmbedding) return [];

    const similarities: { skill: Skill; similarity: number }[] = [];

    for (const skill of skills) {
      if (skill.id === skillId) continue;
      
      const embedding = this.skillEmbeddings.get(skill.id);
      if (!embedding) continue;

      const similarity = this.cosineSimilarity(skillEmbedding, embedding);
      similarities.push({ skill, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, limit).map((s) => s.skill);
  }

  getTrendingSkills(skills: Skill[], usageHistory: UserSkillUsage[], days: number = 7): Skill[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recentUsage = usageHistory.filter((u) => new Date(u.timestamp).getTime() >= cutoff);
    
    const usageCounts = new Map<string, number>();
    recentUsage.forEach((u) => {
      const count = usageCounts.get(u.skillId) ?? 0;
      usageCounts.set(u.skillId, count + 1);
    });

    return skills
      .map((skill) => ({
        skill,
        trendingScore: (usageCounts.get(skill.id) ?? 0) * (skill.rating ?? 0),
      }))
      .filter((item) => item.trendingScore > 0)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 10)
      .map((item) => item.skill);
  }
}

export function createSkillRecommender(config?: Partial<RecommendationConfig>): SkillRecommender {
  return new SkillRecommender(config);
}
