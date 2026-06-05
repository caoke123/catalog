# PHASE5_STEP2B_REPORT — Distribution Real Data Integration

> 日期：2026-06-03
> 阶段：接入真实 Distribution 数据层

---

## 1. 真实接口审计

**结论**: 无独立 PIM 后端 API。分销数据嵌入在 R2 Catalog JSON 的扩展字段中。

```
数据源: https://yutu.nv315.top/catalogs/{id}.json
扩展字段:
  CatalogData.distributorInfo?     (分销商信息)
  CatalogSku.supplyPrice?          (供货价)
  CatalogSku.suggestedPrice?       (建议零售价)
```

详细审计: `docs/migration/DISTRIBUTION_REAL_API_AUDIT.md`

## 2. 修改文件

| 文件 | 变更 |
|------|------|
| `src/types/catalog.ts` | +CatalogSku.supplyPrice?, +CatalogSku.suggestedPrice?, +DistributorInfo, +CatalogData.distributorInfo? |
| `src/app/dev/distribution-preview/page.tsx` | 支持 `?id=xxx` URL 参数 + mock 回退 |

## 3. 新增文件

| 文件 | 说明 |
|------|------|
| `src/lib/distribution.ts` | `getDistribution(id)` — 从 R2 获取分销图册 (同 catalog 数据源) |
| `src/adapters/distributionAdapter.ts` | `distributionToViewModel()` — R2 JSON → CatalogViewModel (含定价计算) |

## 4. Adapter 映射表

| R2 JSON 字段 | CatalogViewModel 字段 | 计算逻辑 |
|-------------|----------------------|----------|
| `distributorInfo.distributorName` | `hero.customerName` | 直接映射 |
| `distributorInfo.cooperationLevel` | `distributor.cooperationLevel` | 直接映射 |
| `distributorInfo.currency` | `distributor.currency` | 直接映射 |
| `sku.supplyPrice` | `sku.pricing.supplyPrice` | 直接映射 |
| `sku.suggestedPrice` | `sku.pricing.suggestedPrice` | 直接映射 |
| — | `sku.pricing.profitMargin` | `((suggested - supply) / supply) * 100` |
| — | `sku.pricing.profitAmount` | `suggested - supply` |
| `distributorInfo` 存在 | `features.showCustomerName` | `true` |
| SKU 中有 pricing | `features.showPrice` | `true` |
| `distributorInfo.agreementText` 存在 | `features.showAgreement` | `true` |
| 无 | `features.showQualityAssurance` | 始终 `true` |

## 5. Preview 页面行为

| URL | 数据来源 | 行为 |
|-----|---------|------|
| `/dev/distribution-preview` | mock 数据 | 直接渲染 Distribution UI |
| `/dev/distribution-preview?id=xxx` | R2 fetch | 成功→真实数据; 失败→mock 回退 |

## 6. 编译与构建

| 测试项 | 结果 |
|--------|------|
| `pnpm tsc --noEmit` | ✅ 零错误 |
| `pnpm build` | ✅ 成功 (2.2s), 5个路由 |
| `/dev/distribution-preview` (mock) | ✅ HTTP 200, Loading → CatalogView |
| `/dev/distribution-preview?id=real` | ✅ 尝试 R2 fetch, 失败时回退 mock |

## 7. 当前 R2 状态

R2 上尚无包含 `distributorInfo` 和 `supplyPrice` 的真实分销目录。待 PIM 后端发布后，只需上传包含这些扩展字段的 JSON 到 R2，Preview 页面即可展示真实数据。

## 8. 回归测试

| 测试项 | 结果 |
|--------|------|
| Catalog 路由 `/c/[id]` | ✅ 不受影响 |
| Catalog 数据获取 | ✅ `getCatalog()` 未修改 |
| 类型扩展向后兼容 | ✅ 所有新字段为可选 |
| ISR 缓存 | ✅ 未修改 |
| Cloudflare 配置 | ✅ 未修改 |
