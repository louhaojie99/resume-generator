# 前端工程师简历生成器

专为前端工程师打造的开源简历制作工具。结合了 AI 智能优化功能，助你快速生成专业、美观的简历。

## ✨ 主要功能

*   **前端专用模板**：针对前端技术栈（Skills, Projects）优化的垂直布局，清晰展示核心竞争力。
*   **AI 智能辅助**：集成 Google Gemini 模型，支持一键优化个人总结、润色工作经历。
*   **所见即所得**：实时预览编辑效果，支持自动分页模拟（A4 标准）。
*   **多格式导出**：支持导出高清 PDF (A4)、Markdown (适合技术博客/GitHub) 和 Word 格式。
*   **隐私安全**：所有简历数据仅存储在浏览器本地 (localStorage)，不上传服务器。

## 🚀 技术栈

*   React 19 + TypeScript
*   Tailwind CSS
*   Google Gemini API (@google/genai)
*   html2pdf.js / Lucide React

## 🛠️ 部署与使用

### Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo%2Fdevresume&env=API_KEY)

1.  点击上方按钮部署到 Vercel。
2.  在部署设置中配置 Environment Variable: `API_KEY` (Gemini API Key)。
3.  等待部署完成即可访问。

### GitHub Pages / 静态部署

本项目纯前端实现，适配 GitHub Pages 部署。

1.  Clone 本仓库。
2.  配置 `process.env.API_KEY` (如需使用 AI 功能，需在构建工具中配置 define 插件或环境变量)。
3.  构建并部署到静态服务器或 GitHub Pages。

## 📄 开源协议

MIT License. 欢迎 Fork 和 Star！