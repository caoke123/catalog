import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 客户端单例
 *
 * 用于 ecatalog 项目从 Supabase 数据库读取产品图册、SKU、分销记录等数据。
 * 环境变量通过 Cloudflare Pages 的 NEXT_PUBLIC_ 前缀暴露给客户端，在构建时注入。
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 必须配置')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
