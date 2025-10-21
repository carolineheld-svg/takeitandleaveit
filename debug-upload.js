// Debug script to test image upload
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorageAccess() {
  try {
    // Test if we can list files in the bucket
    const { data, error } = await supabase.storage
      .from('item-images')
      .list('', { limit: 5 })
    
    if (error) {
      console.error('Storage access error:', error)
    } else {
      console.log('Storage access successful:', data)
    }
  } catch (err) {
    console.error('Test failed:', err)
  }
}

testStorageAccess()
