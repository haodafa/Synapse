import { Client } from "pg";

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
}

const migrations: Migration[] = [
  {
    id: "001_initial_schema",
    name: "Create initial schema",
    up: `
      CREATE EXTENSION IF NOT EXISTS vector;
      
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(100),
        provider VARCHAR(100),
        status VARCHAR(50) DEFAULT 'offline',
        skills TEXT[],
        config JSONB,
        metadata JSONB,
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
        metadata JSONB,
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
        metadata JSONB,
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
        icon VARCHAR(100),
        code TEXT,
        config JSONB,
        downloads INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        author VARCHAR(255),
        metadata JSONB,
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
        metadata JSONB,
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
    `,
    down: `
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS embeddings;
      DROP TABLE IF EXISTS skills;
      DROP TABLE IF EXISTS squads;
      DROP TABLE IF EXISTS projects;
      DROP TABLE IF EXISTS issues;
      DROP TABLE IF EXISTS agents;
      DROP TABLE IF EXISTS schema_migrations;
      DROP EXTENSION IF EXISTS vector;
    `,
  },
  {
    id: "002_add_indexes",
    name: "Add database indexes",
    up: `
      CREATE INDEX IF NOT EXISTS issues_status_idx ON issues(status);
      CREATE INDEX IF NOT EXISTS issues_priority_idx ON issues(priority);
      CREATE INDEX IF NOT EXISTS issues_assignee_idx ON issues(assignee_id);
      CREATE INDEX IF NOT EXISTS issues_project_idx ON issues(project_id);
      CREATE INDEX IF NOT EXISTS issues_created_at_idx ON issues(created_at);
      
      CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status);
      CREATE INDEX IF NOT EXISTS agents_provider_idx ON agents(provider);
      
      CREATE INDEX IF NOT EXISTS skills_category_idx ON skills(category);
      CREATE INDEX IF NOT EXISTS skills_tags_idx ON skills USING gin(tags);
      
      CREATE INDEX IF NOT EXISTS messages_agent_id_idx ON messages(agent_id);
      CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
      
      CREATE INDEX IF NOT EXISTS embeddings_embedding_idx 
        ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `,
    down: `
      DROP INDEX IF EXISTS issues_status_idx;
      DROP INDEX IF EXISTS issues_priority_idx;
      DROP INDEX IF EXISTS issues_assignee_idx;
      DROP INDEX IF EXISTS issues_project_idx;
      DROP INDEX IF EXISTS issues_created_at_idx;
      
      DROP INDEX IF EXISTS agents_status_idx;
      DROP INDEX IF EXISTS agents_provider_idx;
      
      DROP INDEX IF EXISTS skills_category_idx;
      DROP INDEX IF EXISTS skills_tags_idx;
      
      DROP INDEX IF EXISTS messages_agent_id_idx;
      DROP INDEX IF EXISTS messages_created_at_idx;
      
      DROP INDEX IF EXISTS embeddings_embedding_idx;
    `,
  },
  {
    id: "003_add_agents_features",
    name: "Add agent features",
    up: `
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS system_prompt TEXT;
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '[]';
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS worktree_id VARCHAR(255);
      ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_active TIMESTAMP;
      
      CREATE TABLE IF NOT EXISTS agent_sessions (
        id VARCHAR(255) PRIMARY KEY,
        agent_id VARCHAR(255) NOT NULL,
        workspace_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        metadata JSONB
      );
      
      CREATE INDEX IF NOT EXISTS agent_sessions_agent_id_idx ON agent_sessions(agent_id);
    `,
    down: `
      ALTER TABLE agents DROP COLUMN IF EXISTS system_prompt;
      ALTER TABLE agents DROP COLUMN IF EXISTS capabilities;
      ALTER TABLE agents DROP COLUMN IF EXISTS worktree_id;
      ALTER TABLE agents DROP COLUMN IF EXISTS last_active;
      
      DROP TABLE IF EXISTS agent_sessions;
    `,
  },
  {
    id: "004_add_worktrees",
    name: "Add worktree support",
    up: `
      CREATE TABLE IF NOT EXISTS worktrees (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        branch VARCHAR(255),
        base_branch VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS worktrees_status_idx ON worktrees(status);
    `,
    down: `
      DROP TABLE IF EXISTS worktrees;
    `,
  },
  {
    id: "005_add_skill_usage",
    name: "Add skill usage tracking",
    up: `
      CREATE TABLE IF NOT EXISTS skill_usage (
        id VARCHAR(255) PRIMARY KEY,
        skill_id VARCHAR(255) NOT NULL,
        agent_id VARCHAR(255),
        user_id VARCHAR(255),
        success BOOLEAN DEFAULT true,
        duration_ms INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS skill_usage_skill_id_idx ON skill_usage(skill_id);
      CREATE INDEX IF NOT EXISTS skill_usage_created_at_idx ON skill_usage(created_at);
    `,
    down: `
      DROP TABLE IF EXISTS skill_usage;
    `,
  },
];

