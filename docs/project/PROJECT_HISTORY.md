# 项目发展时间线

## 2026-05

### 项目初始化
- 创建 `yutu-catalog` Next.js 项目
- 技术栈确定：Next.js 16 + Tailwind CSS + Shadcn UI + Cloudflare Pages
- 安装 Framer Motion、Swiper 等依赖
- 配置 Cloudflare Pages 部署（@opennextjs/cloudflare + Wrangler）

### 开发规格文档
- 完成《E-Catalog 前端开发规格文档 v1.0》
- 定义数据模型（CatalogData、CatalogProduct、CatalogSku、CatalogImage）
- 明确路由结构 `/c/[id]`
- 设计页面四大区域：Hero / Tab / 产品瀑布流 / Bottom Sheet

## 2026-06

### 核心组件开发
- 实现 HeroSection（全屏封面）
- 实现 CategoryTabs（分类导航）
- 实现 ProductGrid（双列瀑布流 + IntersectionObserver 无限滚动）
- 实现 ProductCard（产品卡片）
- 实现 ProductSheet（Bottom Sheet 详情 + Framer Motion 动效）
- 实现 ProductSwiper（Swiper 图片轮播）
- 实现 SkuRow（SKU 横向选择器）

### R2 数据接入
- 配置环境变量 `NEXT_PUBLIC_R2_BASE_URL`
- 实现 `getCatalog()` 服务端数据获取（ISR 5分钟缓存）
- 接入真实产品数据源

### 基础设施
- 修复 Google Fonts 网络不可达问题，改用系统字体
- 处理 coverImageUrl 为空的情况
- 配置 3010 端口开发服务器

### UI 迁移准备（catalog → yutu-catalog）
- 完成 catalog 项目 UI 审计
- 制定组件映射方案和迁移计划
- 建立安全边界文档（DO_NOT_TOUCH.md）
- 设计数据适配器层（catalogAdapter）
