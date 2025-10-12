import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance to ensure session persistence
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: 'sb-auth-token',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined
        }
      }
    )
  }
  return supabaseInstance
}

// Reset the singleton instance (useful for sign out)
export function resetClient() {
  supabaseInstance = null
}
