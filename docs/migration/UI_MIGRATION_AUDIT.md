# UI Migration Audit — catalog → yutu-catalog

> 审计日期：2026-06-03
> 审计范围：E:\网站开发\E-Catalog\catalog vs E:\网站开发\E-Catalog\yutu-catalog

---

## 1. 当前项目组件树 (yutu-catalog)

```
src/app/
├── layout.tsx                    # 根布局 (zh-CN, flex-col)
├── page.tsx                      # Next.js 默认首页 (非目录功能)
├── globals.css                   # Tailwind v4 + shadcn 主题 + CSS 变量
└── c/[id]/
    ├── page.tsx                  # 服务端: getCatalog → CatalogView
    ├── loading.tsx               # 骨架屏
    ├── error.tsx                 # 错误页 + 重试
    └── not-found.tsx             # 图册不存在

src/components/catalog/
├── CatalogView.tsx               # 客户端主视图: 状态管理 (selectedProduct, activeCategory)
├── HeroSection.tsx               # 全屏封面: coverImageUrl → brand/name/button
├── CategoryTabs.tsx              # 吸顶胶囊 Tab: 全部 + 自动分类
├── ProductGrid.tsx               # 双列网格 + Intersection Observer 无限滚动 + Skeleton
├── ProductCard.tsx               # 产品卡片: 主图/title/spuCode/SKU 数量角标
├── ProductSheet.tsx              # Bottom Sheet: framer-motion 弹入 + ProductSwiper + SkuRow
├── ProductSwiper.tsx             # Swiper.js 轮播: fraction 分页
└── SkuRow.tsx                    # SKU 横向选择: 圆形缩略图 + nameZh

src/components/ui/                # shadcn/ui 基础组件 (已生成,未使用)
├── button.tsx
├── sheet.tsx
├── badge.tsx
└── skeleton.tsx

src/lib/
├── catalog.ts                    # getCatalog(id): R2 fetch + ISR 5min
└── utils.ts                      # cn() 工具

src/types/
└── catalog.ts                    # CatalogImage, CatalogSku, CatalogProduct, CatalogData
```

---

## 2. 新 UI 项目组件树 (catalog)

```
src/
├── main.tsx                      # React 入口 (Vite SPA)
├── App.tsx                       # 根组件: 多视图状态机 (cover/list)
├── index.css                     # Tailwind v4 (Vite 插件) + Inter/JetBrains Mono 字体
├── types.ts                      # 扩展数据模型 (含 DistributorInfo, supplyPrice/suggestedPrice)
│
├── lib/catalog.ts                # getCatalog: R2 + mock fallback; getAllCatalogsInfo
├── data/mockCatalogs.ts          # 4 个模拟目录 (含分销专享版)
│
└── components/
    ├── HeroSection.tsx           # ★ 重设计: Y Logo, brand pill, 日期, 产品数, 视差背景, 脉冲指示器
    ├── CategoryTabs.tsx          # 胶囊 Tab + 产品数 badge
    ├── ProductGrid.tsx           # ★ 双列→3列→4列响应式 + 搜索框 + 空状态图标
    ├── ProductCard.tsx           # ★ 重设计: motion hover 动画, 圆角卡片, 定价展示, category pill
    ├── ProductSheet.tsx          # ★ 重设计: 分销定价计算器 (供货价/零售价/利润率), 品控保障
    ├── ProductSwiper.tsx         # ★ 自定义 Swiper: 触摸/touch/keyboard, 箭头按钮, 点指示器
    ├── SkuRow.tsx                # SKU 选择: 选中态深色高亮, 中/英文名 + 编码
    └── CatalogDashboard.tsx      # ★ 新增: Recharts 分析仪表盘 (SPU/SKU 统计, 饼图, 柱状图)
```

---

## 3. 组件映射关系

| 旧组件 (yutu-catalog) | 新组件 (catalog) | 替换方式 | 风险等级 |
|----------------------|------------------|----------|----------|
| `CatalogView.tsx` | `App.tsx` (状态机) | 需改造: Next.js 服务端 → 客户端状态迁移 | 🔴 高 |
| `HeroSection.tsx` | `HeroSection.tsx` | 直接替换 (Props 兼容,但需适配 motion 库) | 🟡 中 |
| `CategoryTabs.tsx` | `CategoryTabs.tsx` | 直接替换 (增加产品数 badge) | 🟢 低 |
| `ProductGrid.tsx` | `ProductGrid.tsx` | 需改造: 增加响应式列数 + 搜索框 + 空状态 | 🟡 中 |
| `ProductCard.tsx` | `ProductCard.tsx` | 需改造: 增加定价展示 (条件渲染) | 🟡 中 |
| `ProductSheet.tsx` | `ProductSheet.tsx` | 需改造: 增加定价逻辑 + 品控保障区 | 🔴 高 |
| `ProductSwiper.tsx` | `ProductSwiper.tsx` | 需改造: 替换 Swiper.js → 自定义轮播 | 🟡 中 |
| `SkuRow.tsx` | `SkuRow.tsx` | 直接替换 (增加选中态高亮) | 🟡 中 |
| — | `CatalogDashboard.tsx` | 新增: 分析仪表盘 (可选, App.tsx 中未引入) | 🟢 低 |
| — | `CatalogSelector` | 新增: 多目录切换弹窗 (App.tsx 内联) | 🟢 低 |

