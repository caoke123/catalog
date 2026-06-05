# PHASE4_STEP2B_REPORT — Product Components Migration

> 日期：2026-06-03
> 批次：第二批-B（产品展示组件）

---

## 1. 修改文件

| 文件 | 类型 | 行数变化 |
|------|------|----------|
| `CategoryTabs.tsx` | 重写 | 38 → 73 行 |
| `ProductCard.tsx` | 重写 | 34 → 85 行 |
| `ProductGrid.tsx` | 重写 | 75 → 158 行 |
| `ProductSheet.tsx` | 重写 | 88 → 190 行 |
| `ProductSwiper.tsx` | 重写 | 41 → 61 行 |
| `SkuRow.tsx` | 重写 | 55 → 78 行 |
| `CatalogView.tsx` | 适配 | Props 接口升级 |

## 2. 新增文件

无。

## 3. 删除文件

无。

---

## 4. 组件变更详情

### 4.1 CategoryTabs

| 变更 | 旧 | 新 |
|------|----|----|
| 控制方式 | 内部 `useState` | 受控组件 (`activeCategory` prop) |
| 产品计数 | 无 | 每个 Tab 显示产品数 badge |
| 图标 | 无 | "全部" 显示 Grid icon |
| 品牌标识 | 无 | 桌面端显示 "雨图精选图册 · 品质保障" + Sparkles |
| 样式 | 纯白 + 灰 | 毛玻璃 (`backdrop-blur-xl`) + 阴影 |
| 选中态 | `bg-black` | `bg-zinc-950` + `shadow-md` + `scale-[1.03]` |

### 4.2 ProductCard

| 变更 | 旧 | 新 |
|------|----|----|
| 动画 | 无 (纯 CSS) | `motion` hover: `y:-5 scale:1.01` spring |
| 卡片样式 | `rounded-lg` 无边框 | `rounded-2xl` + `border` + `shadow` |
| SPU 编码 | 文字下方 | 图片左下角毛玻璃 pill |
| SKU 角标 | 黑色圆角 | 琥珀色 + Layers icon + "Nsku" |
| 图片效果 | 静态 | `group-hover:scale-105` 放大 |
| 分类标签 | 无 | 底部胶囊 badge |
| 定价区 | 无 | **预留**: 分销模式下琥珀色占位条 |
| `mode` prop | 无 | `'catalog' \| 'distribution'` |

### 4.3 ProductGrid (ProductGallery)

| 变更 | 旧 | 新 |
|------|----|----|
| 搜索框 | 无 | Search icon + 输入框 (按 title/spuCode) |
| 网格 | 固定 2 列 | 响应式: 2→3→4 列 (`sm:grid-cols-3 lg:grid-cols-4`) |
| 入场动画 | 无 | `staggerChildren` + spring 错落入场 |
| 空状态 | 无 | FilterX icon + 提示文案 |
| 完成指示 | "共 N 件" | Sparkles + "已经向您展示全部..." |
| 骨架屏 | 简单 div | 模拟卡片形状骨架 |
| 过滤逻辑 | 外部 (CatalogView) | **内置** (useMemo 过滤) |
| `activeCategory` prop | 无 | 新增 (受控) |

### 4.4 ProductSheet

| 变更 | 旧 | 新 |
|------|----|----|
| 遮罩 | `bg-black/50` | `bg-zinc-950/60 backdrop-blur-sm` 毛玻璃 |
| 圆角 | `rounded-t-2xl` | `rounded-t-[32px]` 更大圆角 |
| 关闭按钮 | 无 | 左上角毛玻璃 X 按钮 |
| 分类标签 | 灰色胶囊 | 琥珀色 + Sparkles + `animate-spin-slow` |
| 拖拽手柄 | 静态 | `cursor-grab` + 触摸拖拽 |
| SKU 选中态 | 简单切换 | 深色背景 + Check overlay |
| 定价区 | 无 | **预留**: 3 列定价计算器布局 (分布模式下 `opacity-50`) |
| 品控声明 | 无 | ShieldCheck + 耐磨材质/做工/A级精工/低敏 |
| `mode` prop | 无 | `'catalog' \| 'distribution'` |

### 4.5 ProductSwiper

| 变更 | 旧 | 新 |
|------|----|----|
| 控制方式 | `onSwiper` 回调 | `currentIndex` + `onIndexChange` 受控 |
| 样式 | `bg-gray-100` | `bg-zinc-50 rounded-2xl shadow-inner` |
| 空状态 | 无 | "无可用图片" 占位 |
| 分页指示 | Swiper fraction | 自定义毛玻璃 badge 右上角 |
| 初始位置 | 0 | `initialSlide={currentIndex}` (支持 SKU 跳转) |

### 4.6 SkuRow

| 变更 | 旧 | 新 |
|------|----|----|
| 标题 | 无 | "可用规格选项 (N 种配色/材质)" |
| 卡片样式 | 小圆形 | `rounded-2xl` 矩形胶囊 |
| 选中态 | `border-black` | `bg-zinc-950` + Check overlay |
| 信息展示 | 仅 nameZh | nameZh + nameEn + skuCode |
| Props | `onSkuClick(index)` | `onSelectSku(sku)` — 传递完整 SKU 对象 |

---

## 5. mode 扩展预留

所有组件已统一接受 `mode?: 'catalog' | 'distribution'`：

```
CatalogView
  ├── mode → ProductGrid → ProductCard
  └── mode → ProductSheet
```

| mode | ProductCard | ProductSheet |
|------|-------------|--------------|
| `'catalog'` (默认) | 纯展示 | 纯展示 + 品控声明 |
| `'distribution'` | 定价区占位 (opacity-40) | 定价计算器占位 (opacity-50) |

未来接入 Distribution API 时，只需将 `mode='distribution'` 并填充定价数据即可，无需修改组件结构。

---

## 6. 接口变更（对外影响）

| 组件 | 变更 | 兼容性 |
|------|------|--------|
| `CategoryTabs` | 新增 `activeCategory` prop | ⚠️ 调用方需传入 |
| `ProductGrid` | 新增 `activeCategory` + `mode` props | ⚠️ 调用方需传入 |
| `ProductCard` | 新增 `mode` prop (可选) | ✅ 默认 `'catalog'` |
| `ProductSheet` | 新增 `mode` prop (可选) | ✅ 默认 `'catalog'` |
| `ProductSwiper` | Props 改为 `currentIndex`/`onIndexChange` | ⚠️ 调用方需适配 |
| `CatalogView` | 新增 `mode` prop (可选) | ✅ 默认 `'catalog'` |

---

## 7. 回归测试

| 测试项 | 结果 |
|--------|------|
| `pnpm tsc --noEmit` | ✅ 零错误 |
| `pnpm build` | ✅ 构建成功（2.1s） |
| 数据层 | ✅ 未修改 `getCatalog()` |
| 类型定义 | ✅ 未修改 `CatalogData` |
| 路由 | ✅ 未修改 `/c/[id]` |
| ISR | ✅ 未修改 |
| 分享链路 | ✅ Catalog 分享 `/c/:id` 不变 |
