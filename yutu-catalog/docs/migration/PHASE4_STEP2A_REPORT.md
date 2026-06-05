# PHASE4_STEP2A_REPORT — Layout & Hero Migration

> 日期：2026-06-03
> 批次：第二批-A（布局层优先）

---

## 1. 修改文件

| 文件 | 修改类型 | 变更要点 |
|------|----------|----------|
| `src/components/catalog/HeroSection.tsx` | **重写** | 完全采用 catalog 设计（52→104 行） |
| `src/app/layout.tsx` | **升级** | 中文字体栈、viewport 配置、模板 title |

## 2. 新增文件

无。

## 3. 删除文件

无。

---

## 4. 变更详情

### 4.1 HeroSection.tsx — 视觉升级对照

| 区域 | 旧版 | 新版（catalog 设计） |
|------|------|---------------------|
| **Header** | 无 | Y Logo（毛玻璃圆形）+ 品牌名 |
| **背景** | `object-cover` 静态 | `scale-110` 视差 + `brightness-90` + `saturate-105` |
| **遮罩** | 纯黑 35% | 顶部→中间→底部三层渐变 (`from-black/50 via-black/35 to-zinc-950/90`) |
| **品牌标识** | 无 | 毛玻璃胶囊：`{brand} COLLECTIVE` |
| **标题** | `brand` 为主标题（h1） | `name` 为主标题（h1），品牌独立展示 |
| **日期** | 无 | `formattedDate` + Calendar icon + 产品数 |
| **按钮** | "查看图册 →"（描边） | "开启数字化展厅"（白底黑字 + bouncing ChevronDown） |
| **底部** | 静态渐变块 | 动画脉冲滚动指示器 + "向上轻扫 或 点击进入" |
| **动画** | `y:20→0 opacity` 0.6s | `y:24→0 opacity` 0.8s easeOut |
| **交互** | 点击按钮滚动 | 点击按钮 + 点击底部指示器 + 滑动均可进入 |

### 4.2 layout.tsx — 页面框架升级

```typescript
// 元数据
title: "雨图饰品 产品图册"          // 新增品牌名
title.template: "%s | 雨图饰品 E-Catalog"  // 新增子页模板

// 移动端适配
viewport: maximumScale=1, userScalable=false  // 防双击缩放
themeColor: "#18181b"                          // 状态栏深色

// 全局样式
body: bg-zinc-50 text-zinc-900                // 统一的 zinc 底色
```

### 4.3 未创建独立 Header/Footer

catalog 项目的 Header（Y Logo + 品牌名）和 Footer（滚动指示器）内嵌在 `HeroSection` 中。保持此架构，不强行拆分，避免无意义的重构。

---

## 5. CatalogView 未来扩展方案

### 5.1 现状

```typescript
interface CatalogViewProps {
  catalog: CatalogData     // 单一数据源
}
```

### 5.2 目标架构

```typescript
interface CatalogViewProps {
  catalog: CatalogData
  mode?: 'catalog' | 'distribution'       // 视图模式
  features?: CatalogViewFeatures           // 功能开关
}

interface CatalogViewFeatures {
  showPrice?: boolean          // 默认: mode === 'distribution'
  showCustomerName?: boolean   // 默认: mode === 'distribution' && has distributorInfo
  showAgreement?: boolean      // 默认: mode === 'distribution' && has agreementText
}
```

### 5.3 实现路径

```
第 3 批完成后:

CatalogData
    │
    ▼
catalogAdapter.ts (新增)
    │ 转换为 CatalogViewModel
    │ 根据 mode 计算 features
    ▼
CatalogView
    │ props: mode, features
    │
    ├── mode='catalog'  → 纯展示 (当前行为)
    │
    └── mode='distribution'
        ├── HeroSection: 显示分销商横幅
        ├── ProductCard: 显示 supplyPrice/suggestedPrice
        └── ProductSheet: 显示定价计算器 + 品控保障
```

### 5.4 不破坏现有路由

```
/c/:catalogId        → mode='catalog' (默认)
/d/:distributionId   → mode='distribution' (未来)
```

两者共用同一套 UI 组件，通过 `features` 控制功能显隐。

---

## 6. ProductCard 延后原因

| 原因 | 说明 |
|------|------|
| **Distribution 复用** | 产品卡片的定价展示将按 mode 条件渲染，延后到与 Distribution 一起设计 |
| **避免重复重构** | 现在迁移 → Distribution 时二次修改 → 一次到位更高效 |
| **视觉不影响** | Hero 层已代表整体视觉风格，ProductCard 的卡片样式可通过 CSS 变量自动适配 |

---

## 7. 回归测试

| 测试项 | 结果 |
|--------|------|
| `pnpm tsc --noEmit` | ✅ 零错误 |
| `pnpm build` | ✅ 构建成功（1.8s） |
| Props 兼容性 | ✅ `catalog: CatalogData`, `onEnter: () => void` 不变 |
| 空 coverImageUrl | ✅ 渐变背景回退保留 |
| ISR 缓存 | ✅ 未修改 `getCatalog()` |
| 数据层 | ✅ 未修改 |
