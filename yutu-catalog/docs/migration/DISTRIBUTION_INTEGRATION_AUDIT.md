# Distribution Integration Audit — CatalogData & Component Dependencies

> 日期：2026-06-03
> 审计范围：src/types/catalog.ts + src/components/catalog/* + src/lib/catalog.ts

---

## 1. CatalogData 完整结构

```typescript
CatalogData {
  id: string               // 目录唯一标识
  name: string             // 目录名称
  brand: string            // 品牌名
  createdAt: string        // 创建时间 (ISO 8601)
  coverImageUrl: string    // 封面图 URL (可为空字符串)
  products: CatalogProduct[]
}

CatalogProduct {
  spuCode: string          // SPU 编码
  title: string            // 产品名称
  category: string         // 分类
  mainImageUrl: string     // 主图 URL
  images: {
    main: CatalogImage[]   // 产品图片列表
  }
  skus: CatalogSku[]       // SKU 列表
}

CatalogImage {
  index: number
  url: string
  fileName: string
}

CatalogSku {
  skuCode: string
  nameZh: string           // 中文名
  nameEn: string           // 英文名
  imageUrl: string         // SKU 图片
}
```

---

## 2. 组件字段依赖矩阵

### 2.1 HeroSection

| 字段 | 必需 | 用途 |
|------|------|------|
| `coverImageUrl` | 否 (空时渐变回退) | 全屏背景图 |
| `brand` | 是 | 顶栏品牌名 + Brand Pill |
| `name` | 是 | 主标题 h1 |
| `createdAt` | 是 | 发布日期格式化 |
| `products.length` | 是 | "共 N 款优选新品" |

### 2.2 CategoryTabs

| 字段 | 必需 | 用途 |
|------|------|------|
| `products[].category` | 是 | 分类归集 (Set 去重) |
| `products.length` | 否 | 各分类产品计数 badge |

### 2.3 ProductGrid

| 字段 | 必需 | 用途 |
|------|------|------|
| `products[].title` | 否 | 搜索匹配 |
| `products[].spuCode` | 否 | 搜索匹配 |
| `products[].category` | 是 | 分类过滤 |

### 2.4 ProductCard

| 字段 | 必需 | 用途 |
|------|------|------|
| `mainImageUrl` | **是** | 产品卡片主图 (无回退) |
| `title` | **是** | 产品名称 (line-clamp-2) |
| `spuCode` | **是** | SPU 编码 pill + 搜索匹配 |
| `skus.length` | 否 (>1 时显示角标) | SKU 数量 badge |
| `category` | 否 | 底部分类标签 |

### 2.5 ProductSheet

| 字段 | 必需 | 用途 |
|------|------|------|
| `images.main[].url` | **是** | 图片轮播 |
| `skus[].imageUrl` | 否 | SKU 图片补入轮播 |
| `skus[].nameZh` | 是 | SKU 选择器显示 |
| `skus[].nameEn` | 否 | SKU 英文名 |
| `skus[].skuCode` | 是 | SKU 唯一标识 + 选中态 |
| `spuCode` | 是 | 产品信息头部 |
| `title` | 是 | 产品标题 |
| `category` | 否 | 琥珀色分类标签 |

### 2.6 ProductSwiper

| 字段 | 必需 | 用途 |
|------|------|------|
| `images[].url` | **是** | 轮播图片源 |

### 2.7 SkuRow

| 字段 | 必需 | 用途 |
|------|------|------|
| `skus[].imageUrl` | **是** | SKU 缩略图 |
| `skus[].nameZh` | **是** | SKU 中文名 |
| `skus[].nameEn` | 否 | SKU 英文名 |
| `skus[].skuCode` | 是 | 唯一标识 + 选中比对 |

---

## 3. 必需字段清单

以下字段为**运行时必需**（缺失将导致渲染异常）：

| 层级 | 字段 | 缺失后果 |
|------|------|----------|
| CatalogData | `id` | 页面元数据缺失 |
| CatalogData | `name` | Hero 标题为空 |
| CatalogData | `brand` | 品牌名不显示 |
| CatalogData | `createdAt` | 日期不显示 |
| CatalogData | `products` | 产品列表为空 |
| Product | `spuCode` | Card Pill / Search 失效 |
| Product | `title` | 卡片/详情标题为空 |
| Product | `mainImageUrl` | 卡片主图破裂 (无 fallback) |
| Product | `images.main` | 轮播无图 |
| Product | `skus` | SKU 选择器不渲染 |
| SKU | `skuCode` | 选中态失效 |
| SKU | `nameZh` | SKU 显示为空 |
| SKU | `imageUrl` | SKU 缩略图破裂 |

---

## 4. 可选字段清单

以下字段缺失时不影响核心渲染：

| 字段 | 缺失行为 |
|------|----------|
| `coverImageUrl` | 渐变背景回退 |
| `skus.length > 1` | 不显示 SKU 角标 |
| `category` | 不显示分类标签 / 归入 `undefined` |
| `nameEn` | SKU 英文名留空 |
| `products[].title` (搜索) | 搜索无结果 → 空状态页面 |
| `images.main.length` | 显示 "无可用图片" |

---

## 5. 两项目数据差异汇总

| 接口 | yutu-catalog | catalog (新UI) | 差异 |
|------|-------------|----------------|------|
| `CatalogSku` | 4 字段 | 6 字段 | +supplyPrice, +suggestedPrice |
| `CatalogData` | 6 字段 | 7 字段 | +distributorInfo |
| `DistributorInfo` | 不存在 | 6 字段 | 全新增 |
| `CatalogImage.fileName` | `string` | `string?` | 非破坏性差异 |

**结论**: yutu-catalog 的类型是 catalog 类型的子集。扩展为 Distribution 只需增加可选字段，不破坏现有兼容性。
