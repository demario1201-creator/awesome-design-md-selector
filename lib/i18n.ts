// i18n system - lightweight translation dictionary
// Works in both React components (useT hook) and string templates (t function)

import { useCallback } from "react";
import { useStore } from "./store";
import type { Lang } from "./types";

export const LANGS: Lang[] = ["zh", "en"];
export const LANG_STORAGE_KEY = "fss-lang";
export const THEME_STORAGE_KEY = "fss-preview-theme";

interface Entry {
  zh: string;
  en: string;
}

export const dict = {
  // ---- App shell (page.tsx) ----
  "app.title": { zh: "风格选择器", en: "Style Selector" },
  "app.titleFull": { zh: "前端风格选择器", en: "Frontend Style Selector" },
  "app.stylesCount": { zh: "{n} 种风格", en: "{n} styles" },
  "app.fallback": { zh: "回退", en: "fallback" },
  "app.ai": { zh: "AI 润色", en: "AI Polish" },
  "app.expandSidebar": { zh: "展开侧边栏", en: "Expand sidebar" },
  "app.collapseSidebar": { zh: "收起侧边栏", en: "Collapse sidebar" },
  "app.langSwitchToEn": { zh: "EN", en: "中" },
  "app.langAria": { zh: "切换语言", en: "Switch language" },

  // ---- Search (StyleList) ----
  "search.placeholder": { zh: "搜索风格...", en: "Search styles..." },
  "search.aria": { zh: "搜索风格", en: "Search styles" },
  "search.clearAria": { zh: "清除搜索条件", en: "Clear search query" },
  "search.count": { zh: "{filtered} / {total} 种风格", en: "{filtered} / {total} styles" },
  "search.empty": { zh: '未找到与 "{q}" 匹配的风格', en: 'No styles found for "{q}"' },

  // ---- Categories (StyleList, display only) ----
  "cat.AI & LLM": { zh: "AI 与大模型", en: "AI & LLM" },
  "cat.Developer Tools": { zh: "开发工具", en: "Developer Tools" },
  "cat.Backend & DevOps": { zh: "后端与运维", en: "Backend & DevOps" },
  "cat.Productivity & SaaS": { zh: "效率与 SaaS", en: "Productivity & SaaS" },
  "cat.Design & Creative": { zh: "设计与创意", en: "Design & Creative" },
  "cat.Fintech & Crypto": { zh: "金融科技与加密", en: "Fintech & Crypto" },
  "cat.E-commerce & Retail": { zh: "电商与零售", en: "E-commerce & Retail" },
  "cat.Media & Consumer Tech": { zh: "媒体与消费科技", en: "Media & Consumer Tech" },
  "cat.Automotive": { zh: "汽车", en: "Automotive" },
  "cat.Retro Web": { zh: "复古网页", en: "Retro Web" },
  "cat.Other": { zh: "其他", en: "Other" },

  // ---- Animations (AnimationList) ----
  "animations.title": { zh: "动画", en: "Animations" },
  "animations.none": { zh: "无", en: "None" },
  "animations.appliesTo": { zh: "适用于: {pages}", en: "Applies to: {pages}" },
  "anim.scroll-reveal.name": { zh: "滚动浮现", en: "Scroll Reveal" },
  "anim.scroll-reveal.desc": { zh: "页面元素随滚动进入视口时淡入上移", en: "Fade-in and rise as elements scroll into view" },
  "anim.scroll-reveal.position": { zh: "首页各内容区块（Logo 墙、特性卡片、推荐语、页脚）", en: "Home content sections (logo wall, feature cards, testimonials, footer)" },
  "anim.scroll-reveal.effect": { zh: "元素从下方 24px 淡入上移，进入视口时触发", en: "Elements fade in and rise 24px when entering the viewport" },
  "anim.hero-staggered.name": { zh: "Hero 错峰入场", en: "Hero Staggered" },
  "anim.hero-staggered.desc": { zh: "Hero 区标题、副标题、CTA 按钮逐项延迟入场", en: "Title, subtitle and CTA enter sequentially" },
  "anim.hero-staggered.position": { zh: "首页 Hero 区域（标签、标题、副标题、CTA 按钮、预览窗口）", en: "Home hero section (badge, title, subtitle, CTAs, preview window)" },
  "anim.hero-staggered.effect": { zh: "各元素以 80ms 间隔依次从下方 20px 淡入上移", en: "Elements rise 20px and fade in sequentially at 80ms intervals" },
  "anim.auto-carousel.name": { zh: "自动轮播产品展示", en: "Auto Carousel" },
  "anim.auto-carousel.desc": { zh: "产品幻灯片自动切换播放", en: "Product slides auto-rotate" },
  "anim.auto-carousel.position": { zh: "产品页顶部轮播区域", en: "Top carousel area of the product page" },
  "anim.auto-carousel.effect": { zh: "3 张产品幻灯片每 3 秒自动切换，支持左右箭头和圆点控制", en: "3 slides auto-rotate every 3s; arrows and dots supported" },
  "anim.capability-marquee.name": { zh: "能力跑马灯", en: "Capability Marquee" },
  "anim.capability-marquee.desc": { zh: "能力标签横向无限循环滚动", en: "Infinite horizontal scrolling tags" },
  "anim.capability-marquee.position": { zh: "首页技术栈标签区域", en: "Tech stack tags section on home page" },
  "anim.capability-marquee.effect": { zh: "12 个技术标签以 40px/s 速度横向无限循环滚动，鼠标悬停时暂停", en: "12 tags scroll left at 40px/s in an infinite loop; pause on hover" },
  "anim.number-bar-growth.name": { zh: "数字/条形生长与悬停微交互", en: "Count-up & Hover Growth" },
  "anim.number-bar-growth.desc": { zh: "数字 count-up 动画 + 卡片 hover 缩放效果", en: "Count-up numbers plus hover-scale cards" },
  "anim.number-bar-growth.position": { zh: "首页数据统计区域（4 项指标）+ 特性卡片", en: "Stats section (4 metrics) and feature cards on home page" },
  "anim.number-bar-growth.effect": { zh: "数字从 0 count-up 到目标值，底部进度条从左展开，卡片 hover 放大 1.03 倍", en: "Numbers count up from 0, bars grow from left, cards scale 1.03x on hover" },
  "anim.auth-split-entrance.name": { zh: "分栏对称入场", en: "Split Panel Entrance" },
  "anim.auth-split-entrance.desc": { zh: "登录/注册左右分栏从两侧滑入，视觉区先至、表单卡错峰 120ms", en: "Auth panels slide in from opposite sides, visual first then form" },
  "anim.auth-split-entrance.position": { zh: "认证页左右分栏区域", en: "Left/right split panels of the auth pages" },
  "anim.auth-split-entrance.effect": { zh: "左侧视觉区从左滑入，右侧表单卡从右滑入，间隔 120ms", en: "Visual panel slides in from left, form card from right, 120ms apart" },
  "anim.form-fields-reveal.name": { zh: "表单字段错峰浮现", en: "Form Field Reveal" },
  "anim.form-fields-reveal.desc": { zh: "登录/注册表单字段组逐项淡入上移，营造填写引导节奏", en: "Form fields fade in sequentially to guide the eye" },
  "anim.form-fields-reveal.position": { zh: "认证页表单字段组", en: "Form field groups on auth pages" },
  "anim.form-fields-reveal.effect": { zh: "每个表单字段以 60ms 间隔从下方 14px 淡入上移", en: "Each field rises 14px and fades in at 60ms intervals" },
  "anim.strength-segments.name": { zh: "密码强度条逐段点亮", en: "Strength Bar Segments" },
  "anim.strength-segments.desc": { zh: "注册页密码强度条四段依次弹出，呼应输入反馈", en: "Password strength bars pop in segment by segment" },
  "anim.strength-segments.position": { zh: "注册页密码强度条", en: "Password strength bar on the register page" },
  "anim.strength-segments.effect": { zh: "4 段强度条以 90ms 间隔依次从底部弹出展开", en: "4 segments pop in from the bottom at 90ms intervals" },
  "anim.parallax-hero.name": { zh: "Hero 视差滚动", en: "Hero Parallax Scroll" },
  "anim.parallax-hero.desc": { zh: "Hero 区视觉元素随页面滚动产生视差位移效果", en: "Hero visual moves at a different speed on scroll" },
  "anim.parallax-hero.position": { zh: "首页 Hero 预览窗口", en: "Hero preview window on the home page" },
  "anim.parallax-hero.effect": { zh: "预览窗口随页面滚动以 0.3 倍速度上下位移，产生视差层次感", en: "Preview window translates at 0.3x scroll speed for a parallax feel" },
  "anim.gradient-animate.name": { zh: "渐变背景流动", en: "Animated Gradient Flow" },
  "anim.gradient-animate.desc": { zh: "Hero 区背景渐变色彩缓慢流动，营造动态氛围", en: "Slowly shifting gradient background in hero section" },
  "anim.gradient-animate.position": { zh: "首页 Hero 区域背景", en: "Hero section background on the home page" },
  "anim.gradient-animate.effect": { zh: "圆锥渐变以 18 秒周期缓慢旋转，营造动态氛围", en: "A conic gradient slowly rotates on an 18s loop" },
  "anim.card-tilt-3d.name": { zh: "卡片 3D 倾斜", en: "3D Card Tilt" },
  "anim.card-tilt-3d.desc": { zh: "特性卡片跟随鼠标移动产生 3D 倾斜效果", en: "Feature cards tilt in 3D following the mouse" },
  "anim.card-tilt-3d.position": { zh: "首页特性卡片区域", en: "Feature cards section on the home page" },
  "anim.card-tilt-3d.effect": { zh: "卡片跟随鼠标位置产生最大 8 度的 3D 倾斜，图标浮出 30px", en: "Cards tilt up to 8 degrees following the mouse; icons lift 30px" },
  "anim.nav-fade-stagger.name": { zh: "导航栏错峰淡入", en: "Nav Stagger Fade" },
  "anim.nav-fade-stagger.desc": { zh: "导航栏各项依次淡入下移，页面加载时营造入场节奏", en: "Nav items fade in sequentially on page load" },
  "anim.nav-fade-stagger.position": { zh: "首页顶部导航栏", en: "Top navigation bar on the home page" },
  "anim.nav-fade-stagger.effect": { zh: "Logo、导航链接、CTA 按钮以 50ms 间隔从上方 10px 淡入下移", en: "Logo, links and CTAs fade in from 10px above at 50ms intervals" },
  "anim.slide-ken-burns.name": { zh: "幻灯片 Ken Burns 缩放", en: "Ken Burns Zoom" },
  "anim.slide-ken-burns.desc": { zh: "当前轮播幻灯片内容缓慢放大，营造电影感焦距推近", en: "Active slide slowly zooms for a cinematic effect" },
  "anim.slide-ken-burns.position": { zh: "产品页轮播幻灯片内容", en: "Active slide content in the product carousel" },
  "anim.slide-ken-burns.effect": { zh: "当前幻灯片的视觉元素在 4 秒内缓慢放大至 1.12 倍，电影感焦距推近", en: "Active slide visuals zoom to 1.12x over 4s for a cinematic feel" },
  "anim.card-flip-hover.name": { zh: "产品卡片翻转", en: "Card Flip on Hover" },
  "anim.card-flip-hover.desc": { zh: "产品卡片鼠标悬停时翻转到背面，展示更多详情", en: "Product cards flip to reveal details on hover" },
  "anim.card-flip-hover.position": { zh: "产品页底部产品卡片网格", en: "Product card grid at the bottom of the product page" },
  "anim.card-flip-hover.effect": { zh: "鼠标悬停时卡片沿 Y 轴翻转 180 度，显示背面详情", en: "Cards rotate 180 degrees on the Y axis on hover to show the back" },
  "anim.badge-bounce-in.name": { zh: "徽章弹跳入场", en: "Badge Bounce-in" },
  "anim.badge-bounce-in.desc": { zh: "产品徽章在页面加载时弹跳入场，吸引视觉注意", en: "Product badges bounce in on page load" },
  "anim.badge-bounce-in.position": { zh: "产品页产品徽章", en: "Product badges on the product page" },
  "anim.badge-bounce-in.effect": { zh: "徽章以弹跳曲线从缩小状态放大入场，附带回弹效果", en: "Badges scale up with a bounce easing curve on entry" },

  // ---- Tabs + preview chrome (PreviewWindow) ----
  "tabs.home": { zh: "首页", en: "Home" },
  "tabs.carousel": { zh: "轮播", en: "Carousel" },
  "tabs.login": { zh: "登录", en: "Login" },
  "tabs.register": { zh: "注册", en: "Register" },
  "preview.selectPrompt": { zh: "请选择一个风格进行预览", en: "Select a style to preview" },
  "preview.refresh": { zh: "刷新预览", en: "Refresh preview" },
  "preview.loading": { zh: "加载中...", en: "Loading..." },
  "preview.animMismatch": { zh: "该动画适用于: {pages}", en: "This animation applies to: {pages}" },
  "preview.themeLight": { zh: "浅色模式", en: "Light mode" },
  "preview.themeDark": { zh: "深色模式", en: "Dark mode" },
  "preview.nativeDark": { zh: "原生深色品牌，主题固定", en: "Native dark brand, theme fixed" },
  "preview.iframeTitle": { zh: "预览", en: "Preview" },
  "preview.animInfo.position": { zh: "位置", en: "Position" },
  "preview.animInfo.effect": { zh: "效果", en: "Effect" },
  "preview.animInfo.dismiss": { zh: "关闭", en: "Dismiss" },

  // ---- AI panel (AIPanel) ----
  "ai.title": { zh: "AI 润色（DeepSeek）", en: "AI Polish (DeepSeek)" },
  "ai.apiKeyLabel": { zh: "DeepSeek API Key（仅存内存，不持久化）", en: "DeepSeek API Key (memory only, never persisted)" },
  "ai.apiKeyAria": { zh: "DeepSeek API Key", en: "DeepSeek API Key" },
  "ai.customIdea": { zh: "自定义需求（可选）", en: "Your custom requirements (optional)" },
  "ai.customIdeaAria": { zh: "AI 自定义需求", en: "Custom requirements for AI" },
  "ai.customIdeaPh": { zh: "例如：让整体更活泼、颜色更明亮，增加深色模式变体...", en: "e.g. Make it more playful with brighter colors, add a dark mode variant..." },
  "ai.polish": { zh: "AI 润色", en: "AI Polish" },
  "ai.polishing": { zh: "润色中...", en: "Polishing..." },
  "ai.loadingRaw": { zh: "正在加载设计文档...", en: "Loading design doc..." },
  "ai.needKey": { zh: "请输入你的 DeepSeek API Key", en: "Please enter your DeepSeek API Key" },
  "ai.unknownError": { zh: "未知错误", en: "Unknown error" },
  "ai.success": { zh: 'AI 重写完成。使用 "导出 AI" 下载文件。', en: 'AI rewrite complete. Use "Export AI" to download.' },
  "ai.preview": { zh: "预览", en: "Preview" },
  "ai.copy": { zh: "复制", en: "Copy" },
  // deepseek.ts user-visible errors (AI prompt itself is NOT translated)
  "ai.err.noKey": { zh: "需要 API Key", en: "API Key is required" },
  "ai.err.invalidKey": { zh: "API Key 无效，请检查后重试。", en: "Invalid API Key. Please check your DeepSeek API Key and try again." },
  "ai.err.rateLimit": { zh: "请求过于频繁，请稍后重试。", en: "Rate limit exceeded. Please wait a moment and try again." },
  "ai.err.unavailable": { zh: "DeepSeek 服务暂时不可用，请稍后重试。", en: "DeepSeek service is temporarily unavailable. Please try again later." },
  "ai.err.http": { zh: "请求失败（HTTP {status}）。{body}", en: "Request failed (HTTP {status}). {body}" },
  "ai.err.timeout": { zh: "请求超时（30 秒），请检查网络后重试。", en: "Request timed out (30s). Please check your network and try again." },
  "ai.err.unexpected": { zh: "调用 AI 服务时发生意外错误。", en: "An unexpected error occurred while calling the AI service." },
  "ai.err.empty": { zh: "AI 返回空响应，请重试。", en: "AI returned an empty response. Please try again." },
  "ai.err.loadRaw": { zh: "加载设计文档失败", en: "Failed to load design doc" },

  // ---- Export (ExportButton) ----
  "export.export": { zh: "导出", en: "Export" },
  "export.exportAI": { zh: "导出 AI", en: "Export AI" },
  "export.loading": { zh: "准备中...", en: "Preparing..." },
  "export.validation": { zh: "校验问题: {issues}。你仍可下载文件。", en: "Validation issues: {issues}. You can still download the file." },
  "export.preview": { zh: "预览", en: "Preview" },
  "export.previewOriginal": { zh: "原文", en: "Original" },
  "export.previewAI": { zh: "AI 润色", en: "AI Polish" },
  "export.previewLoading": { zh: "加载中...", en: "Loading..." },
  "export.previewError": { zh: "加载失败: {msg}", en: "Failed to load: {msg}" },
  "export.previewDownload": { zh: "下载此文件", en: "Download this file" },

  // ---- Demo pages: shared nav (iframeContent) ----
  "demo.brand": { zh: "Nova", en: "Nova" },
  "demo.nav.product": { zh: "产品", en: "Product" },
  "demo.nav.features": { zh: "功能", en: "Features" },
  "demo.nav.pricing": { zh: "定价", en: "Pricing" },
  "demo.nav.docs": { zh: "文档", en: "Docs" },
  "demo.nav.signIn": { zh: "登录", en: "Sign in" },
  "demo.nav.startFree": { zh: "免费试用", en: "Start free" },
  "demo.nav.products": { zh: "产品", en: "Products" },
  "demo.nav.collections": { zh: "系列", en: "Collections" },
  "demo.nav.deals": { zh: "优惠", en: "Deals" },
  "demo.nav.support": { zh: "支持", en: "Support" },
  "demo.nav.cart": { zh: "购物车 ({n})", en: "Cart ({n})" },
  "demo.nav.account": { zh: "账户", en: "Account" },

  // ---- Demo: Home page ----
  "demo.home.eyebrow": { zh: "全新 · Nova 2.0 发布", en: "New · Nova 2.0 is here" },
  "demo.home.heroTitle": { zh: "更快构建。更聪明交付。", en: "Build faster. Ship smarter." },
  "demo.home.heroSubtitle": { zh: "面向现代开发团队的一体化平台。从想法到上线，仅需更少时间。", en: "The all-in-one platform for modern development teams. From idea to production in record time." },
  "demo.home.ctaStart": { zh: "立即开始", en: "Get started" },
  "demo.home.ctaDemo": { zh: "观看演示", en: "Watch demo" },
  "demo.home.f1Title": { zh: "闪电般快速", en: "Lightning Fast" },
  "demo.home.f1Desc": { zh: "秒级部署，基于优化基础设施。无需配置，推送即可上线。", en: "Deploy in seconds with our optimized infrastructure. No configuration needed, just push and go live." },
  "demo.home.f2Title": { zh: "默认安全", en: "Secure by Default" },
  "demo.home.f2Desc": { zh: "企业级安全内置于每一层。SOC2 合规，端到端加密。", en: "Enterprise-grade security built into every layer. SOC2 compliant with end-to-end encryption." },
  "demo.home.f3Title": { zh: "全球边缘", en: "Global Edge" },
  "demo.home.f3Desc": { zh: "300+ 全球边缘节点。让每个用户都获得最快体验。", en: "Serve content from 300+ edge locations worldwide. Fastest experience everywhere." },
  "demo.home.stat1": { zh: "活跃开发者", en: "Active Developers" },
  "demo.home.stat2": { zh: "可用性 %", en: "Uptime %" },
  "demo.home.stat3": { zh: "边缘节点", en: "Edge Locations" },
  "demo.home.stat4": { zh: "百万请求/天", en: "M Requests/Day" },
  "demo.home.logoWall": { zh: "深受全球团队信赖", en: "Trusted by teams at" },
  "demo.home.logo1": { zh: "声屿", en: "Acme" },
  "demo.home.logo2": { zh: "微光", en: "Lumen" },
  "demo.home.logo3": { zh: "千帆", en: "Sailfin" },
  "demo.home.logo4": { zh: "启明", en: "Northstar" },
  "demo.home.logo5": { zh: "磐石", en: "Bedrock" },
  "demo.home.logo6": { zh: "恒川", en: "Riverton" },
  "demo.home.test1Quote": { zh: '"Nova 让我们的发布周期从两周缩短到一天。"', en: '"Nova cut our release cycle from two weeks to one day."' },
  "demo.home.test1Name": { zh: "林晓 · 某某科技 CTO", en: "Alex Chen · CTO at Acme Corp" },
  "demo.home.test2Quote": { zh: '"团队上手极快，协作体验无与伦比。"', en: '"The team onboarded in hours. The collaboration experience is unmatched."' },
  "demo.home.test2Name": { zh: "王芳 · 某某设计负责人", en: "Sam Rivera · Head of Design at Lumen" },

  // ---- Demo: Footer ----
  "demo.footer.product": { zh: "产品", en: "Product" },
  "demo.footer.company": { zh: "公司", en: "Company" },
  "demo.footer.resources": { zh: "资源", en: "Resources" },
  "demo.footer.features": { zh: "功能", en: "Features" },
  "demo.footer.pricing": { zh: "定价", en: "Pricing" },
  "demo.footer.changelog": { zh: "更新日志", en: "Changelog" },
  "demo.footer.roadmap": { zh: "路线图", en: "Roadmap" },
  "demo.footer.about": { zh: "关于", en: "About" },
  "demo.footer.blog": { zh: "博客", en: "Blog" },
  "demo.footer.careers": { zh: "招聘", en: "Careers" },
  "demo.footer.contact": { zh: "联系我们", en: "Contact" },
  "demo.footer.docs": { zh: "文档", en: "Documentation" },
  "demo.footer.api": { zh: "API 参考", en: "API Reference" },
  "demo.footer.community": { zh: "社区", en: "Community" },
  "demo.footer.support": { zh: "支持", en: "Support" },
  "demo.footer.tagline": { zh: "面向现代开发团队的一体化平台。", en: "The all-in-one platform for modern development teams." },
  "demo.footer.copy": { zh: "版权所有 © 2024 Nova Inc. 保留所有权利。", en: "Copyright 2024 Nova Inc. All rights reserved." },

  // ---- Demo: Carousel page ----
  "demo.carousel.title": { zh: "精选产品", en: "Featured Products" },
  "demo.carousel.learnMore": { zh: "了解更多", en: "Learn more" },
  "demo.carousel.allProducts": { zh: "全部产品", en: "All Products" },
  "demo.carousel.addToCart": { zh: "加入购物车", en: "Add to cart" },
  "demo.carousel.badgeNew": { zh: "新品", en: "New" },
  "demo.carousel.badgePopular": { zh: "热门", en: "Popular" },
  "demo.carousel.badgeFree": { zh: "免费", en: "Free" },
  "demo.carousel.badgeSale": { zh: "促销", en: "Sale" },
  "demo.carousel.rating": { zh: "评分", en: "Rating" },
  "demo.carousel.s1Name": { zh: "Nova Pro", en: "Nova Pro" },
  "demo.carousel.s1Desc": { zh: "面向资深开发者的专业级工具。含高级分析与团队协作。", en: "Professional-grade tools for serious developers. Includes advanced analytics and team collaboration." },
  "demo.carousel.s2Name": { zh: "Nova Team", en: "Nova Team" },
  "demo.carousel.s2Desc": { zh: "团队所需的一切协作与快速交付能力。", en: "Everything your team needs to collaborate and ship faster." },
  "demo.carousel.s3Name": { zh: "Nova Starter", en: "Nova Starter" },
  "demo.carousel.s3Desc": { zh: "适合独立开发者与小项目。免费起步，随成长升级。", en: "Perfect for individual developers and small projects. Free to start, upgrade as you grow." },
  "demo.carousel.p1Name": { zh: "Nova CLI", en: "Nova CLI" },
  "demo.carousel.p1Desc": { zh: "快速部署的命令行工具", en: "Command-line interface for rapid deployment" },
  "demo.carousel.p2Name": { zh: "Nova SDK", en: "Nova SDK" },
  "demo.carousel.p2Desc": { zh: "自定义集成的软件开发工具包", en: "Software development kit for custom integrations" },
  "demo.carousel.p3Name": { zh: "Nova API", en: "Nova API" },
  "demo.carousel.p3Desc": { zh: "程序化访问的 RESTful API", en: "RESTful API for programmatic access" },

  // ---- Demo: Login page ----
  "demo.login.title": { zh: "欢迎回来", en: "Welcome back" },
  "demo.login.subtitle": { zh: "登录你的账户以继续", en: "Sign in to your account to continue" },
  "demo.login.email": { zh: "邮箱", en: "Email" },
  "demo.login.password": { zh: "密码", en: "Password" },
  "demo.login.pwdPh": { zh: "请输入密码", en: "Enter your password" },
  "demo.login.remember": { zh: "记住我", en: "Remember me" },
  "demo.login.forgot": { zh: "忘记密码？", en: "Forgot password?" },
  "demo.login.submit": { zh: "登录", en: "Sign in" },
  "demo.login.errLabel": { zh: "密码（错误状态演示）", en: "Password (Error State Demo)" },
  "demo.login.errShort": { zh: "密码长度至少为 8 个字符", en: "Password must be at least 8 characters" },
  "demo.login.togglePwd": { zh: "显示/隐藏密码", en: "Show/Hide password" },
  "demo.login.noAccount": { zh: "还没有账户？", en: "Don't have an account?" },
  "demo.login.signUp": { zh: "注册", en: "Sign up" },
  "demo.login.oauthDivider": { zh: "或使用以下方式登录", en: "or continue with" },
  "demo.login.google": { zh: "使用 Google 登录", en: "Continue with Google" },
  "demo.login.github": { zh: "使用 GitHub 登录", en: "Continue with GitHub" },
  "demo.login.visualTag": { zh: "为现代开发团队打造的一体化平台。", en: "The all-in-one platform for modern development teams." },
  "demo.login.visualQuote": { zh: '"Nova 改变了我们团队的交付方式。"', en: '"Nova transformed how our team ships."' },
  "demo.login.visualName": { zh: "李强 · 某科技工程副总裁", en: "Jordan Lee · VP Engineering" },

  // ---- Demo: Register page ----
  "demo.register.title": { zh: "创建账户", en: "Create your account" },
  "demo.register.subtitle": { zh: "立即开始使用 Nova —— 免费试用 14 天", en: "Start building with Nova today — free for 14 days" },
  "demo.register.fullName": { zh: "姓名", en: "Full Name" },
  "demo.register.confirm": { zh: "确认密码", en: "Confirm Password" },
  "demo.register.pwdPh": { zh: "创建强密码", en: "Create a strong password" },
  "demo.register.confirmPh": { zh: "再次输入密码", en: "Re-enter your password" },
  "demo.register.disabledLabel": { zh: "密码（禁用状态演示）", en: "Password (Disabled State Demo)" },
  "demo.register.disabledPh": { zh: "禁用输入框", en: "Disabled input" },
  "demo.register.agree": { zh: "我同意", en: "I agree to the" },
  "demo.register.terms": { zh: "条款", en: "Terms" },
  "demo.register.and": { zh: "和", en: "and" },
  "demo.register.privacy": { zh: "隐私政策", en: "Privacy Policy" },
  "demo.register.submit": { zh: "创建账户", en: "Create account" },
  "demo.register.disabled": { zh: "禁用按钮演示", en: "Disabled button demo" },
  "demo.register.hasAccount": { zh: "已有账户？", en: "Already have an account?" },
  "demo.register.signIn": { zh: "登录", en: "Sign in" },
  "demo.register.strength": { zh: "密码强度", en: "Password strength" },
  "demo.register.strengthWeak": { zh: "弱", en: "Weak" },
  "demo.register.strengthMed": { zh: "中", en: "Medium" },
  "demo.register.strengthStrong": { zh: "强", en: "Strong" },
} as const;

export type DictKey = keyof typeof dict;

/**
 * Pure translation function - usable in React components AND string templates
 * (e.g. iframeContent.ts HTML generation).
 */
export function t(key: DictKey, lang: Lang, vars?: Record<string, string>): string {
  const entry = dict[key];
  if (!entry) return key;
  let text: string = entry[lang] ?? entry.zh;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  return text;
}

/**
 * React hook: reads current lang from store, returns a bound translation function.
 * Must be called inside client components.
 */
export function useT(): (key: DictKey, vars?: Record<string, string>) => string {
  const lang = useStore((s) => s.lang);
  return useCallback(
    (key: DictKey, vars?: Record<string, string>) => t(key, lang, vars),
    [lang]
  );
}
