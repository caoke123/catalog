# VIEWMODEL_MIGRATION_REPORT — CatalogViewModel Full Migration

> 日期：2026-06-03
> 阶段：Phase 5 Step 1B（完整 ViewModel 迁移）

---

## 1. 修改文件

| 文件 | 变更 |
|------|------|
| `src/adapters/catalogAdapter.ts` | +PricingInfo, +FeatureFlags, +pricing:null in SKU mapping |
| `src/components/catalog/HeroSection.tsx` | Props: `catalog: CatalogData` → `hero: HeroInfo` |
| `src/components/catalog/CategoryTabs.tsx` | 类型: `CatalogProduct[]` → `ProductInfo[]` |
| `src/components/catalog/ProductCard.tsx` | 类型: `CatalogProduct` → `ProductInfo`；props: `mode` → `features` |
| `src/components/catalog/ProductGrid.tsx` | 类型: `CatalogProduct[]` → `ProductInfo[]`；props: `mode` → `features` |
| `src/components/catalog/ProductSheet.tsx` | 类型: `CatalogProduct` → `ProductInfo`；props: `mode` → `features` |
| `src/components/catalog/ProductSwiper.tsx` | 类型: `CatalogImage[]` → `ImageInfo[]` |
| `src/components/catalog/SkuRow.tsx` | 类型: `CatalogSku[]` → `SkuInfo[]` |
| `src/components/catalog/CatalogView.tsx` | 删除 `_products` bridge；全部使用 `viewModel` |
| `src/app/c/[id]/page.tsx` | 删除 `_products={catalog.products}` 桥接 |

## 2. 新增文件

无。

## 3. 删除内容

| 删除项 | 位置 |
|--------|------|
| `_products: CatalogProduct[]` prop | CatalogView, page.tsx |
| `mode?: 'catalog' \| 'distribution'` prop | CatalogView, ProductGrid, ProductCard, ProductSheet |
| `CatalogData` / `CatalogProduct` / `CatalogSku` / `CatalogImage` import | 全部 7 个组件文件 |

## 4. 类型替换矩阵

| 组件 | 旧类型 | 新类型 | 来源 |
|------|--------|--------|------|
| HeroSection | `CatalogData` | `HeroInfo` | `@/adapters/catalogAdapter` |
| CategoryTabs | `CatalogProduct[]` | `ProductInfo[]` | `@/adapters/catalogAdapter` |
| ProductGrid | `CatalogProduct[]` | `ProductInfo[]` | `@/adapters/catalogAdapter` |
| ProductCard | `CatalogProduct` | `ProductInfo` | `@/adapters/catalogAdapter` |
| ProductSheet | `CatalogProduct` | `ProductInfo` | `@/adapters/catalogAdapter` |
| ProductSwiper | `CatalogImage[]` | `ImageInfo[]` | `@/adapters/catalogAdapter` |
| SkuRow | `CatalogSku[]` | `SkuInfo[]` | `@/adapters/catalogAdapter` |
| CatalogView | `CatalogData` | `CatalogViewModel` | `@/adapters/catalogAdapter` |

## 5. 新架构图

```
                  /c/[id] page.tsx
                        │
                  getCatalog(id)          ← src/lib/catalog.ts (不改)
                        │
                  CatalogData
                        │
                  catalogToViewModel()    ← src/adapters/catalogAdapter.ts
                        │
                  CatalogViewModel
                   ├── meta
                   ├── hero       → HeroSection
                   ├── categories → CategoryTabs
                   ├── products   → ProductGrid → ProductCard
                   │                            → ProductSheet → ProductSwiper
                   │                                           → SkuRow
                   └── features   → ProductCard (showPrice)
                                  → ProductSheet (showPrice)
```

**唯一数据源**: `CatalogViewModel`。所有 UI 组件只依赖此类型及其子类型。

## 6. 类型边界验证

```
搜索: CatalogData | CatalogProduct | CatalogSku | CatalogImage
范围: src/components/catalog/*

结果: 0 matches ✅
```

旧类型仅存在于合法位置:
- `src/types/catalog.ts` — 类型定义
- `src/lib/catalog.ts` — 数据获取 (返回 `CatalogData`)
- `src/adapters/catalogAdapter.ts` — Adapter (输入 `CatalogData`)

## 7. 编译与构建

| 测试项 | 结果 |
|--------|------|
| `pnpm tsc --noEmit` | ✅ 零错误 |
| `pnpm build` | ✅ 成功 (2.2s) |
| 类型边界扫描 | ✅ 组件层零旧类型 |

## 8. 回归测试

| 测试项 | 结果 |
|--------|------|
| 页面访问 | ✅ HTTP 200 |
| Hero 渲染 | ✅ "开启数字化展厅" |
| 分类 Tab | ✅ "包包挂件" |
| 产品数据 | ✅ "可爱毛绒小熊" |
| 数据层 | ✅ `getCatalog()` 未修改 |
| 路由 | ✅ `/c/[id]` 不变 |
| ISR | ✅ revalidate:300 不变 |
| 分享链路 | ✅ Catalog 分享不变 |

## 9. 遗留问题

无。

## 10. 下一步

Phase 5 Step 2:
- 创建 `src/adapters/distributionAdapter.ts`
- 实现 `/d/[id]` 路由
- 接入 Share Distribution API
- 启用 pricing 显示
