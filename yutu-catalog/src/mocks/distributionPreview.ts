import { CatalogViewModel } from '@/adapters/catalogAdapter'

/**
 * Distribution Mock Preview — 模拟分销专享版完整数据
 * 仅开发预览用，不接入后端 API
 */
export const distributionPreview: CatalogViewModel = {
  meta: {
    id: 'dist-preview-001',
    name: '2026春季新品图册 (分销商专享版)',
    brand: '雨图饰品',
    createdAt: '2026-05-30T00:00:00Z',
  },
  hero: {
    coverImageUrl: null,
    brand: '雨图饰品',
    name: '2026春季新品图册',
    createdAt: '2026-05-30T00:00:00Z',
    productCount: 3,
    customerName: '杭州优选贸易有限公司',
  },
  categories: [
    { name: '全部', productCount: 3 },
    { name: '包包挂件', productCount: 2 },
    { name: '简约项链', productCount: 1 },
  ],
  products: [
    {
      spuCode: 'SP2605024',
      title: '彩色尼龙登山扣钥匙扣 包包挂件',
      category: '包包挂件',
      mainImageUrl: 'https://images.unsplash.com/photo-1590540179852-2110a54f813a?auto=format&fit=crop&q=80&w=600',
      images: [
        { url: 'https://images.unsplash.com/photo-1590540179852-2110a54f813a?auto=format&fit=crop&q=80&w=600', alt: '彩色尼龙登山扣钥匙扣' },
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', alt: '彩色尼龙登山扣钥匙扣 2' },
        { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600', alt: '彩色尼龙登山扣钥匙扣 3' },
      ],
      skus: [
        { skuCode: 'BG-CR-0001', nameZh: '活力暖橙绑绳款', nameEn: 'Vaporous Orange Lanyard', imageUrl: 'https://images.unsplash.com/photo-1590540179852-2110a54f813a?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 12.80, suggestedPrice: 39.00, profitMargin: 204.69, profitAmount: 26.20, currency: '¥' } },
        { skuCode: 'BG-CR-0002', nameZh: '经典曜黑钢索款', nameEn: 'Classic Charcoal Steel', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 14.50, suggestedPrice: 45.00, profitMargin: 210.34, profitAmount: 30.50, currency: '¥' } },
        { skuCode: 'BG-CR-0003', nameZh: '薄荷森绿编织款', nameEn: 'Mint Forest Braid', imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 13.00, suggestedPrice: 42.00, profitMargin: 223.08, profitAmount: 29.00, currency: '¥' } },
      ],
    },
    {
      spuCode: 'SP2605025',
      title: '极简黄铜几何流苏吊坠 项链',
      category: '简约项链',
      mainImageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      images: [
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600', alt: '极简黄铜几何流苏吊坠' },
        { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600', alt: '极简黄铜几何流苏吊坠 2' },
      ],
      skus: [
        { skuCode: 'NL-BR-0101', nameZh: '圆形几何镂空吊坠', nameEn: 'Geometric Circle Pendant', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 28.00, suggestedPrice: 89.00, profitMargin: 217.86, profitAmount: 61.00, currency: '¥' } },
        { skuCode: 'NL-BR-0102', nameZh: '三角光影流苏细链', nameEn: 'Triangle Fringe Chain', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 26.50, suggestedPrice: 79.00, profitMargin: 198.11, profitAmount: 52.50, currency: '¥' } },
      ],
    },
    {
      spuCode: 'SP2605026',
      title: '手工琉璃串珠彩色手链 少女风配饰',
      category: '包包挂件',
      mainImageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=600',
      images: [
        { url: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=600', alt: '手工琉璃串珠彩色手链' },
      ],
      skus: [
        { skuCode: 'BR-SR-0201', nameZh: '暖橙向日葵混色', nameEn: 'Sunny Sunflower Mix', imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 9.50, suggestedPrice: 29.00, profitMargin: 205.26, profitAmount: 19.50, currency: '¥' } },
        { skuCode: 'BR-SR-0202', nameZh: '海洋蓝调渐变串', nameEn: 'Ocean Blue Gradient', imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 10.50, suggestedPrice: 32.00, profitMargin: 204.76, profitAmount: 21.50, currency: '¥' } },
        { skuCode: 'BR-SR-0203', nameZh: '樱花粉嫩少女串', nameEn: 'Sakura Pink Blossom', imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?auto=format&fit=crop&q=80&w=600', pricing: { supplyPrice: 8.80, suggestedPrice: 25.00, profitMargin: 184.09, profitAmount: 16.20, currency: '¥' } },
      ],
    },
  ],
  features: {
    showPrice: true,
    showCustomerName: true,
    showAgreement: true,
    showQualityAssurance: true,
  },
  distributor: {
    distributorName: '杭州优选贸易有限公司',
    cooperationLevel: 'VIP战略合作伙伴',
    currency: '¥',
    validUntil: '2027-12-31',
    contactManager: 'Luna (企业微信)',
  },
  agreement: {
    text: `# 分销合作协议

## 1. 价格管控承诺
- 分销商必须严格执行各款式对应的**建议市场零售价（MSRP）**，不得低于指导价销售
- 违约将暂停对接接口并按规定处罚

## 2. 物流与服务协议
- **一件代发**：支持全品类跨境一件代发，物流单号 24-48 小时出库
- 运费按雨图实时国际物流费率自动计算

## 3. 品质与售后保障
- 产品通过拉力与色牢测试，支持 30 天无理由换货
- 定制和改款最小起订量（MOQ）可在 PIM 系统查询`,
  },
}
