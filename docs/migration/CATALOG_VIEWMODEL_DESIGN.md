# CatalogViewModel Design — Unified Data Model

> 日期：2026-06-03
> 目标：Catalog JSON 和 Distribution API 映射到同一 ViewModel

---

## 1. 设计原则

1. **单一数据源 → 统一视图**: UI 组件只依赖 `CatalogViewModel`，不感知数据来源
2. **可选字段不阻塞渲染**: 缺失字段使用 null/fallback，不在 UI 层报错
3. **未来扩展**: 新增字段只需扩展 ViewModel，适配器负责转换

---

## 2. CatalogViewModel 完整定义

```typescript
/**
 * 统一视图模型 — Catalog 和 Distribution 共用
 */
interface CatalogViewModel {
  // === 目录元信息 ===
  meta: CatalogMeta

  // === 封面信息 ===
  hero: HeroInfo

  // === 分类导航 ===
  categories: CategoryInfo[]

  // === 产品列表 ===
  products: ProductInfo[]

  // === 分销信息 (可选) ===
  distributor: DistributorInfo | null

  // === 协议信息 (可选) ===
  agreement: AgreementInfo | null

  // === 功能开关 ===
  features: FeatureFlags
}

// ---------- 子类型 ----------

interface CatalogMeta {
  id: string
  name: string
  brand: string
  createdAt: string  // ISO 8601
}

interface HeroInfo {
  coverImageUrl: string | null    // 空值时 UI 显示渐变背景
  brand: string
  name: string
  createdAt: string
  productCount: number
  customerName: string | null     // 分销商名称 (Catalog 模式为 null)
}

interface CategoryInfo {
  name: string
  productCount: number
}

interface ProductInfo {
  spuCode: string
  title: string
  category: string
  mainImageUrl: string
  images: ImageInfo[]
  skus: SkuInfo[]
}

interface ImageInfo {
  url: string
  alt: string                     // 由 adapter 生成
}

interface SkuInfo {
  skuCode: string
  nameZh: string
  nameEn: string
  imageUrl: string
  pricing: PricingInfo | null    // Catalog 模式为 null
}

interface PricingInfo {
  supplyPrice: number            // 供货价
  suggestedPrice: number         // 建议零售价
  profitMargin: number           // 利润率 (%)
  profitAmount: number           // 单件利润 (元)
  currency: string               // 货币符号
}

interface DistributorInfo {
  distributorName: string
  cooperationLevel: string
  currency: string
  validUntil: string | null
  contactManager: string | null
}

interface AgreementInfo {
  text: string                   // Markdown 格式
}

interface FeatureFlags {
  showPrice: boolean             // 是否显示定价
  showCustomerName: boolean      // 是否显示分销商名称
  showAgreement: boolean         // 是否显示协议入口
  showQualityAssurance: boolean  // 是否显示品控声明
}
```

---

## 3. 字段来源对照

| ViewModel 字段 | Catalog JSON | Distribution API | 默认值 |
|---------------|-------------|------------------|--------|
| `meta.id` | `id` | `id` | — |
| `meta.name` | `name` | `name` | — |
| `meta.brand` | `brand` | `brand` | — |
| `meta.createdAt` | `createdAt` | `createdAt` | — |
| `hero.coverImageUrl` | `coverImageUrl` | `coverImageUrl` | `null` |
| `hero.customerName` | — | `distributorInfo.distributorName` | `null` |
| `products[].skus[].pricing` | — | `sku.supplyPrice / suggestedPrice` | `null` |
| `distributor` | — | `distributorInfo` | `null` |
| `agreement` | — | `distributorInfo.agreementText` | `null` |
| `features.showPrice` | `false` | `true` | `false` |

---

## 4. 组件适配关系

```
                    CatalogViewModel
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     HeroSection     ProductGrid      ProductSheet
          │               │               │
     hero.cover      products[]      products[]
     hero.brand      features        skus[].pricing
     hero.name                       distributor
     hero.productCount               agreement

     CategoryTabs
          │
     categories[]
```

每个组件只依赖 ViewModel 的对应子类型，不关心数据来源。

---

## 5. FeatureFlags 驱动逻辑

```typescript
// CatalogView 内部
function CatalogView({ viewModel }: { viewModel: CatalogViewModel }) {
  return (
    <>
      <HeroSection
        hero={viewModel.hero}                    // 所有模式共用
        showCustomerName={viewModel.features.showCustomerName}
      />
      <CategoryTabs categories={viewModel.categories} />
      <ProductGrid
        products={viewModel.products}
        showPrice={viewModel.features.showPrice}  // 分销模式显示
      />
      <ProductSheet
        product={selectedProduct}
        showPrice={viewModel.features.showPrice}
        showQualityAssurance={viewModel.features.showQualityAssurance}
      />
      {viewModel.features.showAgreement && (
        <AgreementModal agreement={viewModel.agreement} />
      )}
    </>
  )
}
```

---

## 6. 数据量预估

| 场景 | productCount | pricing 字段 | 额外开销 |
|------|-------------|-------------|----------|
| 小型图册 | 1-20 | 0 或 20×2 | ~1KB |
| 中型图册 | 20-100 | 0 或 100×2 | ~5KB |
| 大型图册 | 100+ | 0 或 N×2 | ~10KB |

ViewModel 转换在服务端 (Adapter) 完成，不增加客户端负担。
