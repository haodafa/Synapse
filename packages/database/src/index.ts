import { z } from "zod";
import { Client } from "pg";

export const VectorSchema = z.object({
  id: z.string(),
  embedding: z.array(z.number()),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
});

export type Vector = z.infer<typeof VectorSchema>;

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
}

export class VectorStore {
  private client: Client;
  private tableName: string;

  constructor(config: DatabaseConfig, tableName = "embeddings") {
    this.client = new Client({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      maxConnections: config.maxConnections ?? 10,
    });
    this.tableName = tableName;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async initialize(embeddingDimension: number = 1536): Promise<void> {
    await this.client.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id VARCHAR(255) PRIMARY KEY,
        embedding vector(${embeddingDimension}),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS ${this.tableName}_embedding_idx 
      ON ${this.tableName} USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);
  }

  async upsert(vector: Vector): Promise<void> {
    await this.client.query(
      `
      INSERT INTO ${this.tableName} (id, embedding, metadata, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata
    `,
      [vector.id, `[${vector.embedding.join(",")}]`, JSON.stringify(vector.metadata ?? {}), vector.createdAt ?? new Date()]
    );
  }

  async findById(id: string): Promise<Vector | null> {
    const result = await this.client.query(
      `SELECT id, embedding, metadata, created_at FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      embedding: row.embedding,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }

  async search(embedding: number[], limit: number = 10, threshold?: number): Promise<Vector[]> {
    let query = `
      SELECT id, embedding, metadata, created_at,
             1 - (embedding <=> $1) as similarity
      FROM ${this.tableName}
      ORDER BY embedding <=> $1
      LIMIT $2
    `;
    const params: (number[] | number)[] = [[...embedding], limit];

    if (threshold !== undefined) {
      query = `
        SELECT id, embedding, metadata, created_at,
               1 - (embedding <=> $1) as similarity
        FROM ${this.tableName}
        WHERE 1 - (embedding <=> $1) >= $3
        ORDER BY embedding <=> $1
        LIMIT $2
      `;
      params.push(threshold);
    }

    const result = await this.client.query(query, params);
    return result.rows.map((row) => ({
      id: row.id,
      embedding: row.embedding,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.client.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    await this.client.query(`DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`, ids);
  }

  async count(): Promise<number> {
    const result = await this.client.query(`SELECT COUNT(*) FROM ${this.tableName}`);
    return parseInt(result.rows[0].count, 10);
  }

  async clear(): Promise<void> {
    await this.client.query(`TRUNCATE TABLE ${this.tableName}`);
  }
}

export class SynapseDatabase {
  private client: Client;

  constructor(config: DatabaseConfig) {
    this.client = new Client({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      maxConnections: config.maxConnections ?? 10,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async initialize(): Promise<void> {
    await this.client.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      
      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(100),
        provider VARCHAR(100),
        status VARCHAR(50) DEFAULT 'offline',
        skills TEXT[],
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS issues (
        id VARCHAR(255) PRIMARY KEY,
        key VARCHAR(50),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'backlog',
        priority VARCHAR(50) DEFAULT 'medium',
        assignee_id VARCHAR(255),
        project_id VARCHAR(255),
        labels JSONB,
        comments JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        key VARCHAR(50),
        members TEXT[],
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        version VARCHAR(50),
        category VARCHAR(100),
        tags TEXT[],
        code TEXT,
        config JSONB,
        downloads INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS squads (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(20),
        members JSONB,
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        agent_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS embeddings (
        id VARCHAR(255) PRIMARY KEY,
        embedding vector(1536),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS issues_status_idx ON issues(status);
      CREATE INDEX IF NOT EXISTS issues_assignee_idx ON issues(assignee_id);
      CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status);
      CREATE INDEX IF NOT EXISTS skills_category_idx ON skills(category);
      CREATE INDEX IF NOT EXISTS messages_agent_id_idx ON messages(agent_id);
      CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `);
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.client.query(sql, params);
    return result.rows as T[];
  }

  async execute(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.client.query(sql, params);
    return result.rowCount ?? 0;
  }

  async transaction<T>(callback: (client: Client) => Promise<T>): Promise<T> {
    const client = await this.client.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export function createDatabase(config: DatabaseConfig): SynapseDatabase {
  return new SynapseDatabase(config);
}

export function createVectorStore(config: DatabaseConfig, tableName?: string): VectorStore {
  return new VectorStore(config, tableName);
}
