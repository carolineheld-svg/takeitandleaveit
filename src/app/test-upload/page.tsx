'use client'

import { useState } from 'react'
import { uploadMultipleImages } from '@/lib/supabase-storage'
import { useAuth } from '@/components/auth/AuthProvider'

export default function ImageUploadTest() {
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    console.log('Selected files:', selectedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified
    })))
    
    // Process HEIC files
    const processedFiles: File[] = []
    
    for (const file of selectedFiles) {
      try {
        if (file.type.toLowerCase() === 'image/heic' || file.type.toLowerCase() === 'image/heif') {
          console.log(`Converting HEIC file: ${file.name}`)
          
          // Dynamically import heic2any to avoid SSR issues
          const heic2any = (await import('heic2any')).default
          
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          }) as Blob
          
          const convertedFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg',
            lastModified: file.lastModified
          })
          
          console.log(`HEIC converted to JPEG: ${convertedFile.name}`)
          processedFiles.push(convertedFile)
        } else {
          processedFiles.push(file)
        }
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error)
        processedFiles.push(file)
      }
    }
    
    setFiles(processedFiles)
    setError('')
  }

  const handleUpload = async () => {
    if (!user || files.length === 0) return

    setUploading(true)
    setError('')
    
    try {
      const tempId = `test-${Date.now()}`
      console.log('Uploading files:', files.length, 'for user:', user.id)
      
      const urls = await uploadMultipleImages(files, user.id, tempId)
      console.log('Upload successful, URLs:', urls)
      
      setResults(urls)
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Image Upload Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {files.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li key={index} className="text-sm">
                  {file.name} ({file.size} bytes, {file.type})
                </li>
              ))}
            </ul>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Preview:</h3>
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, index) => (
                <div key={index} className="border rounded p-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover"
                    onLoad={() => console.log(`Preview ${index} loaded`)}
                    onError={(e) => console.error(`Preview ${index} error:`, e)}
                  />
                  <p className="text-xs mt-1">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!user || files.length === 0 || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            Error: {error}
          </div>
        )}

        {results.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Upload Results:</h3>
            <ul className="space-y-1">
              {results.map((url, index) => (
                <li key={index} className="text-sm">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
