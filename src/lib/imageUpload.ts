import { supabase } from './supabaseClient';

export interface UploadedImage {
  url: string;
  path: string;
}

export async function uploadImageToStorage(
  file: File,
  folder: string = 'apartments'
): Promise<UploadedImage> {
  try {
    // Generate a unique filename
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload the file to Supabase Storage using apartment-images bucket
    const { data, error } = await supabase.storage
      .from('apartment-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('apartment-images')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function uploadMultipleImages(
  files: File[],
  folder: string = 'apartments'
): Promise<UploadedImage[]> {
  const uploadPromises = files.map(file => uploadImageToStorage(file, folder));
  return Promise.all(uploadPromises);
}

export async function deleteImageFromStorage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('apartment-images')
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}