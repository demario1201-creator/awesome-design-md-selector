// 12 animation configurations for the preview window
// Home: 8 animations | Carousel: 4 animations | Auth: 3 animations

import type { AnimationMeta } from "../lib/types";

export const ANIMATIONS: AnimationMeta[] = [
  {
    id: "scroll-reveal",
    name: "滚动浮现",
    description: "页面元素随滚动进入视口时淡入上移",
    position: "首页各内容区块（Logo 墙、特性卡片、推荐语、页脚）",
    effect: "元素从下方 24px 淡入上移，进入视口时触发",
    targetPages: ["home"],
    targetSelector: "[data-animate='scroll-reveal']",
    cssClass: "anim-scroll-reveal",
    jsBehavior: "intersection-observer",
    config: { threshold: 0.2, translateY: 24, duration: 600 },
    css: `
[data-animate="scroll-reveal"] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-animate="scroll-reveal"].is-visible {
  opacity: 1;
  transform: translateY(0);
}
    `,
  },
  {
    id: "hero-staggered",
    name: "Hero 错峰入场",
    description: "Hero 区标题、副标题、CTA 按钮逐项延迟入场",
    position: "首页 Hero 区域（标签、标题、副标题、CTA 按钮、预览窗口）",
    effect: "各元素以 80ms 间隔依次从下方 20px 淡入上移",
    targetPages: ["home"],
    targetSelector: "[data-animate='hero-stagger']",
    cssClass: "anim-hero-stagger",
    jsBehavior: "stagger",
    config: { delay: 80, duration: 500 },
    css: `
.anim-hero-stagger {
  opacity: 0;
  transform: translateY(20px);
  animation: heroStaggerIn 0.5s ease forwards;
}
@keyframes heroStaggerIn {
  to { opacity: 1; transform: translateY(0); }
}
    `,
  },
  {
    id: "auto-carousel",
    name: "自动轮播产品展示",
    description: "产品幻灯片自动切换播放",
    position: "产品页顶部轮播区域",
    effect: "3 张产品幻灯片每 3 秒自动切换，支持左右箭头和圆点控制",
    targetPages: ["carousel"],
    targetSelector: "[data-animate='auto-carousel']",
    cssClass: "anim-auto-carousel",
    jsBehavior: "interval-carousel",
    config: { interval: 3000, easing: "ease-in-out" },
    css: `
.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}
.carousel-slide.is-active {
  opacity: 1;
}
.carousel-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}
.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--brand-border, #e5e5e5);
  cursor: pointer;
  transition: background 0.3s;
}
.carousel-dot.is-active {
  background: var(--brand-primary-text, var(--brand-primary, #171717));
}
    `,
  },
  {
    id: "capability-marquee",
    name: "能力跑马灯",
    description: "能力标签横向无限循环滚动",
    position: "首页技术栈标签区域",
    effect: "12 个技术标签以 40px/s 速度横向无限循环滚动，鼠标悬停时暂停",
    targetPages: ["home"],
    targetSelector: "[data-animate='marquee']",
    cssClass: "anim-marquee",
    jsBehavior: "marquee",
    config: { speed: 40, direction: "left" },
    css: `
.marquee-track {
  display: flex;
  gap: 16px;
  animation: marqueeScroll 20s linear infinite;
  width: max-content;
}
.marquee-track:hover {
  animation-play-state: paused;
}
@keyframes marqueeScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-container {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}
    `,
  },
  {
    id: "number-bar-growth",
    name: "数字/条形生长与悬停微交互",
    description: "数字 count-up 动画 + 卡片 hover 缩放效果",
    position: "首页数据统计区域（4 项指标）+ 特性卡片",
    effect: "数字从 0 count-up 到目标值，底部进度条从左展开，卡片 hover 放大 1.03 倍",
    targetPages: ["home"],
    targetSelector: "[data-animate='count-up'], [data-animate='hover-scale']",
    cssClass: "anim-growth",
    jsBehavior: "count-up",
    config: { duration: 1500, hoverScale: 1.03 },
    css: `
[data-animate-hover="hover-scale"] {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
[data-animate-hover="hover-scale"]:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
.stat-bar {
  height: 4px;
  border-radius: 9999px;
  background: var(--brand-primary-text, var(--brand-primary, #171717));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 1.5s ease;
}
.stat-bar.is-grown {
  transform: scaleX(1);
}
    `,
  },
  {
    id: "auth-split-entrance",
    name: "分栏对称入场",
    description: "登录/注册左右分栏从两侧滑入，视觉区先至、表单卡错峰 120ms",
    position: "认证页左右分栏区域",
    effect: "左侧视觉区从左滑入，右侧表单卡从右滑入，间隔 120ms",
    targetPages: ["login", "register"],
    targetSelector: ".auth-visual, .auth-card",
    cssClass: "anim-auth-split",
    jsBehavior: "stagger",
    config: { delay: 120, duration: 600 },
    css: `
.anim-auth-split {
  opacity: 0;
}
.auth-visual.anim-auth-split {
  animation: authSlideLeft 0.6s cubic-bezier(0.22, 0.8, 0.36, 1) forwards;
}
.auth-card.anim-auth-split {
  animation: authSlideRight 0.6s cubic-bezier(0.22, 0.8, 0.36, 1) forwards;
}
@keyframes authSlideLeft {
  from { opacity: 0; transform: translateX(-28px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes authSlideRight {
  from { opacity: 0; transform: translateX(28px); }
  to { opacity: 1; transform: translateX(0); }
}
    `,
  },
  {
    id: "form-fields-reveal",
    name: "表单字段错峰浮现",
    description: "登录/注册表单字段组逐项淡入上移，营造填写引导节奏",
    position: "认证页表单字段组",
    effect: "每个表单字段以 60ms 间隔从下方 14px 淡入上移",
    targetPages: ["login", "register"],
    targetSelector: ".auth-card .form-group",
    cssClass: "anim-form-field",
    jsBehavior: "stagger",
    config: { delay: 60, duration: 450 },
    css: `
.anim-form-field {
  opacity: 0;
  transform: translateY(14px);
  animation: formFieldIn 0.45s ease forwards;
}
@keyframes formFieldIn {
  to { opacity: 1; transform: translateY(0); }
}
    `,
  },
  {
    id: "strength-segments",
    name: "密码强度条逐段点亮",
    description: "注册页密码强度条四段依次弹出，呼应输入反馈",
    position: "注册页密码强度条",
    effect: "4 段强度条以 90ms 间隔依次从底部弹出展开",
    targetPages: ["register"],
    targetSelector: "#strengthBar .strength-segment",
    cssClass: "anim-strength",
    jsBehavior: "stagger",
    config: { delay: 90, duration: 400 },
    css: `
.anim-strength {
  opacity: 0;
  animation: segIn 0.4s ease forwards;
}
@keyframes segIn {
  from { opacity: 0; transform: scaleY(0.2); }
  to { opacity: 1; transform: scaleY(1); }
}
    `,
  },

  // ---- Home page: 4 additional animations (total 8) ----

  {
    id: "parallax-hero",
    name: "Hero 视差滚动",
    description: "Hero 区视觉元素随页面滚动产生视差位移效果",
    position: "首页 Hero 预览窗口",
    effect: "预览窗口随页面滚动以 0.3 倍速度上下位移，产生视差层次感",
    targetPages: ["home"],
    targetSelector: ".hero-visual",
    cssClass: "anim-parallax",
    jsBehavior: "parallax-scroll",
    config: { speed: 0.3 },
    css: `
.hero-visual {
  will-change: transform;
  transition: transform 0.05s linear;
}
    `,
  },
  {
    id: "gradient-animate",
    name: "渐变背景流动",
    description: "Hero 区背景渐变色彩缓慢流动，营造动态氛围",
    position: "首页 Hero 区域背景",
    effect: "圆锥渐变以 18 秒周期缓慢旋转，营造动态氛围",
    targetPages: ["home"],
    targetSelector: ".hero",
    cssClass: "anim-gradient",
    jsBehavior: "none",
    config: {},
    css: `
.hero {
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: "";
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    from 0deg at 50% 50%,
    color-mix(in srgb, var(--brand-primary, #171717) 8%, transparent),
    color-mix(in srgb, var(--brand-primary, #171717) 18%, transparent),
    color-mix(in srgb, var(--brand-primary, #171717) 4%, transparent),
    color-mix(in srgb, var(--brand-primary, #171717) 12%, transparent),
    color-mix(in srgb, var(--brand-primary, #171717) 8%, transparent)
  );
  animation: gradientRotate 18s linear infinite;
  z-index: -1;
}
@keyframes gradientRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
    `,
  },
  {
    id: "card-tilt-3d",
    name: "卡片 3D 倾斜",
    description: "特性卡片跟随鼠标移动产生 3D 倾斜效果",
    position: "首页特性卡片区域",
    effect: "卡片跟随鼠标位置产生最大 8 度的 3D 倾斜，图标浮出 30px",
    targetPages: ["home"],
    targetSelector: "[data-animate-hover='hover-scale']",
    cssClass: "anim-tilt-3d",
    jsBehavior: "tilt-3d",
    config: { maxTilt: 8, perspective: 600 },
    css: `
[data-animate-hover="hover-scale"].anim-tilt-3d {
  transform-style: preserve-3d;
  perspective: 600px;
  transition: transform 0.15s ease-out, box-shadow 0.3s ease;
}
[data-animate-hover="hover-scale"].anim-tilt-3d:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
[data-animate-hover="hover-scale"].anim-tilt-3d .card-icon {
  transform: translateZ(30px);
}
    `,
  },
  {
    id: "nav-fade-stagger",
    name: "导航栏错峰淡入",
    description: "导航栏各项依次淡入下移，页面加载时营造入场节奏",
    position: "首页顶部导航栏",
    effect: "Logo、导航链接、CTA 按钮以 50ms 间隔从上方 10px 淡入下移",
    targetPages: ["home"],
    targetSelector: ".nav-logo, .nav-link, .nav-cta .btn",
    cssClass: "anim-nav-fade",
    jsBehavior: "stagger",
    config: { delay: 50, duration: 400 },
    css: `
.anim-nav-fade {
  opacity: 0;
  animation: navFadeIn 0.4s ease forwards;
}
@keyframes navFadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
    `,
  },

  // ---- Carousel page: 3 additional animations (total 4) ----

  {
    id: "slide-ken-burns",
    name: "幻灯片 Ken Burns 缩放",
    description: "当前轮播幻灯片内容缓慢放大，营造电影感焦距推近",
    position: "产品页轮播幻灯片内容",
    effect: "当前幻灯片的视觉元素在 4 秒内缓慢放大至 1.12 倍，电影感焦距推近",
    targetPages: ["carousel"],
    targetSelector: "[data-animate='auto-carousel']",
    cssClass: "anim-ken-burns",
    jsBehavior: "interval-carousel",
    config: { interval: 4000, easing: "ease-in-out" },
    css: `
.carousel-slide .gradient-visual,
.carousel-slide h2,
.carousel-slide p {
  transition: transform 4s ease-in-out, opacity 0.6s ease-in-out;
}
.carousel-slide:not(.is-active) .gradient-visual {
  transform: scale(1);
}
.carousel-slide.is-active .gradient-visual {
  transform: scale(1.12);
  animation: kenBurnsZoom 4s ease-in-out forwards;
}
@keyframes kenBurnsZoom {
  from { transform: scale(1); }
  to { transform: scale(1.12); }
}
    `,
  },
  {
    id: "card-flip-hover",
    name: "产品卡片翻转",
    description: "产品卡片鼠标悬停时翻转到背面，展示更多详情",
    position: "产品页底部产品卡片网格",
    effect: "鼠标悬停时卡片沿 Y 轴翻转 180 度，显示背面详情",
    targetPages: ["carousel"],
    targetSelector: ".grid-3 .card",
    cssClass: "anim-card-flip",
    jsBehavior: "stagger",
    config: { delay: 0, duration: 600 },
    css: `
.grid-3 .card {
  position: relative;
}
.card-back { display: none; }
.grid-3 .card.anim-card-flip {
  perspective: 800px;
  cursor: pointer;
}
.grid-3 .card.anim-card-flip > *:not(.card-back) {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
.grid-3 .card.anim-card-flip .card-back {
  display: flex;
  position: absolute;
  inset: 0;
  padding: var(--space-lg, 24px);
  background: var(--brand-surface, #f5f5f5);
  border-radius: var(--radius-lg, 12px);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.grid-3 .card.anim-card-flip:hover > *:not(.card-back) {
  transform: rotateY(180deg);
}
.grid-3 .card.anim-card-flip:hover .card-back {
  transform: rotateY(0deg);
}
    `,
  },
  {
    id: "badge-bounce-in",
    name: "徽章弹跳入场",
    description: "产品徽章在页面加载时弹跳入场，吸引视觉注意",
    position: "产品页产品徽章",
    effect: "徽章以弹跳曲线从缩小状态放大入场，附带回弹效果",
    targetPages: ["carousel"],
    targetSelector: ".product-badge",
    cssClass: "anim-badge-bounce",
    jsBehavior: "stagger",
    config: { delay: 150, duration: 600 },
    css: `
.product-badge.anim-badge-bounce {
  opacity: 0;
  animation: badgeBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}
@keyframes badgeBounceIn {
  0% { opacity: 0; transform: scale(0.3) translateY(-20px); }
  50% { opacity: 1; transform: scale(1.1) translateY(0); }
  70% { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
    `,
  },
];

export const ANIMATION_MAP: Record<string, AnimationMeta> = Object.fromEntries(
  ANIMATIONS.map((a) => [a.id, a])
);
