# Synapse API Documentation

## Overview

The Synapse API provides a unified interface for managing AI agents, issues, skills, squads, and more. It supports both REST and WebSocket connections for real-time updates.

## Base URL

```
Development: http://localhost:3001
Production: https://api.synapse.ai
```

## Authentication

All API requests require authentication using Bearer tokens:

```bash
Authorization: Bearer <your-api-key>
```

## REST API

### Agents

#### List Agents

```http
GET /api/v1/agents
```

**Query Parameters:**
- `status` (optional): Filter by status (`online`, `offline`, `busy`)
- `provider` (optional): Filter by provider
- `limit` (optional): Maximum number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "agent_abc123",
      "name": "Code Assistant",
      "model": "claude-sonnet-4",
      "provider": "anthropic",
      "status": "online",
      "skills": ["coding", "debugging"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### Get Agent

```http
GET /api/v1/agents/:id
```

**Response:**
```json
{
  "id": "agent_abc123",
  "name": "Code Assistant",
  "model": "claude-sonnet-4",
  "provider": "anthropic",
  "status": "online",
  "skills": ["coding", "debugging"],
  "config": {
    "temperature": 0.7,
    "maxTokens": 4096
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}
```

#### Create Agent

```http
POST /api/v1/agents
```

**Request Body:**
```json
{
  "name": "Code Assistant",
  "model": "claude-sonnet-4",
  "provider": "anthropic",
  "skills": ["coding", "debugging"],
  "config": {
    "temperature": 0.7,
    "systemPrompt": "You are a helpful coding assistant."
  }
}
```

#### Update Agent

```http
PATCH /api/v1/agents/:id
```

**Request Body:**
```json
{
  "name": "Senior Code Assistant",
  "status": "busy",
  "skills": ["coding", "debugging", "refactoring"]
}
```

#### Delete Agent

```http
DELETE /api/v1/agents/:id
```

### Issues

#### List Issues

```http
GET /api/v1/issues
```

**Query Parameters:**
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `assigneeId` (optional): Filter by assignee
- `projectId` (optional): Filter by project
- `search` (optional): Search in title and description
- `limit` (optional): Maximum number of results
- `offset` (optional): Pagination offset

#### Get Issue

```http
GET /api/v1/issues/:id
```

#### Create Issue

```http
POST /api/v1/issues
```

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add OAuth2 support for the application",
  "status": "todo",
  "priority": "high",
  "labels": [
    { "name": "security", "color": "#EF4444" },
    { "name": "feature", "color": "#3B82F6" }
  ],
  "assigneeId": "user_xyz789"
}
```

#### Update Issue

```http
PATCH /api/v1/issues/:id
```

#### Delete Issue

```http
DELETE /api/v1/issues/:id
```

#### Add Comment

```http
POST /api/v1/issues/:id/comments
```

**Request Body:**
```json
{
  "content": "This is a comment on the issue"
}
```

### Skills

#### List Skills

```http
GET /api/v1/skills
```

**Query Parameters:**
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (comma-separated)
- `installed` (optional): Filter by installation status
- `search` (optional): Search in name and description

#### Get Skill

```http
GET /api/v1/skills/:id
```

#### Install Skill

```http
POST /api/v1/skills/:id/install
```

#### Uninstall Skill

```http
POST /api/v1/skills/:id/uninstall
```

#### Create Skill

```http
POST /api/v1/skills
```

**Request Body:**
```json
{
  "name": "GitHub Integration",
  "description": "Integrate with GitHub for PR reviews and issue management",
  "category": "automation",
  "tags": ["github", "automation", "ci/cd"],
  "code": "export default async function(context) { ... }",
  "config": {
    "requiredPermissions": ["repo", "workflow"]
  }
}
```

#### Get Recommendations

```http
GET /api/v1/skills/recommendations
```

**Query Parameters:**
- `userId` (required): User ID for personalization
- `context` (optional): Context for recommendations
- `limit` (optional): Maximum number of recommendations

### Squads

#### List Squads

```http
GET /api/v1/squads
```

#### Get Squad

```http
GET /api/v1/squads/:id
```

#### Create Squad

```http
POST /api/v1/squads
```

**Request Body:**
```json
{
  "name": "Backend Team",
  "description": "Handles all backend development",
  "color": "#3B82F6",
  "members": [
    {
      "userId": "user_abc123",
      "role": "lead"
    },
    {
      "userId": "user_xyz789",
      "role": "member"
    }
  ]
}
```

#### Update Squad

```http
PATCH /api/v1/squads/:id
```

#### Delete Squad

```http
DELETE /api/v1/squads/:id
```

#### Add Member

```http
POST /api/v1/squads/:id/members
```

#### Remove Member

```http
DELETE /api/v1/squads/:id/members/:userId
```

### Projects

#### List Projects

```http
GET /api/v1/projects
```

#### Get Project

```http
GET /api/v1/projects/:id
```

#### Create Project

```http
POST /api/v1/projects
```

**Request Body:**
```json
{
  "name": "Synapse Core",
  "description": "Core functionality for Synapse",
  "key": "SYN"
}
```

### Providers

#### List Providers

```http
GET /api/v1/providers
```

#### Configure Provider

```http
POST /api/v1/providers
```

**Request Body:**
```json
{
  "type": "anthropic",
  "name": "Claude API",
  "apiKey": "sk-ant-...",
  "defaultModel": "claude-sonnet-4-5",
  "config": {
    "maxRetries": 3,
    "timeout": 60000
  }
}
```

### Relay

#### List Peers

```http
GET /api/v1/relay/peers
```

#### Connect Peer

```http
POST /api/v1/relay/connect
```

**Request Body:**
```json
{
  "offerUrl": "synapse://relay/abc123?token=..."
}
```

### Schedule

#### List Scheduled Tasks

```http
GET /api/v1/schedule
```

#### Create Scheduled Task

```http
POST /api/v1/schedule
```

**Request Body:**
```json
{
  "name": "Daily Report",
  "cron": "0 9 * * *",
  "action": {
    "type": "agent",
    "agentId": "agent_abc123",
    "prompt": "Generate daily report"
  }
}
```

### Webhooks

#### List Webhooks

```http
GET /api/v1/webhooks
```

#### Create Webhook

```http
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "name": "GitHub Integration",
  "url": "https://example.com/webhook",
  "events": ["issue.created", "issue.updated", "skill.installed"],
  "secret": "whsec_..."
}
```

## WebSocket API

Connect to: `ws://localhost:3001/ws`

