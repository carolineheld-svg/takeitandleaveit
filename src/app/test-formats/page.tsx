'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function SimpleFormatTest() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('Testing Supabase connection...')
      const supabase = createClient()
      
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('items')
        .select('count')
        .limit(1)
      
      console.log('Test query result:', { testData, testError })
      
      if (testError) {
        setResult(`❌ Connection failed: ${testError.message}`)
        return
      }
      
      setResult('✅ Supabase connection successful!')
      
      // Now try the actual query
      console.log('Testing items query...')
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, name, images')
        .limit(5)
      
      console.log('Items query result:', { itemsData, itemsError })
      
      if (itemsError) {
        setResult(`❌ Items query failed: ${itemsError.message}`)
        return
      }
      
      const itemsWithImages = itemsData?.filter(item => 
        item.images && 
        Array.isArray(item.images) && 
        item.images.length > 0
      ) || []
      
      setResult(`✅ Found ${itemsData?.length || 0} total items, ${itemsWithImages.length} with images`)
      
      // Show sample data
      if (itemsWithImages.length > 0) {
        const sample = itemsWithImages[0]
        setResult(prev => prev + `\n\nSample item: "${sample.name}" with ${sample.images.length} images`)
        sample.images.forEach((img: string, i: number) => {
          setResult(prev => prev + `\n  Image ${i + 1}: ${img.substring(0, 50)}...`)
        })
      }
      
    } catch (err) {
      console.error('Test failed:', err)
      setResult(`❌ Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Format Test</h1>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>

      {result && (
        <div className="p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ol className="text-blue-700 text-sm space-y-1">
          <li>1. Click "Test Database Connection"</li>
          <li>2. Check the browser console for detailed logs</li>
          <li>3. See if any errors appear in the results</li>
          <li>4. If this works, the issue is with the main check-formats page</li>
        </ol>
      </div>
    </div>
  )
}
