# DISTRIBUTION_REAL_API_AUDIT — 真实数据源审计

> 日期：2026-06-03
> 结论：无 PIM 后端 API，分销数据嵌入 R2 Catalog JSON

---

## 1. 审计结论

经过完整代码扫描：

| 检查项 | 结果 |
|--------|------|
| `packages/backend/` | ❌ 不存在 |
| API route 文件 | ❌ 不存在 |
| `GET /api/share/distributions/:id` | ❌ 不存在 |
| Express/Fastify 服务器 | ❌ 不存在 |

## 2. 真实数据源

**R2 Catalog JSON**（与 Catalog 共享同一数据源）：

```
https://yutu.nv315.top/catalogs/{id}.json
```

分销数据通过以下**可选字段**嵌入在 Catalog JSON 中：

### 2.1 数据扩展

```typescript
// Catalog JSON (R2) — 扩展字段
interface CatalogData {
  // ... 标准字段
  distributorInfo?: {           // ★ 分销专属
    distributorName: string
    cooperationLevel: string
    currency: string
    agreementText?: string
    validUntil?: string
    contactManager?: string
  }
}

interface CatalogSku {
  // ... 标准字段
  supplyPrice?: number          // ★ 供货价
  suggestedPrice?: number       // ★ 建议零售价
}
```

### 2.2 当前 R2 状态

| Catalog ID | 有无定价 | 有无分销商信息 |
|-----------|---------|--------------|
| `6e230750-b707-4946-8a40-df642317f3f3` | ❌ | ❌ |
| `abc123_distributor` | ❌ (仅 mock 数据) | ❌ (仅 mock 数据) |

**当前 R2 上暂无包含 pricing 和 distributorInfo 的真实分销目录。**

## 3. 数据获取策略

```typescript
// src/lib/distribution.ts
export async function getDistribution(id: string): Promise<CatalogData | null> {
  // 与 getCatalog 使用同一 R2 数据源
  // 返回的 CatalogData 可能包含 distributorInfo 和 SKU pricing
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL
  const url = `${r2BaseUrl}/catalogs/${id}.json`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return null
  return res.json()
}
```

## 4. 未来预期

当 PIM 后端就绪时，将替换为：

```
GET https://yutu.nv315.top/api/share/distributions/{id}
  → ShareDistributionResponse
  → distributionAdapter
  → CatalogViewModel
```

当前阶段使用 R2 扩展字段方案作为过渡。
