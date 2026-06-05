# 雨图饰品 产品图册

**E-Catalog 前端开发规格文档 v1.0**

技术栈：Next.js 14 + Tailwind CSS + Shadcn UI + Cloudflare Pages

---

## 1. 项目概述

本文档为产品图册（E-Catalog）独立前端项目的完整开发规格，供雨图饰品E-Catalog（图册Next.js）的OpenCode直接执行。

图册是雨图饰品对外展示产品的数字化门户，运营在PIM系统内创建图册并发布JSON到R2，本项目读取R2数据渲染产品瀑布流，供买家和分销商浏览。

### 1.1 核心定位

- 纯展示，无购买、无登录、无操作按钮
- 移动端优先，兼容桌面端
- 完全静态，部署到Cloudflare Pages，全球CDN加速
- 数据来源：R2公开访问URL下的catalog JSON文件
- 图片来源：R2公开访问URL

### 1.2 技术栈

| **框架** | Next.js 14（App Router） |
| --- | --- |
| **样式** | Tailwind CSS + Shadcn UI |
| **图片轮播** | Swiper.js |
| **动效** | Framer Motion |
| **部署** | Cloudflare Pages |
| **数据读取** | fetch R2公开URL（无需后端API） |
| **图片存储** | Cloudflare R2公开访问URL |
| **语言** | 中文（预留i18n接口，暂不实现多语言） |
| **包管理器** | pnpm |
| **Node 版本** | 18+ |

### 1.3 项目初始化命令

```bash
pnpm create next-app@latest yutu-catalog --typescript --tailwind --app --src-dir --import-alias '@/*'

cd yutu-catalog

pnpm add framer-motion swiper
pnpm add -D @types/node
```

Shadcn UI初始化：

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add sheet badge button skeleton
```

---

## 2. 数据结构规格

### 2.1 R2 Catalog JSON结构

文件路径：`catalogs/{catalogId}.json`，由PIM后端生成并上传到R2，本项目只读取，不写入。

**完整 JSON 结构：**

```json
{
  "id": "abc123",
  "name": "2026春季新品图册",
  "brand": "雨图饰品",
  "createdAt": "2026-05-30T00:00:00Z",
  "coverImageUrl": "https://r2.yutu.nv315.top/catalogs/abc123/cover.jpg",
  "products": [
    {
      "spuCode": "SP2605024",
      "title": "彩色尼龙登山扣钥匙扣 包包挂件",
      "category": "包包挂件",
      "mainImageUrl": "https://r2.yutu.nv315.top/products/.../主_1.png",
      "images": {
        "main": [
          { "index": 0, "url": "https://r2.yutu.nv315.top/..." }
        ]
      },
      "skus": [
        {
          "skuCode": "BG-CR-0001",
          "nameZh": "黄橙登山扣绳",
          "nameEn": "Yellow Orange Rope",
          "imageUrl": "https://r2.yutu.nv315.top/..."
        }
      ]
    }
  ]
}
```

> **⚠️ 注意** *产品数据里不包含任何内部数据：无成本价、无利润率、无库存、无内部状态标记*

### 2.2 环境变量

在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_R2_BASE_URL=https://r2.yutu.nv315.top
NEXT_PUBLIC_CATALOG_PATH=/catalogs
```

> **⚠️ 注意** *`NEXT_PUBLIC_` 前缀使变量在客户端可访问，纯静态项目所有变量都需要此前缀*

---

## 3. 路由结构

| **路由** | 说明 |
| --- | --- |
| **/** | 首页（可选，暂不开发，直接重定向到图册） |
| **/c/[id]** | 图册主页面（封面+瀑布流+底部详情） |
| **/c/[id]/not-found** | 图册不存在时的提示页 |

所有页面集中在 `/c/[id]` 这一个路由下，封面、产品瀑布流、产品详情都在同一个页面里，通过滚动和Bottom Sheet交互切换，不跳页。

---

## 4. 页面设计规格

### 4.1 整体页面结构（/c/[id]）

页面从上到下分为四个区域：

- 封面区（Hero）：全屏高度，视觉冲击
- 分类导航Tab：吸顶，切换产品分类
- 产品瀑布流：双列网格，无限滚动
- 底部详情（Bottom Sheet）：点击产品弹出，不跳页

### 4.2 封面区（Hero Section）

高度：`100vh`，占满第一屏。

内容层次：

- 背景：`coverImageUrl` 作为全屏背景图，`object-fit: cover`
- 暗色遮罩：`rgba(0,0,0,0.35)`，让文字清晰可读
- 品牌名称：居中大字，白色，字重700，字号2.5rem移动端/4rem桌面端
- 图册名称：品牌名下方，白色，较小字号，字重400
- 进入按钮：「查看图册 →」，白色描边按钮，点击后平滑滚动到瀑布流区域
- 底部渐变：bottom区域有从透明到黑色的渐变，过渡到瀑布流

**Framer Motion 动效：**

- 页面加载时，品牌名和按钮从下方淡入（`y: 20→0, opacity: 0→1`）
- 动效时长0.6s，延迟0.2s

