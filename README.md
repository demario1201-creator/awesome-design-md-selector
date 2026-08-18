# 前端风格选择器 · Frontend Style Selector

[![Brands](https://img.shields.io/badge/brands-74-blue)](https://github.com/VoltAgent/awesome-design-md)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Built with](https://img.shields.io/badge/pure--frontend-✓-green)](https://github.com/demario1201-creator/awesome-design-md-selector)
[![License](https://img.shields.io/badge/license-TBD-lightgrey)](https://github.com/demario1201-creator/awesome-design-md-selector)

浏览 74 个真实品牌的设计语言，在真实业务页面上即时预览、叠加动效、一键导出符合规范的 `DESIGN.md`，还能用 AI 把任意风格润色成你自己的设计系统文档。

## 为什么用这个工具

挑选前端风格不该靠想象。本工具把 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 中 74 个知名品牌的真实设计系统文档，变成可搜索、可预览、可复用的交互资产：你选中一个品牌，右侧模拟浏览器窗口立刻换上它的设计令牌；叠加动效看真实表现；满意后导出一份与上游逐字节一致的 `DESIGN.md`，或交给 AI 融合你的需求重写一版。

## 核心特性

- **74 个真实品牌设计系统**：内置来自 `VoltAgent/awesome-design-md` 的 74 份即用型 `DESIGN.md`，覆盖 AI / LLM、开发者工具、金融科技、汽车、媒体等 11 大类别（Claude、Stripe、Notion、Figma、Tesla、Apple、Binance 等）。
- **所见即所得的即时预览**：内置首页 / 产品轮播 / 登录 / 注册 4 个真实业务页面，切换风格后预览 < 100ms 重建生效，全程无需刷新页面。
- **明暗双主题**：自动识别原生暗色品牌，对浅色品牌注入中性暗色覆盖，一键在亮 / 暗之间切换对比。
- **15 种动效预设**：覆盖入场浮现、Hero 错峰、自动轮播、能力跑马灯、数字生长、3D 倾斜、卡片翻转等，可叠加在预览上直观比较效果。
- **中英双语**：界面与导出文档均支持中文 / English 切换。
- **一键导出规范文档**：严格遵循 awesome-design-md 格式（YAML frontmatter + 9 个标准章节），与上游原始文件一致，100% 保真，可回灌复用。
- **AI 润色重写**：直连 DeepSeek，输入自定义需求即可融合基础风格重写完整 `DESIGN.md`。API Key 仅存于内存，刷新即清空，不写入任何本地存储。
- **安全隔离预览**：预览基于 `<iframe>` 的 `sandbox` + `srcdoc`，74 个风格的设计令牌互不污染，无第三方脚本注入风险。
- **纯前端 · 零后端**：无数据库、无服务端，可静态部署到任意平台。

## 快速开始

```bash
git clone https://github.com/demario1201-creator/awesome-design-md-selector.git
cd awesome-design-md-selector
npm install
npm run dev
```

打开 http://localhost:3000 即可。`predev` / `prebuild` 会自动运行 `build-styles` 脚本解析并生成风格数据。

### 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发（自动构建风格数据） |
| `npm run build` | 生产构建 |
| `npm run build-styles` | 重新解析 74 份 DESIGN.md 生成 `data/styles.json` |

## 技术栈

Next.js 14（App Router）· TypeScript · Tailwind CSS · zustand · lucide-react

纯客户端应用：设计令牌在构建期解析为静态数据，预览通过 iframe 注入 CSS 变量驱动，主包因此保持轻量。

## 典型工作流

1. 在左侧浏览或搜索 74 种风格，选中其一，右侧预览窗口即时换肤。
2. 叠加一种动效，在匹配的页面 Tab 上查看真实表现。
3. （可选）填入 DeepSeek API Key 与自定义想法，点击 AI 润色生成重写版 `DESIGN.md`。
4. 导出：内置内容直接下载，或导出 AI 重写版（`DESIGN-<id>.md` / `DESIGN-<id>-ai.md`）。

## 数据来源与致谢

本项目的数据与格式规范参考并内置自 **[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** —— 一个汇集 74 个知名品牌网站设计系统 `DESIGN.md` 的开源仓库。

- 74 份 `DESIGN.md` 原文来自该仓库；本工具在其之上提供浏览、搜索、即时预览、动效叠加、导出与 AI 润色能力。
- 导出文件严格沿用其 YAML frontmatter + 9 章节正文规范，确保与上游兼容、可回灌复用。
- 预览 Demo 使用虚构品牌内容，不模仿任何真实品牌，避免版权与误导。

## 许可证

本项目当前**未指定开源许可证**。若计划公开复用，建议补充 MIT 等宽松许可证（新增 `LICENSE` 文件即可）。在明确许可证前，使用与分发请先联系作者。
