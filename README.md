# 🧠 Humanity - 心理测试平台

[![GitHub Pages](https://img.shields.io/badge/部署-GitHub Pages-blue?style=flat-square)](https://yourusername.github.io/humanity)
[![HTML5](https://img.shields.io/badge/HTML5-✓-orange?style=flat-square)](https://developer.mozilla.org/zh-CN/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-✓-blue?style=flat-square)](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=flat-square)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/yourusername/humanity?style=flat-square)](https://github.com/yourusername/humanity/commits/main)

---

## 📖 项目简介

**Humanity** 是一个专业的心理测试静态网站应用，采用现代深色主题设计，结合心理学测试产品的专业性与科技感。项目基于原生 HTML/CSS/JavaScript 构建，无需复杂的构建工具即可运行，部署简便。

### 核心特性

| 特性 | 说明 |
|------|------|
| 🎯 **专业心理测试** | MBTI、大五人格、DISC、情商、焦虑/抑郁筛查等多维度测评 |
| ✨ **精美动画效果** | Three.js 3D粒子背景，GSAP流畅过渡动画 |
| ⏱️ **答题辅助** | 计时器、题目导航、答题进度自动保存 |
| 📊 **多维度评分** | 维度累加法评分逻辑，科学分析测试结果 |
| 💾 **本地隐私** | LocalStorage本地存储，保护用户隐私 |
| 📱 **响应式设计** | 完美适配移动端、平板和桌面端 |

---

## 🚀 快速开始

### 本地运行

```bash
# 方法1：直接打开
# 双击 index.html 或在浏览器中打开即可

# 方法2：使用 Python 本地服务器
python -m http.server 8080

# 方法3：使用 Node.js http-server
npx http-server -p 8080
```

然后访问：`http://localhost:8080`

---

## 📤 部署到 GitHub Pages

本项目使用手动部署方式，步骤如下：

1. **推送代码到 GitHub**
   ```bash
   git add -A
   git commit -m "更新内容描述"
   git push origin main
   ```

2. **配置 GitHub Pages**
   - 进入仓库 → Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，目录选择 "/(root)"
   - 点击 Save 保存

3. **等待部署完成**
   - 部署通常需要 1-2 分钟
   - 完成后即可通过 `https://yourusername.github.io/humanity/` 访问

---

## 📂 项目结构

```
humanity/
├── 📄 HTML 页面
│   ├── index.html          # 入口页面（重定向）
│   ├── splash.html         # 启动页（品牌展示+动画）
│   ├── welcome.html        # 欢迎页（功能导航）
│   ├── list.html           # 测试列表页（分类浏览）
│   ├── test.html           # 测试答题页（核心交互）
│   ├── result.html         # 结果展示页（数据分析）
│   └── profile.html        # 个人中心页（历史记录）
│
├── 🎨 样式文件
│   └── css/
│       └── styles.css      # 统一样式系统（~2000行）
│
├── ⚙️ JavaScript 脚本
│   ├── js/
│   │   ├── data.js              # 题库数据（300+题目）
│   │   ├── components/
│   │   │   └── particle-bg.js   # Three.js 粒子背景
│   │   └── utils/
│   │       ├── helpers.js       # 工具函数库
│   │       └── storage.js       # LocalStorage 封装
│
└── 📝 文档
    ├── README.md            # 项目说明
    └── .gitignore          # Git 忽略配置
```

---

## 🎯 功能模块

### 已上线测试

| 测试类型 | 题目数 | 评估维度 | 难度等级 |
|---------|--------|---------|---------|
| MBTI 人格测试 | 80 | 4×2 | 1-2级 |
| 大五人格测试 | 60 | 5 | 1-2级 |
| DISC 行为风格 | 40 | 4 | 1级 |
| 情商详细版 | 50 | 5 | 1-4级 |
| 焦虑筛查(GAD-7) | 7 | 1 | 1级 |
| 抑郁筛查(PHQ-9) | 9 | 1 | 1级 |
| 爱情语言测试 | 30 | 5 | 1级 |
| 压力水平评估 | 25 | 3 | 1-2级 |
| 职业倾向测试 | 35 | 4 | 1-2级 |
| 学习风格测试 | 30 | 4 | 1级 |

### 核心功能

1. **启动页** - 品牌展示 + 3D粒子动画
2. **欢迎页** - 六大分类导航卡片
3. **测试列表** - 分类筛选 + 难度标识
4. **答题界面** - 计时器 + 进度条 + 题目导航
5. **结果页** - 多维度柱状图 + 详细分析
6. **个人中心** - 测试历史 + 统计分析

---

## 🔧 技术实现

### 技术栈

```
┌─────────────────────────────────────────────┐
│                  表现层                      │
│  HTML5 │ CSS3 (CSS Variables │ Grid │ Flexbox) │
├─────────────────────────────────────────────┤
│                  交互层                      │
│  JavaScript ES6+ │ DOM API │ LocalStorage   │
├─────────────────────────────────────────────┤
│                  动画层                      │
│  Three.js (3D粒子) │ GSAP (过渡动画)        │
├─────────────────────────────────────────────┤
│                  部署层                      │
│  GitHub Pages │ Git 版本控制                │
└─────────────────────────────────────────────┘
```

### 核心设计

#### 1. CSS 设计系统

```css
:root {
  /* 色彩系统 */
  --primary: #ed751c;    /* 主色调-橙色 */
  --secondary: #0ea5e9; /* 辅助色-蓝色 */
  --accent: #d946ef;     /* 点缀色-紫色 */
  
  /* 间距系统 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* 过渡动画 */
  --transition-fast: 0.2s;
  --transition-bounce: 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

#### 2. 响应式断点

| 设备类型 | 宽度范围 | 布局特点 |
|---------|---------|---------|
| 桌面端 | ≥1200px | 3列网格 |
| 平板端 | 768-1199px | 2列网格 |
| 竖屏平板 | 480-767px | 1-2列 |
| 手机端 | <480px | 单列流式 |

#### 3. 评分算法

采用**维度累加法**：
- 每道题目对应特定维度
- 用户选择累加到对应维度得分
- 最终按维度得分比例计算百分位

---

## 🌟 扩展方向

> ⚠️ 以下为未来规划，非当前部署功能

### 1. 小程序开发 📱

- 微信小程序适配
- 支付宝小程序适配
- 抖音小程序适配

### 2. 后端集成 🖥️

- 用户注册/登录系统
- 云端数据同步
- 成绩排行榜

### 3. API 服务化 ☁️

- RESTful API 设计
- GraphQL 支持
- WebSocket 实时通信

### 4. 功能增强 🚀

- 测试结果分享海报生成
- 历史数据统计分析图表
- 用户自定义测试创建
- 社区讨论功能
- AI 智能推荐测试

### 5. 技术升级 ⚡

- PWA 离线支持
- Service Worker 缓存
- Web Worker 多线程
- WebGL 高级动画

---

## 👥 面向用户群体

| 用户类型 | 使用场景 | 价值点 |
|---------|---------|--------|
| 学生 | 自我认知、生涯规划 | 了解性格特点、职业倾向 |
| 职场人士 | 团队协作、职业发展 | 优化沟通方式、提升效率 |
| 心理咨询师 | 辅助评估、科普工具 | 快速筛查、专业参考 |
| 教育机构 | 心理普查、团体测试 | 大规模施测、数据统计 |
| 企业 HR | 招聘选拔、团队配置 | 人才评估、岗位匹配 |

### 商业应用场景

1. **在线教育平台** - 学员心理测评
2. **企业 HR 系统** - 员工心理健康管理
3. **心理咨询机构** - 初步筛查工具
4. **高校心理中心** - 新生心理普查
5. **社交应用** - 用户兴趣匹配

---

## 🤝 贡献指南

### 欢迎贡献

我们欢迎各种形式的贡献，包括但不限于：

- 🐛 Bug 报告
- 💡 功能建议
- 📝 文档完善
- 💻 代码贡献
- 🎨 UI/UX 改进

### 提交流程

```bash
# 1. Fork 仓库
# 2. 创建特性分支
git checkout -b feature/your-feature

# 3. 提交更改
git commit -m 'Add: 新功能描述'

# 4. 推送分支
git push origin feature/your-feature

# 5. 创建 Pull Request
```

### 代码规范

- 使用 2 空格缩进
- 遵循 ES6+ 语法规范
- 变量命名使用 camelCase
- CSS 类名使用 kebab-case

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

- [Three.js](https://threejs.org/) - 3D 粒子动画
- [GSAP](https://greensock.com/gsap/) - 高性能动画
- [Google Fonts](https://fonts.google.com/) - 字体资源

---

<div align="center">
  
Made with ❤️ for better understanding of human nature

</div>