### 4.3 分类导航Tab

位置：封面区下方，吸顶（`sticky top-0`），滚动时固定在顶部。

内容：「全部」+ 按products的category字段自动归类的分类列表。

样式：横向滚动，每个Tab是胶囊形状，选中状态深色填充，未选中灰色。

交互：点击Tab时，瀑布流平滑过渡展示对应分类的产品。

**分类自动归类逻辑：**

```ts
const categories = ['全部', ...new Set(catalog.products.map(p => p.category).filter(Boolean))]
```

### 4.4 产品瀑布流

布局：双列网格，间距8px，移动端优先。

每张产品卡片显示：

- 主图：正方形裁切，`object-fit: cover`，懒加载（`loading='lazy'`）
- 产品名：主图下方，2行截断，字号0.875rem
- SPU编码：产品名下方，灰色小字
- SKU数量：如有多个SKU，右上角显示SKU数量角标

**加载策略：**

- 初始渲染前12个产品
- 滚动到底部时加载下一批（每批12个）
- 使用 `IntersectionObserver` 实现无限滚动
- 加载中显示Skeleton占位卡片

### 4.5 底部详情（Bottom Sheet）

触发：点击任意产品卡片。

关闭：下拉Bottom Sheet 或 点击遮罩空白处。

动效：从底部滑入，Framer Motion `animate y: '100%' → 0`。

**Bottom Sheet 内容区域：**

- 顶部拖拽条：灰色短横线，居中
- 图片轮播（Swiper）：
  - 展示产品所有主图
  - 分页指示点在右上角（如 `1/5`）
  - 支持左右滑动切换
- 产品信息区：
  - SPU编码：灰色小字
  - 产品名称：大字，字重600
  - 分类标签：胶囊标签
- SKU展示区：
  - 每个SKU显示：SKU图片（圆形）+ 中文名
  - 横向滚动排列
  - 点击SKU图片切换上方Swiper到该SKU图片

> **⚠️ 注意** *底部详情不显示任何价格信息，纯展示*

---

## 5. 组件结构

| **组件路径** | **说明** | **使用位置** |
| --- | --- | --- |
| `app/c/[id]/page.tsx` | 图册主页面，数据获取入口 | 路由入口 |
| `app/c/[id]/loading.tsx` | 加载状态（骨架屏） | 自动调用 |
| `app/c/[id]/not-found.tsx` | 图册不存在提示页 | 自动调用 |
| `components/catalog/HeroSection.tsx` | 封面区组件 | page.tsx |
| `components/catalog/CategoryTabs.tsx` | 分类导航Tab | page.tsx |
| `components/catalog/ProductGrid.tsx` | 产品瀑布流网格 | page.tsx |
| `components/catalog/ProductCard.tsx` | 单个产品卡片 | ProductGrid |
| `components/catalog/ProductSheet.tsx` | 底部详情Bottom Sheet | page.tsx |
| `components/catalog/ProductSwiper.tsx` | 图片轮播组件 | ProductSheet |
| `components/catalog/SkuRow.tsx` | SKU横向滚动列表 | ProductSheet |
| `lib/catalog.ts` | 数据获取函数 | page.tsx |
| `types/catalog.ts` | TypeScript类型定义 | 全局 |

---

## 6. 数据获取规格

### 6.1 服务端数据获取（lib/catalog.ts）

在Next.js服务端获取数据，避免客户端暴露R2路径逻辑：

```ts
// lib/catalog.ts
import { CatalogData } from '@/types/catalog'

export async function getCatalog(id: string): Promise<CatalogData | null> {
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
  const url = `${r2BaseUrl}/catalogs/${id}.json`

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }  // 5分钟缓存
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
```

### 6.2 page.tsx数据获取

```ts
// app/c/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'

export default async function CatalogPage({ params }: { params: { id: string } }) {
  const catalog = await getCatalog(params.id)
  if (!catalog) notFound()
  return <CatalogView catalog={catalog} />
}

export async function generateMetadata({ params }) {
  const catalog = await getCatalog(params.id)
  return {
    title: catalog?.name ?? '产品图册',
    description: `${catalog?.brand} 产品图册`,
  }
}
```

---

## 7. TypeScript 类型定义（types/catalog.ts）

```ts
export interface CatalogImage {
  index: number
  url: string
  fileName: string
}

export interface CatalogSku {
  skuCode: string
  nameZh: string
  nameEn: string
  imageUrl: string
}

export interface CatalogProduct {
  spuCode: string
  title: string
  category: string
  mainImageUrl: string
  images: { main: CatalogImage[] }
  skus: CatalogSku[]
}

export interface CatalogData {
  id: string
  name: string
  brand: string
  createdAt: string
  coverImageUrl: string
  products: CatalogProduct[]
}
```

---

## 8. 关键交互实现规格

### 8.1 Bottom Sheet动效（Framer Motion）

