# Routing Design — Catalog & Distribution 统一路由方案

> 日期：2026-06-03
> 目标：Catalog 和 Distribution 共用 CatalogView，差异化仅通过数据层

---

## 1. 路由结构

```
/c/[catalogId]       → Catalog 公开浏览 (现有)
/d/[distributionId]  → Distribution 分销专享 (新增)
```

---

## 2. 路由文件布局

```
src/app/
├── c/
│   └── [id]/
│       ├── page.tsx          ← 现有，改为使用 Adapter
│       ├── loading.tsx       ← 不变
│       ├── error.tsx         ← 不变
│       └── not-found.tsx     ← 不变
└── d/                        ← ★ 新增
    └── [id]/
        ├── page.tsx          ← 新增: fetch API → Adapter → CatalogView
        ├── loading.tsx       ← 可复用 /c/[id]/loading.tsx
        ├── error.tsx         ← 可复用 /c/[id]/error.tsx
        └── not-found.tsx     ← 可复用 /c/[id]/not-found.tsx
```

---

## 3. 路由实现方案

### 3.1 /c/[id] — Catalog (现有 + 改造)

```typescript
// src/app/c/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'
import { catalogToViewModel } from '@/adapters/catalogAdapter'
import CatalogView from '@/components/catalog/CatalogView'

export default async function CatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const catalog = await getCatalog(id)
  if (!catalog) notFound()

  const viewModel = catalogToViewModel(catalog)  // ★ 新增 Adapter 调用
  return <CatalogView viewModel={viewModel} />
}
```

**差异**: 仅增加一行 `catalogToViewModel()` 调用，数据层 `getCatalog()` 不变。

### 3.2 /d/[id] — Distribution (新增)

```typescript
// src/app/d/[id]/page.tsx (新建)
import { notFound } from 'next/navigation'
import { distributionToViewModel } from '@/adapters/distributionAdapter'
import CatalogView from '@/components/catalog/CatalogView'

export default async function DistributionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/share/distributions/${id}`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) notFound()

  const data = await res.json()
  const viewModel = distributionToViewModel(data)
  return <CatalogView viewModel={viewModel} />
}
```

**差异**: 
- 数据来源: R2 JSON → API 请求
- Adapter: `catalogToViewModel` → `distributionToViewModel`
- 其余完全一致

---

## 4. CatalogView Props 适配

### 4.1 当前 Props

```typescript
interface CatalogViewProps {
  catalog: CatalogData
  mode?: 'catalog' | 'distribution'
}
```

### 4.2 目标 Props

```typescript
interface CatalogViewProps {
  viewModel: CatalogViewModel
}
```

### 4.3 迁移影响

```
CatalogView
  ├── catalog.products       → viewModel.products
  ├── catalog (HeroSection)  → viewModel.hero
  ├── mode                   → 移除 (由 viewModel.features 替代)
  └── (所有子组件)            → 改为接收 viewModel 子类型
```

### 4.4 迁移策略

**Option A: 一步到位** (推荐)
```
CatalogView 直接改为接收 viewModel
子组件同步改为接收 viewModel 子类型
Breaking: 所有现有调用方需适配
```

**Option B: 渐进式** (保守)
```
CatalogView 保留 catalog Prop，内部构建 viewModel
新增 viewModel Prop (可选)，优先使用
过渡期: 两个 Prop 共存
```

**推荐 Option A**，因为当前只有一处调用 (`page.tsx`)，变更范围小。

---

## 5. 功能开关驱动

```typescript
// CatalogView 内部
function CatalogView({ viewModel }: { viewModel: CatalogViewModel }) {
  const features = viewModel.features

  return (
    <>
      <HeroSection
        hero={viewModel.hero}
        showCustomerName={features.showCustomerName}
      />
      <CategoryTabs categories={viewModel.categories} />
      <ProductGrid
        products={viewModel.products}
        showPrice={features.showPrice}
      />
      <ProductSheet
        product={selectedProduct}
        showPrice={features.showPrice}
        showQualityAssurance={features.showQualityAssurance}
      />
      {features.showAgreement && viewModel.agreement && (
        <AgreementModal agreement={viewModel.agreement} />
      )}
      {features.showCustomerName && viewModel.distributor && (
        <DistributorBanner distributor={viewModel.distributor} />
      )}
    </>
  )
}
```

---

## 6. URL 差异总结

| 维度 | `/c/:id` | `/d/:id` |
|------|----------|----------|
| 访问权限 | 公开 | 授权分销商 |
| 数据源 | R2 静态 JSON | API 动态查询 |
| 缓存策略 | ISR 5min | ISR 5min (或更短) |
| 定价显示 | 否 | 是 |
| 分销商信息 | 否 | 是 |
| 协议 | 否 | 是 (如有) |
| 品控声明 | 是 | 是 |
| ViewModel | `catalogToViewModel` | `distributionToViewModel` |
| 共享组件 | CatalogView | CatalogView (相同) |

---

## 7. 环境变量需求

```env
# .env.local
NEXT_PUBLIC_R2_BASE_URL=https://yutu.nv315.top       # 现有
NEXT_PUBLIC_CATALOG_PATH=/catalogs                   # 现有
NEXT_PUBLIC_API_BASE_URL=https://yutu.nv315.top      # ★ 新增 (Distribution API)
```

---

## 8. 实施检查清单 (未来实施时)

- [ ] 创建 `src/app/d/[id]/` 路由
- [ ] 实现 `distributionAdapter.ts`
- [ ] 改造 `CatalogView` 为 ViewModel 驱动
- [ ] 适配 `/c/[id]/page.tsx` 使用 Adapter
- [ ] 实现 `/d/[id]/page.tsx`
- [ ] 测试 Catalog 分享回归
- [ ] 测试 Distribution 分享
- [ ] 测试定价显示 (有/无 pricing)
- [ ] 测试协议弹窗
- [ ] 测试分销商横幅
- [ ] `tsc --noEmit` + `pnpm build`
