# PHASE4_STEP1_REPORT — Design System Migration

> 日期：2026-06-03
> 批次：第一批（设计系统层）

---

## 1. 修改文件

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/app/globals.css` | **重写** | 设计令牌全面升级为 catalog 设计系统 |

## 2. 新增文件

无。

## 3. 删除文件

无。

---

## 4. 设计系统变更详情

### 4.1 品牌色 (Primary)
```
变更前: neutral black  oklch(0.205 0 0)
变更后: amber gold     oklch(0.795 0.185 84.4)
```
影响范围：所有使用 `bg-primary`、`text-primary`、`border-primary` 的组件自动获得琥珀金色。

### 4.2 圆角 (Radius)
```
变更前: 0.625rem
变更后: 0.75rem（圆角更大，更接近 catalog 的 rounded-2xl 风格）
```

### 4.3 字体 (Typography)
```
变更前: var(--font-sans) [未定义,回退系统字体]
变更后: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif
变更前: var(--font-geist-mono)
变更后: "JetBrains Mono", ui-monospace
```

### 4.4 色彩体系
| Token | 旧值 (neutral) | 新值 (amber+zinc) |
|-------|---------------|-------------------|
| Primary | 中性黑 | 琥珀金 |
| Secondary | 中性灰 | 暖灰 (带琥珀色相) |
| Accent | 中性灰 | 暖灰 |
| Ring | 中性灰 | 琥珀金 |
| Chart 1-5 | 中性梯度 | 琥珀梯度 |
| Sidebar | 中性 | 琥珀色系 |

### 4.5 新增工具类
- `.scrollbar-none` — 隐藏滚动条（catalog 核心工具类）
- `.animate-spin-slow` — 10s 慢速旋转动画
- `html { scroll-behavior: smooth }` — 平滑锚点滚动

---

## 5. 回归测试

| 测试项 | 结果 |
|--------|------|
| `pnpm tsc --noEmit` | ✅ 零错误 |
| `pnpm build` | ✅ 构建成功 |
| 路由 `/c/[id]` | ✅ 页面正常服务 (200) |
| 产品数据渲染 | ✅ 数据注入正常 |
| 图片加载 | ✅ R2 图片来源不变 |
| ISR 缓存 | ✅ `revalidate: 300` 不变 |
| 数据获取逻辑 | ✅ `getCatalog()` 未修改 |
| 路由结构 | ✅ `/c/[id]` 不变 |
| Cloudflare 配置 | ✅ 未修改 |

---

## 6. 风险点

| 风险 | 状态 |
|------|------|
| 颜色变更导致可读性问题 | 🟢 低 — amber 在白色背景上有足够对比度 |
| Inter 字体可能未安装 | 🟢 低 — system-ui 回退链完整 |
| shadcn 组件视觉异常 | 🟢 低 — 全部使用 CSS 变量，自动适配 |
| 业务组件视觉变化 | 🟡 中 — 现有组件使用硬编码 Tailwind 类 (如 `bg-black`)，不受 CSS 变量影响，将后续批次更新 |

---

## 7. 下一步

**第二批**: 迁移业务组件（HeroSection, ProductCard 等），将硬编码颜色类替换为设计令牌。
