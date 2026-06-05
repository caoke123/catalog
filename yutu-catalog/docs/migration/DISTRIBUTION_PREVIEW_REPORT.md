# DISTRIBUTION_PREVIEW_REPORT — Phase 5 Step 2A

> 日期：2026-06-03
> 阶段：Distribution Mock Preview（仅预览，不接入后端）

---

## 1. 修改文件

| 文件 | 变更 |
|------|------|
| `src/adapters/catalogAdapter.ts` | +HeroInfo.customerName, +CatalogViewModel.distributor/agreement, +DistributorInfo, +AgreementInfo |
| `src/components/catalog/HeroSection.tsx` | +showCustomerName prop → 毛玻璃客户胶囊 |
| `src/components/catalog/ProductCard.tsx` | showPrice=true → 供货价/零售价双栏显示 |
| `src/components/catalog/ProductSheet.tsx` | showPrice=true → 3列定价计算器（供货价/零售价/利润率+利润额） |
| `src/components/catalog/CatalogView.tsx` | +DistributorBanner + AgreementModal + Agreement FAB |

## 2. 新增文件

| 文件 | 说明 |
|------|------|
| `src/mocks/distributionPreview.ts` | 完整模拟数据（3产品 x 2-3SKU，含定价/分销商/协议） |
| `src/components/catalog/DistributorBanner.tsx` | 分销商信息横幅（等级/有效期/客户经理） |
| `src/components/catalog/AgreementModal.tsx` | 合作协议弹窗（Markdown 简易渲染） |
| `src/app/dev/distribution-preview/page.tsx` | 开发预览页 |

## 3. Preview 访问地址

```
http://localhost:3010/dev/distribution-preview
```

## 4. 功能效果说明

### Hero
- 品牌 COLLECTIVE pill 下方显示 **毛玻璃客户胶囊**："专属合作客户 杭州优选贸易有限公司"
- Building2 琥珀色图标 + 淡入动画

### DistributorBanner
- Hero 下方深色横幅：分销商名称 + **VIP战略合作伙伴** 标签
- 有效期 | 客户经理 | 币种 信息栏

### ProductCard
- **供货价 ¥12.80 起**（左侧琥珀色） + **零售指导价 ¥39**（右侧灰色）
- 底部显示最低供货价

### ProductSheet
- 点击产品后 3 列定价计算器：
- 供货结算价 ¥12.80 | 零售指导价 ¥39.0 | **+205%**（利润 $26.20）
- SKU 切换价格联动更新

### AgreementModal
- 右下角悬浮圆形按钮 "合作协议"
- 点击弹出 modal，显示协议全文（Markdown 标题/列表渲染）

## 5. 回归测试

| 测试项 | 结果 |
|--------|------|
| `pnpm tsc --noEmit` | ✅ 零错误 |
| `pnpm build` | ✅ 成功 (2.2s)，5个路由 |
| `/dev/distribution-preview` | ✅ HTTP 200 |
| Banner 渲染 | ✅ VIP战略合作伙伴 |
| ProductCard 定价 | ✅ 代发供货价 |
| CustomerName | ✅ 杭州优选 |
| Catalog 分享 (`/c/[id]`) | 未受影响（features全false时不显示定价/分销） |

## 6. 禁止开发（已遵守）

- ❌ `src/app/d/*` — 未创建
- ❌ `distributionAdapter.ts` — 未创建
- ❌ 真实 API 请求 — 未接入
- ❌ 后端联调 — 未进行
