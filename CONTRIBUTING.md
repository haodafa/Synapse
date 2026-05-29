# 贡献指南

感谢您有兴趣为 Synapse 做出贡献！

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/haodafa/Synapse.git
cd synapse
```

2. 安装依赖
```bash
npm install
```

3. 构建项目
```bash
npm run build
```

4. 启动开发服务器
```bash
npm run dev
```

## 提交代码

请遵循以下步骤：

1. 从 main 分支创建新分支
```bash
git checkout -b feature/amazing-feature
```

2. 进行更改
3. 运行测试
```bash
npm run test
npm run typecheck
```

4. 提交更改
```bash
git add .
git commit -m "Add: description of your changes"
```

5. 推送到分支
```bash
git push origin feature/amazing-feature
```

6. 创建 Pull Request

## 代码规范

- 使用 TypeScript
- 遵循 ESLint 规范
- 为新功能添加测试
- 更新相关文档

## 报告问题

如果发现问题，请在 GitHub Issues 中报告。