---

## 4. 数据依赖分析

### 4.1 数据类型差异

| 字段 | yutu-catalog | catalog (新UI) | 兼容性 |
|------|-------------|----------------|--------|
| `CatalogSku.supplyPrice` | ❌ 无 | ✅ `number?` | 向前兼容 (可选) |
| `CatalogSku.suggestedPrice` | ❌ 无 | ✅ `number?` | 向前兼容 (可选) |
| `CatalogData.distributorInfo` | ❌ 无 | ✅ `DistributorInfo?` | 向前兼容 (可选) |
| `CatalogImage.fileName` | ✅ `string` | ✅ `string?` | ✅ 兼容 |
| 其余字段 | 完全一致 | 完全一致 | ✅ 完全兼容 |

### 4.2 组件字段依赖矩阵

| 组件 | 依赖字段 |
|------|----------|
| HeroSection | `coverImageUrl`, `brand`, `name`, `createdAt`, `products.length` |
| CategoryTabs | `products[].category` |
| ProductCard | `mainImageUrl`, `title`, `spuCode`, `skus.length`, `skus[].supplyPrice`*, `skus[].suggestedPrice`*, `category`* |
| ProductSheet | 全部 Product 字段 + `skus[].supplyPrice`*, `skus[].suggestedPrice`* |
| ProductSwiper | `images.main[].url` + `skus[].imageUrl` |
| SkuRow | `skus[].imageUrl`, `nameZh`, `nameEn`*, `skuCode`* |
| CatalogDashboard | `products`, `products[].skus.length`, `products[].category` |

*标记为新 UI 新增依赖

### 4.3 关键差异：`motion` vs `framer-motion`

| 项目 | 动画库 | 导入方式 |
|------|--------|----------|
| catalog (新UI) | `motion` ^12.23.24 | `import { motion } from 'motion/react'` |
| yutu-catalog (旧) | `framer-motion` ^12.40.0 | `import { motion } from 'framer-motion'` |

两个库 API 完全相同，仅包名不同。迁移时需全局替换 import 路径。

---

## 5. 样式系统差异

| 维度 | yutu-catalog | catalog (新UI) |
|------|-------------|----------------|
| Tailwind 版本 | v4 (PostCSS) | v4 (Vite 插件) |
| 主题方案 | CSS 变量 + shadcn 主题 | 内联 theme 定义 + 实用类 |
| 字体 | 系统字体 | Inter + JetBrains Mono (Google Fonts) |
| 设计语言 | 中性灰 (neutral) | 琥珀金 (amber) 品牌色 |
| 暗色模式 | 有 (dark: 变量) | 无 (明色专一) |
| 关键动画 | framer-motion 淡入 | motion 3D 视差 + 弹簧 + 渐变 |
| shadcn 组件 | 有 (4个基础组件已生成) | 无 (完全自定义) |

---

## 6. 架构差异总结

```
┌─────────────────────────────────────────────────────────────┐
│                    yutu-catalog (旧)                         │
│  Next.js 16 App Router                                     │
│  SSR + ISR + R2 fetch                                      │
│  单目录 /c/[id]                                             │
│  纯展示 (无定价/无分销)                                      │
│  8 个组件 + 4 个 shadcn 基础                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓ 迁移
┌─────────────────────────────────────────────────────────────┐
│                    catalog (新UI)                            │
│  React 19 SPA + Vite                                       │
│  CSR + R2 fetch + mock fallback                            │
│  多目录切换 + CatalogSelector                                │
│  分销定价 (supplyPrice/suggestedPrice/profit margin)         │
│  分析仪表盘 (CatalogDashboard)                               │
│  12 个组件 (全部自定义,无 shadcn)                             │
└─────────────────────────────────────────────────────────────┘
```

**核心迁移方向**: 将 catalog 的 UI 组件和设计语言移植到 yutu-catalog 的 Next.js 架构中，保留 yutu-catalog 的 SSR/ISR 数据层和路由结构。
