# Adapter Design — Data Source → CatalogViewModel

> 日期：2026-06-03
> 仅设计，不实现代码

---

## 1. 架构概述

```
 ┌─────────────────┐       ┌─────────────────────┐
 │  Catalog JSON   │       │  Distribution API   │
 │  (R2 静态文件)   │       │  (GET /api/share/..) │
 └────────┬────────┘       └──────────┬──────────┘
          │                           │
          ▼                           ▼
 ┌─────────────────┐       ┌─────────────────────┐
 │ CatalogAdapter  │       │DistributionAdapter  │
 │ catalogToVM()   │       │ distributionToVM()  │
 └────────┬────────┘       └──────────┬──────────┘
          │                           │
          └───────────┬───────────────┘
                      ▼
          ┌─────────────────────┐
          │  CatalogViewModel   │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │    CatalogView      │
          │  (UI Component)     │
          └─────────────────────┘
```

---

## 2. CatalogAdapter

### 2.1 输入

```typescript
// Catalog JSON (from R2)
type CatalogJson = CatalogData  // src/types/catalog.ts
```

### 2.2 输出

```typescript
CatalogViewModel
```

### 2.3 转换逻辑

```typescript
function catalogToViewModel(data: CatalogData): CatalogViewModel {
  return {
    meta: {
      id: data.id,
      name: data.name,
      brand: data.brand,
      createdAt: data.createdAt,
    },
    hero: {
      coverImageUrl: data.coverImageUrl || null,
      brand: data.brand,
      name: data.name,
      createdAt: data.createdAt,
      productCount: data.products.length,
      customerName: null,                    // Catalog 无分销商
    },
    categories: buildCategories(data.products),
    products: data.products.map(toProductInfoCatalog),
    distributor: null,                       // Catalog 无分销
    agreement: null,                         // Catalog 无协议
    features: {
      showPrice: false,
      showCustomerName: false,
      showAgreement: false,
      showQualityAssurance: true,            // Catalog 也显示品控声明
    },
  }
}

function toProductInfoCatalog(p: CatalogProduct): ProductInfo {
  return {
    spuCode: p.spuCode,
    title: p.title,
    category: p.category,
    mainImageUrl: p.mainImageUrl,
    images: p.images.main.map(img => ({
      url: img.url,
      alt: p.title,
    })),
    skus: p.skus.map(sku => ({
      skuCode: sku.skuCode,
      nameZh: sku.nameZh,
      nameEn: sku.nameEn,
      imageUrl: sku.imageUrl,
      pricing: null,                         // Catalog 无定价
    })),
  }
}
```

### 2.4 特点

- 直通映射，无数据丢失
- 所有 pricing 字段设 `null`
- customerName / distributor / agreement 一律 `null`
- `showQualityAssurance` 始终 `true`

---

## 3. DistributionAdapter

### 3.1 输入

```typescript
// Distribution API Response
type DistributionResponse = ShareDistributionResponse
```

### 3.2 输出

```typescript
CatalogViewModel
```

### 3.3 转换逻辑

```typescript
function distributionToViewModel(data: ShareDistributionResponse): CatalogViewModel {
  const dist = data.distributorInfo

  return {
    meta: {
      id: data.id,
      name: data.name,
      brand: data.brand,
      createdAt: data.createdAt,
    },
    hero: {
      coverImageUrl: data.coverImageUrl || null,
      brand: data.brand,
      name: data.name,
      createdAt: data.createdAt,
      productCount: data.products.length,
      customerName: dist.distributorName,     // ★ 分销商名称
    },
    categories: buildCategories(data.products),
    products: data.products.map(toProductInfoDistribution),
    distributor: {
      distributorName: dist.distributorName,
      cooperationLevel: dist.cooperationLevel,
      currency: dist.currency,
      validUntil: dist.validUntil || null,
      contactManager: dist.contactManager || null,
    },
    agreement: dist.agreementText
      ? { text: dist.agreementText }
      : null,
    features: {
      showPrice: true,                       // ★ 分销显示定价
      showCustomerName: true,               // ★ 显示分销商名
      showAgreement: !!dist.agreementText,  // ★ 有协议则显示
      showQualityAssurance: true,
    },
  }
}

function toProductInfoDistribution(p: ShareProduct): ProductInfo {
  return {
    spuCode: p.spuCode,
    title: p.title,
    category: p.category,
    mainImageUrl: p.mainImageUrl,
    images: p.images.main.map(img => ({
      url: img.url,
      alt: p.title,
    })),
    skus: p.skus.map(sku => {
      const hasPricing = sku.supplyPrice != null && sku.suggestedPrice != null
      return {
        skuCode: sku.skuCode,
        nameZh: sku.nameZh,
        nameEn: sku.nameEn,
        imageUrl: sku.imageUrl,
        pricing: hasPricing ? {
          supplyPrice: sku.supplyPrice,
          suggestedPrice: sku.suggestedPrice,
          profitMargin: ((sku.suggestedPrice - sku.supplyPrice) / sku.supplyPrice) * 100,
          profitAmount: sku.suggestedPrice - sku.supplyPrice,
          currency: dist.currency,
        } : null,
      }
    }),
  }
}
```

### 3.4 特点

- 定价字段从 `supplyPrice / suggestedPrice` 计算 `profitMargin` + `profitAmount`
- 分销商信息完整映射
- FeatureFlags 全部开启（按需）
- SKU 无定价时 `pricing: null`（优雅降级）

---

## 4. 共享工具函数

```typescript
/**
 * 从产品列表构建分类 (含计数)
 * 两个 Adapter 共用
 */
function buildCategories(products: { category: string }[]): CategoryInfo[] {
  const map = new Map<string, number>()
  const order: string[] = []

  for (const p of products) {
    if (!p.category) continue
    if (!map.has(p.category)) {
      map.set(p.category, 0)
      order.push(p.category)
    }
    map.set(p.category, map.get(p.category)! + 1)
  }

  return [
    { name: '全部', productCount: products.length },
    ...order.map(name => ({ name, productCount: map.get(name)! })),
  ]
}
```

---

## 5. 文件位置

```
src/adapters/
├── catalogAdapter.ts               // catalogToViewModel()
├── distributionAdapter.ts          // distributionToViewModel()
└── categoryUtils.ts                // buildCategories() 共享
```

---

## 6. 调用位置

### 当前 (Catalog)

```typescript
// src/app/c/[id]/page.tsx
const catalog = await getCatalog(id)
// 改为:
const viewModel = catalogToViewModel(catalog)
return <CatalogView viewModel={viewModel} />
```

### 未来 (Distribution)

```typescript
// src/app/d/[id]/page.tsx (新建)
const response = await fetch(`/api/share/distributions/${id}`)
const data = await response.json()
const viewModel = distributionToViewModel(data)
return <CatalogView viewModel={viewModel} />
```

---

## 7. 无侵入性

| 现有代码 | 影响 |
|----------|------|
| `getCatalog()` | 不修改，仍返回 `CatalogData` |
| `CatalogData` 类型 | 不修改 |
| `CatalogView` | Props 从 `{ catalog }` 改为 `{ viewModel }`（Breaking Change，需适配） |
| `page.tsx` | 增加 Adapter 调用 |
| 所有子组件 | 不修改（已支持 mode + FeatureFlags） |
