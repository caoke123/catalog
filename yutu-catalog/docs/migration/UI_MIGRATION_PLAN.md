# UI Migration Plan — catalog → yutu-catalog

> 迁移方案日期：2026-06-03
> 前置文档：[UI_MIGRATION_AUDIT.md](./UI_MIGRATION_AUDIT.md)

---

## 1. 可直接复用组件

以下组件功能与 Props 完全一致，直接从 catalog 复制到 yutu-catalog 即可：

| 组件 | 来源 | 目标 | 修改点 |
|------|------|------|--------|
| `CategoryTabs.tsx` | catalog | yutu-catalog | 无 (Props 兼容,仅增加产品数 badge) |
| `SkuRow.tsx` | catalog | yutu-catalog | 无 (增加选中态,但 Props 向前兼容) |
| `ProductSwiper.tsx` | catalog | yutu-catalog | ⚠️ 替换 Swiper.js → 自定义轮播 (见改造) |

---

## 2. 需要改造组件

### 2.1 HeroSection.tsx

**改造内容**:
- 保留 Next.js SSR 的 `coverImageUrl` 条件渲染 (空值时渐变背景)
- 增加: Y Logo, brand pill, 发布日期, 产品数, 脉冲滚动指示器
- 增加: 背景视差效果 (`scale-110`)
- CTA 文案: "查看图册 →" → "开启数字化展厅" + ChevronDown
- 动画库: `framer-motion` → `motion` (import 替换)

**风险**: 低 — 纯视觉升级,不涉及数据

### 2.2 ProductCard.tsx

**改造内容**:
- 增加: motion hover 动画 (`whileHover`, `whileTap`)
- 增加: 定价展示 (supplyPrice/suggestedPrice,条件渲染)
- 增加: category pill 底部标签
- 卡片样式: 升级为 `rounded-2xl`, `border`, `shadow`
- 保留: SKU 数量 badge (兼容 "N sku" vs "N 款")
- 反向兼容: 无 pricing 数据时不显示定价区

**风险**: 中 — 定价字段为可选,不出现在纯展示目录中

### 2.3 ProductGrid.tsx

**改造内容**:
- 增加响应式列数: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- 增加: 搜索框 (按 title/spuCode 过滤)
- 增加: 空状态 (FilterX icon + "未找到匹配产品")
- 增加: 完成指示器 (Sparkles icon)
- 保留: IntersectionObserver 无限滚动 + Skeleton
- 替换: inline `SkeletonCard` → 使用 shadcn `Skeleton`

**风险**: 中 — 网格布局改动,需测试移动端

### 2.4 ProductSheet.tsx

**改造内容**:
- 增加: SKU 选中态管理 (`selectedSku`, `useState`)
- 增加: 定价计算器 (供货价/零售价/利润率/收益,`useMemo`)
- 增加: 品控保障区 (ShieldCheck icon)
- 增加: 关闭按钮 (X icon)
- 保留: framer-motion → motion 弹入动画
- 保留: ProductSwiper + SkuRow 嵌套
- 整体风格: 升级为 catalog 设计语言 (毛玻璃,amber 品牌色)
- 反向兼容: 无 pricing 数据时隐藏定价区

**风险**: 高 — 大量状态逻辑增加,需确保定价计算无 bug

### 2.5 CatalogView.tsx

**改造内容**:
- App.tsx 的状态机逻辑 (cover/list 视图) 迁移到 CatalogView
- 增加: `viewMode` 状态 (`cover` | `list`)
- 增加: body scroll lock (cover 模式时)
- 增加: 触摸滑动切换 (cover → list)
- 增加: 分销横幅 (distributorInfo 存在时显示)
- 增加: CatalogSelector (多目录切换, inline)
- 增加: 协议弹窗 (agreement modal)
- 保留: Next.js 的 SSR 数据注入 (`catalog` prop)
- 保留: `activeCategory` + `selectedProduct` 状态管理

**风险**: 高 — 核心组件,影响所有子组件

---

## 3. 需要新增 Adapter

### 3.1 `src/adapters/catalogAdapter.ts`