```tsx
// components/catalog/ProductSheet.tsx
import { motion, AnimatePresence } from 'framer-motion'

// 遮罩层
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        className='fixed inset-0 bg-black/50 z-40'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className='fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50'
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag='y'
        dragConstraints={{ top: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 100) onClose()
        }}
      >
        {/* 内容 */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 8.2 Swiper图片轮播配置

```tsx
// components/catalog/ProductSwiper.tsx
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

<Swiper
  modules={[Pagination]}
  pagination={{ type: 'fraction' }}  // 显示 1/5 格式
  spaceBetween={0}
  slidesPerView={1}
  onSwiper={setSwiperInstance}
>
  {images.map((img, i) => (
    <SwiperSlide key={i}>
      <img src={img.url} alt='' className='w-full aspect-square object-cover' />
    </SwiperSlide>
  ))}
</Swiper>
```

### 8.3 无限滚动（IntersectionObserver）

```tsx
// components/catalog/ProductGrid.tsx
const [displayCount, setDisplayCount] = useState(12)
const loaderRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setDisplayCount(prev => Math.min(prev + 12, products.length))
    }
  }, { threshold: 0.1 })

  if (loaderRef.current) observer.observe(loaderRef.current)
  return () => observer.disconnect()
}, [products.length])
```

---

## 9. Cloudflare Pages 部署配置

### 9.1 next.config.ts配置

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',  // Cloudflare Pages需要
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'r2.yutu.nv315.top',  // R2域名
      }
    ]
  }
}

export default nextConfig
```

### 9.2 Cloudflare Pages构建配置

| **构建命令** | `pnpm run build` |
| --- | --- |
| **输出目录** | `.next` |
| **Node.js 版本** | 18 |
| **环境变量** | 在Cloudflare Pages控制台设置 |
| **自定义域名** | `catalog.yutu.nv315.top`（示例） |
| **访问地址格式** | `https://catalog.yutu.nv315.top/c/{catalogId}` |

### 9.3 环境变量配置（Cloudflare控制台）

| **NEXT_PUBLIC_R2_BASE_URL** | `https://r2.yutu.nv315.top`（R2公开访问域名） |
| --- | --- |
| **NEXT_PUBLIC_CATALOG_PATH** | `/catalogs` |

---

## 10. 开发任务清单

| **优先级** | **任务** | **说明** |
| --- | --- | --- |
| P0 | 项目初始化 | Next.js 14 + Tailwind + Shadcn + Swiper + Framer Motion |
| P0 | 类型定义 | 创建 `types/catalog.ts`，定义所有接口 |
| P0 | 数据获取层 | 创建 `lib/catalog.ts`，getCatalog函数 |
| P0 | 路由页面 | `app/c/[id]/page.tsx`，`loading.tsx`，`not-found.tsx` |
| P0 | HeroSection组件 | 封面大图+品牌名+进入按钮+Framer Motion动效 |
| P0 | CategoryTabs组件 | 自动分类+吸顶Tab+选中状态 |
| P0 | ProductCard组件 | 产品卡片+懒加载图片+SKU角标 |
| P0 | ProductGrid组件 | 双列瀑布流+IntersectionObserver无限滚动+Skeleton |
| P0 | ProductSheet组件 | Bottom Sheet+遮罩+拖拽关闭+Framer Motion动效 |
| P0 | ProductSwiper组件 | Swiper图片轮播+分页指示 |
| P0 | SkuRow组件 | SKU横向滚动+点击切换主图 |
| P1 | 响应式适配 | 移动端优先，桌面端两侧留白居中 |
| P1 | 图片懒加载优化 | 优先加载首屏图片，其余懒加载 |
| P1 | SEO配置 | generateMetadata动态标题描述 |
| P1 | Cloudflare Pages部署 | 配置构建命令和环境变量 |
| P2 | i18n接口预留 | 预留语言切换入口，当前只显示中文 |

---

## 11. 开发验证步骤

### 11.1 本地开发验证

- 第一步：项目初始化成功，`pnpm dev` 启动无报错
- 第二步：访问 `http://localhost:3000/c/test-id`，返回not-found页面
- 第三步：手动创建一个测试catalog JSON，上传到R2的 `catalogs/test-id.json`
- 第四步：访问 `http://localhost:3000/c/test-id`，封面图和产品列表正常显示
- 第五步：点击产品卡片，Bottom Sheet从底部滑出
- 第六步：Swiper图片轮播正常，点击SKU切换图片正常
- 第七步：分类Tab切换，产品列表正确过滤
- 第八步：滚动到底部，无限滚动加载下一批产品

### 11.2 部署验证

- Cloudflare Pages构建成功，无报错
- 访问 `https://catalog.yutu.nv315.top/c/{真实catalogId}`，页面正常
- 移动端Chrome DevTools模拟，布局正常
- 图片从R2加载，速度正常

---

*文档版本：v1.0 　　生成日期：2026-05-31 　　项目：雨图饰品E-Catalog（图册Next.js）*

*本文档供雨图饰品E-Catalog独立开发使用，与PIM系统无代码耦合，唯一联系是读取R2的catalog JSON文件。*
