# Synapse Deployment Guide

## 概述

本指南提供了 Synapse 项目的完整部署流程，包括本地开发、Docker 部署和 Kubernetes 生产部署。

## 目录

- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [Docker 部署](#docker-部署)
- [Kubernetes 部署](#kubernetes-部署)
- [CI/CD 配置](#cicd-配置)
- [安全指南](#安全指南)

---

## 环境要求

### 开发环境
- Node.js 20+ 或 22+
- npm 10+
- Git
- Docker (可选)

### 生产环境
- Docker / Kubernetes
- PostgreSQL 15+ (带 pgvector 扩展)
- Redis 7+
- 至少 4GB RAM, 2 核 CPU

---

## 本地开发

### 1. 克隆仓库

```bash
git clone <repository-url>
cd synapse
```

### 2. 安装依赖

```bash
npm ci
```

### 3. 运行开发服务

```bash
# 使用 Docker Compose 启动基础设施
cd docker
docker-compose up -d postgres redis

# 返回项目根目录并启动开发服务
cd ..
npm run dev
```

### 4. 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试监视模式
npm run test:watch
```

---

## Docker 部署

### 使用 Docker Compose

1. 配置环境变量（可选）：
```bash
cd docker
cp .env.example .env
# 编辑 .env 文件
```

2. 启动所有服务：
```bash
docker-compose up -d
```

3. 检查服务状态：
```bash
docker-compose ps
docker-compose logs -f
```

4. 访问应用：
- Web UI: http://localhost:3000
- API: http://localhost:8080

### 构建自定义镜像

```bash
# 构建所有镜像
docker build -f docker/Dockerfile --target unified-daemon -t synapse/unified-daemon:latest .
docker build -f docker/Dockerfile --target web -t synapse/web:latest .
docker build -f docker/Dockerfile --target cli -t synapse/cli:latest .
```

---

## Kubernetes 部署

### 1. 准备环境

确保你有一个运行中的 Kubernetes 集群和 `kubectl` 命令行工具。

### 2. 创建 Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 3. 配置 Secrets

**重要**：在生产环境中，不要使用示例的 Secrets 文件！

```bash
# 编辑 k8s/secrets.yaml 文件，设置实际的密码和密钥
# 然后应用：
kubectl apply -f k8s/secrets.yaml

# 或者使用 kubectl 创建 secret：
kubectl create secret generic synapse-secrets \
  --from-literal=postgres-user=synapse \
  --from-literal=postgres-password=your_secure_password \
  --from-literal=redis-password=your_redis_password \
  --from-literal=database-url=postgresql://synapse:your_secure_password@postgres:5432/synapse \
  --from-literal=redis-url=redis://:your_redis_password@redis:6379 \
  -n synapse
```

### 4. 部署基础设施

```bash
# 部署 PostgreSQL
kubectl apply -f k8s/postgres.yaml

# 部署 Redis
kubectl apply -f k8s/redis.yaml

# 检查状态
kubectl get pods -n synapse -w
```

### 5. 部署应用

```bash
# 部署 Unified Daemon
kubectl apply -f k8s/unified-daemon.yaml

# 部署 Web UI
kubectl apply -f k8s/web.yaml
```

### 6. 配置 Ingress（可选）

如果你有 Ingress Controller，你可以使用提供的 Ingress 配置：

```bash
kubectl apply -f k8s/web.yaml
```

**注意**：你需要修改 Ingress 配置中的主机名。

### 7. 检查部署状态

```bash
# 检查 Pod 状态
kubectl get pods -n synapse

# 检查服务
kubectl get svc -n synapse

# 查看日志
kubectl logs -f deployment/unified-daemon -n synapse

# 检查 HPA（自动扩缩）
kubectl get hpa -n synapse
```

---

## CI/CD 配置

### GitHub Actions

项目已经配置了完整的 CI/CD 工作流：

1. **CI Pipeline** (`.github/workflows/ci.yml`)：
   - 运行测试和 Lint 检查
   - 执行安全扫描
   - 构建项目

2. **CD Pipeline** (`.github/workflows/cd.yml`)：
   - 构建并推送 Docker 镜像
   - 自动部署到 Staging
   - 发布版本时部署到 Production

### 配置 Secrets

在 GitHub 仓库中配置以下 Secrets：

- `GITHUB_TOKEN` (自动提供)
- `KUBE_CONFIG` (你的 kubeconfig 文件内容)

### 发布流程

1. 创建一个带版本号的标签：
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

2. 这会自动触发 CD Pipeline，构建并部署到 Staging 环境。

3. 验证 Staging 环境后，如果是正式版本（不含预发布标签），会自动部署到 Production。

---

## 安全指南

### 1. Secrets 管理

- 永远不要将 Secrets 提交到 Git
- 使用 Sealed Secrets, External Secrets Operator 或 HashiCorp Vault 管理密钥
- 定期轮换 Secrets

### 2. 网络安全

- 使用 HTTPS (配置 Ingress 使用 TLS)
- 限制网络流量 (使用 Network Policies)
- 不要直接暴露数据库到公网

### 3. 应用安全

- 保持依赖项最新 (定期运行 `npm audit`)
- 使用安全的密码策略 (已在 `security.ts` 中实现)
- 启用审计日志 (已在 `audit-log.ts` 中实现)
- 实施速率限制 (已在 `security.ts` 中实现)

### 4. 监控和响应

- 设置日志收集 (ELK, Loki, 等)
- 配置告警 (Prometheus + Alertmanager)
- 制定事件响应计划

---

## 故障排除

### 问题：Pod 无法启动

检查 Pod 日志：
```bash
kubectl logs <pod-name> -n synapse
```

检查 Pod 事件：
```bash
kubectl describe pod <pod-name> -n synapse
```

### 问题：数据库连接失败

检查 Postgres Pod：
```bash
kubectl get pods -n synapse -l app=postgres
```

### 问题：健康检查失败

检查服务：
```bash
kubectl get svc -n synapse
kubectl describe svc <service-name> -n synapse
```

---

## 进一步阅读

- [项目 README](../README.md)
- [开发指南](./DEVELOPMENT.md)
- [API 文档](./API.md)
- [架构文档](./SYNAPSE_FUSION_PLAN.md)
