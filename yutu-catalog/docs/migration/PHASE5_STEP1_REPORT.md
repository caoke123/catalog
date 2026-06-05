# PHASE5_STEP1_REPORT — CatalogViewModel Architecture

> 日期：2026-06-03
> 阶段：Phase 5 Step 1（仅 Catalog，不含 Distribution）

---

## 1. 修改文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/app/c/[id]/page.tsx` | **修改** | 增加 Adapter 调用 (3 行变更) |
| `src/components/catalog/CatalogView.tsx` | **修改** | Props 改为 ViewModel (bridge 模式) |
| `src/lib/catalog.ts` | **清理** | 移除调试日志 |

## 2. 新增文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/adapters/catalogAdapter.ts` | **新增** | `catalogToViewModel()` + 类型定义 |

## 3. 删除文件

无。

---

## 4. 架构变更

### 4.1 数据流变化

```
旧:  Catalog JSON → getCatalog() → CatalogData → CatalogView → 子组件
新:  Catalog JSON → getCatalog() → CatalogData
         ├─ catalogToViewModel()  → CatalogViewModel → CatalogView (meta/hero/categories)
         └─ catalog.products      → CatalogProduct[]   → CatalogView (_products → 子组件)
```

### 4.2 CatalogView Props

```typescript
// 旧
{ catalog: CatalogData, mode?: 'catalog' | 'distribution' }

// 新
{ viewModel: CatalogViewModel, _products: CatalogProduct[] }
```

`_products` 是临时桥接字段，用于保持 ProductGrid / ProductSheet 接口兼容。未来子组件全部 ViewModel 化后移除。

### 4.3 page.tsx 变更

```typescript
// 旧
const catalog = await getCatalog(id)
if (!catalog) notFound()
return <CatalogView catalog={catalog} />

// 新
const catalog = await getCatalog(id)
if (!catalog) notFound()
const viewModel = catalogToViewModel(catalog)
return <CatalogView viewModel={viewModel} _products={catalog.products} />
```

### 4.4 子组件影响

| 组件 | 影响 |
|------|------|
| HeroSection | 不变（CatalogView 桥接 ViewModel → CatalogData） |
| CategoryTabs | 不变（直接接收 CatalogProduct[]） |
| ProductGrid | 不变（直接接收 CatalogProduct[]） |
| ProductSheet | 不变（直接接收 CatalogProduct） |
| ProductCard | 不变 |
| ProductSwiper | 不变 |
| SkuRow | 不变 |

---

## 5. 回归测试

| 测试项 | 结果 |
|--------|------|
| `pnpm tsc --noEmit` | ✅ 零错误 |
| `pnpm build` | ✅ 构建成功（2.2s） |
| 页面访问 | ✅ HTTP 200 |
| Hero 渲染 | ✅ "开启数字化展厅" |
| 分类 Tab | ✅ "包包挂件" |
| 产品数据 | ✅ "2605-0022" |
| 数据层 | ✅ `getCatalog()` 未修改（仅清理日志） |
| 路由 | ✅ `/c/[id]` 不变 |
| ISR | ✅ revalidate: 300 不变 |
| 分享链路 | ✅ Catalog 分享不变 |

---

## 6. 未来扩展路径

```
现在 (Phase 5 Step 1)
  └── catalogAdapter.ts  → CatalogViewModel ← CatalogView

未来 (Phase 5 Step 2)
  └── distributionAdapter.ts → CatalogViewModel ← CatalogView
                              ← /d/[id] page.tsx

那时 CatalogView 同时支持两个数据源，通过 FeatureFlags 控制差异。
```
