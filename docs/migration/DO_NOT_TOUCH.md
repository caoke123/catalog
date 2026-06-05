# DO NOT TOUCH — UI Migration 安全边界

> 迁移期间保护清单
> 违反此清单将导致功能退化

---

## 禁止修改文件

### 数据获取层

```
src/lib/catalog.ts           ← getCatalog() 函数
                                  ├── NEXT_PUBLIC_R2_BASE_URL 环境变量
                                  ├── fetch URL 构造逻辑
                                  ├── next.revalidate = 300 (ISR)
                                  └── 错误处理 (return null → notFound)
```

- 禁止修改 fetch URL 格式
- 禁止修改 ISR revalidate 时间
- 禁止修改错误处理逻辑
- 禁止添加 mock data fallback (保持纯 R2 数据源)

### 路由层

```
src/app/c/[id]/page.tsx      ← 路由页面
src/app/c/[id]/loading.tsx   ← 加载骨架
src/app/c/[id]/error.tsx     ← 错误页
src/app/c/[id]/not-found.tsx ← 404 页
src/app/layout.tsx           ← 根布局
```

- 禁止修改 `/c/[id]` 路由结构
- 禁止添加新路由段
- 禁止删除现有路由文件
- 允许: 修改 `generateMetadata()` 以适配新字段
- 允许: page.tsx 传参给 CatalogView 的方式不变 (`<CatalogView catalog={catalog} />`)

### 类型定义 (只扩展,不破坏)

```
src/types/catalog.ts
```

- 禁止删除现有字段
- 禁止重命名现有字段
- 禁止改变字段类型
- **允许**: 增加可选字段 (如 `supplyPrice?: number`, `distributorInfo?`)
- **允许**: 增加新接口 (如 `DistributorInfo`)

### 配置层

```
next.config.ts               ← 部署配置
wrangler.toml                ← Cloudflare Pages 配置
.env.local                   ← 环境变量 (NEXT_PUBLIC_* 前缀)
package.json                 ← scripts (build/lint/dev/deploy)
components.json              ← shadcn 配置
tsconfig.json                ← TypeScript 配置
postcss.config.mjs           ← PostCSS 配置
```

- 禁止修改任何配置文件
- 禁止修改 `build` / `pages:build` / `deploy` 脚本
- 禁止修改端口配置

### 部署层

```
@opennextjs/cloudflare       ← Cloudflare 部署适配器
wrangler                     ← Cloudflare CLI
```

- 禁止修改 Cloudflare Pages 构建流程
- 禁止修改 Wrangler 配置

---

## 允许修改文件 (白名单)

### UI 组件 — 完全替换

```
src/components/catalog/CatalogView.tsx
src/components/catalog/HeroSection.tsx
src/components/catalog/CategoryTabs.tsx
src/components/catalog/ProductGrid.tsx
src/components/catalog/ProductCard.tsx
src/components/catalog/ProductSheet.tsx
src/components/catalog/ProductSwiper.tsx
src/components/catalog/SkuRow.tsx
```

### 样式 — 统一升级

```
src/app/globals.css           ← 主题色/动画/自定义工具类
```

### 新增文件

```
src/adapters/catalogAdapter.ts         ← 数据适配器
src/adapters/distributionAdapter.ts    ← 未来预留
```

### 依赖增删

```
package.json                  ← 增: motion (替换 framer-motion)
                              ← 删: framer-motion (如 motion 完全兼容)
                              ← 增: lucide-react (如未安装)
```

---

## Catalog 分享兼容性检查清单

迁移完成后必须验证:

- [ ] `/c/{真实catalogId}` 正常加载
- [ ] 封面图显示 (包括空 coverImageUrl 回退)
- [ ] 产品列表正确渲染
- [ ] 分类 Tab 过滤正常
- [ ] 产品卡片点击弹出 Bottom Sheet
- [ ] Bottom Sheet 图片轮播正常
- [ ] SKU 切换轮播图正常
- [ ] 下拉关闭 Bottom Sheet 正常
- [ ] 无限滚动加载正常
- [ ] not-found 页面正常工作
- [ ] error 页面正常工作
- [ ] ISR 缓存正常 (revalidate: 300)
- [ ] `generateMetadata` 输出正确的 title/description
- [ ] `pnpm build` 无报错
- [ ] `pnpm tsc --noEmit` 零错误

---

## 紧急回滚方案

如迁移出现问题:

```bash
git checkout master -- src/components/catalog/
git checkout master -- src/app/globals.css
git checkout master -- package.json
pnpm install
pnpm dev
```
