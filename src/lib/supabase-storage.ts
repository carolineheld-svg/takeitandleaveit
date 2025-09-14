import { createClient } from '@/lib/supabase-client'

// Create a singleton client instance for consistent session handling
const supabase = createClient()

export async function uploadImage(file: File, userId: string, itemId: string): Promise<string> {
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${itemId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `items/${userId}/${fileName}`

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('item-images')
    .upload(filePath, file)

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  // Get public URL
  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function uploadMultipleImages(files: File[], userId: string, itemId: string): Promise<string[]> {
  const imageUrls: string[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${itemId}/${Date.now()}-${i}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('item-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading image:', error)
      throw new Error(`Failed to upload image ${file.name}: ${error.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName)

    if (publicUrlData) {
      imageUrls.push(publicUrlData.publicUrl)
    }
  }
  
  return imageUrls
}

export async function deleteImage(filePath: string): Promise<void> {
  // Extract the path from the full URL
  const pathMatch = filePath.match(/item-images\/(.+)$/)
  if (!pathMatch) {
    throw new Error('Invalid file path')
  }
  
  const { error } = await supabase.storage
    .from('item-images')
    .remove([pathMatch[1]])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

export async function uploadProfilePicture(file: File, userId: string): Promise<string> {
  // Generate unique filename for profile picture
  const fileExt = file.name.split('.').pop()
  const fileName = `profile_${userId}_${Date.now()}.${fileExt}`
  const filePath = `profiles/${fileName}`

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('item-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting existing profile pictures
    })

  if (uploadError) {
    throw new Error(`Failed to upload profile picture: ${uploadError.message}`)
  }

  // Get public URL
  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteProfilePicture(avatarUrl: string): Promise<void> {
  // Extract the path from the full URL
  const pathMatch = avatarUrl.match(/item-images\/(.+)$/)
  if (!pathMatch) {
    throw new Error('Invalid avatar URL')
  }
  
  const { error } = await supabase.storage
    .from('item-images')
    .remove([pathMatch[1]])

  if (error) {
    throw new Error(`Failed to delete profile picture: ${error.message}`)
  }
}