export class MigrationRunner {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async initialize(): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async getAppliedMigrations(): Promise<string[]> {
    const result = await this.client.query(
      "SELECT id FROM schema_migrations ORDER BY applied_at"
    );
    return result.rows.map((row) => row.id);
  }

  async getPendingMigrations(): Promise<Migration[]> {
    const applied = await this.getAppliedMigrations();
    return migrations.filter((m) => !applied.includes(m.id));
  }

  async applyMigration(migration: Migration): Promise<void> {
    const client = await this.client.connect();
    try {
      await client.query("BEGIN");
      await client.query(migration.up);
      await client.query(
        "INSERT INTO schema_migrations (id, name) VALUES ($1, $2)",
        [migration.id, migration.name]
      );
      await client.query("COMMIT");
      console.log(`Applied migration: ${migration.id} - ${migration.name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    const client = await this.client.connect();
    try {
      await client.query("BEGIN");
      await client.query(migration.down);
      await client.query("DELETE FROM schema_migrations WHERE id = $1", [migration.id]);
      await client.query("COMMIT");
      console.log(`Rolled back migration: ${migration.id} - ${migration.name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async migrate(): Promise<void> {
    await this.initialize();
    const pending = await this.getPendingMigrations();
    
    if (pending.length === 0) {
      console.log("No pending migrations");
      return;
    }

    console.log(`Found ${pending.length} pending migrations`);
    
    for (const migration of pending) {
      await this.applyMigration(migration);
    }

    console.log("All migrations applied successfully");
  }

  async rollback(steps: number = 1): Promise<void> {
    const applied = await this.getAppliedMigrations();
    const toRollback = applied.reverse().slice(0, steps);

    console.log(`Rolling back ${toRollback.length} migrations`);

    for (const id of toRollback) {
      const migration = migrations.find((m) => m.id === id);
      if (migration) {
        await this.rollbackMigration(migration);
      }
    }

    console.log("Rollback completed");
  }

  async status(): Promise<void> {
    await this.initialize();
    const applied = await this.getAppliedMigrations();
    const pending = await this.getPendingMigrations();

    console.log("\n=== Migration Status ===\n");
    console.log(`Applied: ${applied.length}`);
    console.log(`Pending: ${pending.length}`);
    
    if (applied.length > 0) {
      console.log("\nApplied migrations:");
      applied.forEach((id) => console.log(`  - ${id}`));
    }
    
    if (pending.length > 0) {
      console.log("\nPending migrations:");
      pending.forEach((m) => console.log(`  - ${m.id}: ${m.name}`));
    }
    console.log("");
  }
}

export async function runMigrations(config: {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}, command: "up" | "down" | "status" = "up", steps?: number): Promise<void> {
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
  });

  try {
    await client.connect();
    const runner = new MigrationRunner(client);

    switch (command) {
      case "up":
        await runner.migrate();
        break;
      case "down":
        await runner.rollback(steps ?? 1);
        break;
      case "status":
        await runner.status();
        break;
    }
  } finally {
    await client.end();
  }
}
