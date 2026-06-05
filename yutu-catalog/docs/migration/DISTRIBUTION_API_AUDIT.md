# Distribution API Audit — Share Distribution Endpoint

> 日期：2026-06-03
> 数据来源：catalog 项目 mock data + 后端 API 设计约定

---

## 1. API 端点

```
GET /api/share/distributions/:distributionId
```

返回：分销专享版图册的完整数据，包含定价信息和分销商信息。

---

## 2. API 响应结构 (TypeScript Interface)

```typescript
/**
 * GET /api/share/distributions/:distributionId
 * 后端返回的完整响应
 */
interface ShareDistributionResponse {
  id: string
  name: string
  brand: string
  createdAt: string
  coverImageUrl: string
  products: ShareProduct[]
  distributorInfo: DistributorInfo
}

interface ShareProduct {
  spuCode: string
  title: string
  category: string
  mainImageUrl: string
  images: {
    main: CatalogImage[]
  }
  skus: ShareSku[]
}

interface ShareSku {
  skuCode: string
  nameZh: string
  nameEn: string
  imageUrl: string
  supplyPrice: number        // ★ 供货结算价 (元)
  suggestedPrice: number     // ★ 建议零售指导价 (元)
}

interface DistributorInfo {
  distributorName: string    // 分销商名称
  cooperationLevel: string   // 合作等级
  currency: string           // 货币符号 (如 "¥")
  agreementText?: string     // 合作约定条款 (Markdown)
  validUntil?: string        // 有效期限
  contactManager?: string    // 专属对接人
}

interface CatalogImage {
  index: number
  url: string
  fileName?: string
}
```

---

## 3. API vs Catalog JSON 差异

| 维度 | Catalog JSON (`/catalogs/{id}.json`) | Distribution API |
|------|--------------------------------------|------------------|
| 数据源 | R2 静态 JSON | 后端 API (数据库) |
| 定价信息 | 无 | `supplyPrice` + `suggestedPrice` |
| 分销商信息 | 无 | `distributorInfo` (6 字段) |
| 产品结构 | 完全一致 | 完全一致 (仅 SKU 扩展) |
| 图片结构 | 完全一致 | 完全一致 |
| 分享类型 | 公开浏览 | 授权分销商专享 |

---

## 4. 字段映射

```
Catalog JSON "products[].skus[]"   →  Distribution API "products[].skus[]"
  + skuCode    = skuCode
  + nameZh     = nameZh
  + nameEn     = nameEn
  + imageUrl   = imageUrl
  - (无)       → supplyPrice    ★ 新增
  - (无)       → suggestedPrice ★ 新增

Catalog JSON "root"                →  Distribution API "root"
  + id         = id
  + name       = name
  + brand      = brand
  + createdAt  = createdAt
  + coverImage = coverImageUrl
  + products   = products
  - (无)       → distributorInfo ★ 新增
```

---

## 5. 定价字段说明

| 字段 | 含义 | 示例 |
|------|------|------|
| `supplyPrice` | 代发供货结算价 (元) | 12.80 |
| `suggestedPrice` | 建议零售指导价 (元) | 39.00 |
| 利润率 | `(suggestedPrice - supplyPrice) / supplyPrice * 100` | 204.7% |
| 单件利润 | `suggestedPrice - supplyPrice` | 26.20元 |

---

## 6. 安全考虑

| 风险 | 缓解 |
|------|------|
| Distribution API 暴露供货价 | 仅授权分销商可访问 (后端鉴权) |
| 公开 Catalog 包含定价数据 | Catalog 数据不应包含 supplyPrice |
| API 响应被缓存 | 禁用 CDN 缓存或使用 short revalidate |