```typescript
// 将 CatalogData → ViewModel
// 为未来 Distribution 数据共用 UI 预留扩展点

interface CatalogViewModel {
  catalog: CatalogData
  viewMode: 'cover' | 'list'
  activeCategory: string
  isDistributor: boolean       // 是否分销模式
  pricing: {                    // 定价信息(可选)
    hasPricing: boolean
    minSupplyPrice: number | null
    minRetailPrice: number | null
    currency: string
  } | null
}
```

**作用**: 统一数据层接口, Catalog JSON 和未来 Distribution API 都映射到同一 ViewModel,UI 组件只依赖 ViewModel。

### 3.2 `src/adapters/distributionAdapter.ts` (预留)

```typescript
// 未来: Distribution API 响应 → CatalogViewModel
// import { DistributionResponse } from '@/types/distribution'
// export function distributionToViewModel(d: DistributionResponse): CatalogViewModel
```

---

## 4. 风险点

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| `framer-motion` → `motion` 替换遗漏 | 中 | 全局搜索替换,确保所有 import 正确 |
| 定价字段不存在导致运行时错误 | 低 | 全部使用可选链 (`?.`) 和条件渲染 |
| ProductSwiper 自定义轮播替换 Swiper.js | 中 | 保留 Swiper.js 作为回退,逐步迁移 |
| Next.js SSR 与 motion 客户端动画冲突 | 中 | 加 `'use client'` 指令,避免 SSR 水合错误 |
| 响应式网格在移动端布局异常 | 低 | 移动端保持 2 列,仅桌面扩展 |
| 多目录切换破坏了路由 `/c/[id]` | 高 | ⚠️ 暂不迁移 CatalogSelector,保持单目录路由 |

---

## 5. 工作量评估

| 阶段 | 任务 | 预估时间 |
|------|------|----------|
| Step 1 | 替换 `framer-motion` → `motion` | 15 min |
| Step 2 | 替换 HeroSection | 30 min |
| Step 3 | 替换 CategoryTabs + SkuRow | 20 min |
| Step 4 | 替换 ProductCard | 30 min |
| Step 5 | 替换 ProductGrid (含搜索 + 响应式) | 40 min |
| Step 6 | 替换 ProductSwiper | 45 min |
| Step 7 | 替换 ProductSheet (含定价) | 60 min |
| Step 8 | 改造 CatalogView (含视图模式) | 45 min |
| Step 9 | 新增 CatalogAdapter | 20 min |
| Step 10 | 样式统一 (主题色、圆角、阴影) | 30 min |
| Step 11 | 回归测试 | 30 min |
| **总计** | | **~6.5 小时** |

---

## 6. 实施顺序

```
Step 0:  创建安全边界 (DO_NOT_TOUCH.md)
         ↓
Step 1:  安装 motion 包,替换 framer-motion import
         ↓
Step 2:  创建 src/adapters/catalogAdapter.ts
         ↓
Step 3:  逐组件替换 (从叶子组件到根组件)
         ├── SkuRow          (无依赖)
         ├── ProductSwiper   (无依赖)
         ├── ProductCard     (依赖 types)
         ├── CategoryTabs    (依赖 types)
         ├── ProductGrid     (依赖 ProductCard)
         ├── HeroSection     (依赖 CatalogData)
         ├── ProductSheet    (依赖 ProductSwiper + SkuRow)
         └── CatalogView     (依赖所有)
         ↓
Step 4:  回归测试 /c/[id]
         ↓
Step 5:  提交迁移报告
```

---

## 7. 不迁移内容

以下 catalog 功能**暂不迁移**到 yutu-catalog：

| 功能 | 原因 |
|------|------|
| CatalogSelector (多目录切换) | 破坏 `/c/[id]` 路由设计 |
| CatalogDashboard (分析仪表盘) | 不属于产品图册核心功能 |
| AgreementModal (协议弹窗) | 未来 Distribution 项目实现 |
| Mock data 回退 | 保留纯 R2 数据源 |
| DistributorInfo 展示 | 等待 /d/:distributionId 路由开发 |
| Google Fonts (Inter/JetBrains Mono) | 保持系统字体 (避免网络依赖) |