### Authentication

```json
{
  "type": "auth",
  "token": "your-api-key"
}
```

### Event Types

#### synapse.issues.*

```json
{
  "type": "synapse.issues.created",
  "data": {
    "id": "issue_abc123",
    "title": "New Issue",
    "status": "todo"
  }
}
```

#### synapse.agents.*

```json
{
  "type": "synapse.agents.status_changed",
  "data": {
    "agentId": "agent_xyz789",
    "oldStatus": "online",
    "newStatus": "busy"
  }
}
```

#### synapse.skills.*

```json
{
  "type": "synapse.skills.installed",
  "data": {
    "skillId": "skill_abc123",
    "userId": "user_xyz789"
  }
}
```

### Subscribe

```json
{
  "type": "subscribe",
  "channels": ["synapse.issues.*", "synapse.agents.status_changed"]
}
```

### Unsubscribe

```json
{
  "type": "unsubscribe",
  "channels": ["synapse.issues.created"]
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|--------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Internal server error |

## Rate Limits

- **REST API**: 100 requests per minute (authenticated)
- **WebSocket**: 60 messages per minute
- **Bulk operations**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { SynapseClient } from "@synapse/client";

const client = new SynapseClient({
  baseUrl: "http://localhost:3001",
  apiKey: "your-api-key"
});

// List agents
const agents = await client.agents.list({ status: "online" });

// Create issue
const issue = await client.issues.create({
  title: "New Feature",
  description: "Implement new feature",
  priority: "high"
});

// Subscribe to events
client.on("synapse.issues.*", (event) => {
  console.log("Issue event:", event);
});

// Connect via WebSocket
await client.connect();
```

### Python

```python
from synapse import SynapseClient

client = SynapseClient(
    base_url="http://localhost:3001",
    api_key="your-api-key"
)

# List agents
agents = client.agents.list(status="online")

# Create issue
issue = client.issues.create(
    title="New Feature",
    description="Implement new feature",
    priority="high"
)

# Subscribe to events
@client.on("synapse.issues.*")
def handle_issue_event(event):
    print(f"Issue event: {event}")
```

### CLI

```bash
# Set up authentication
synapse auth login --api-key your-api-key

# List agents
synapse agents list --status online

# Create issue
synapse issues create --title "New Feature" --priority high

# Install skill
synapse skills install github-integration

# Create squad
synapse squads create --name "Backend Team" --member user123:lead
```
