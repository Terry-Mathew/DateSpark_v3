import { storage } from "../firebase";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  list,
  listAll,
  getMetadata,
  uploadBytesResumable
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

/**
 * Uploads a file to Firebase Storage
 * @param file - File to upload
 * @param path - Path in storage (e.g., "users/userId/photos")
 * @param customFilename - Optional custom filename
 * @returns Promise with download URL
 */
export const uploadFile = async (
  file: File,
  path: string,
  customFilename?: string
): Promise<string> => {
  try {
    // Generate a unique filename if not provided
    const filename = customFilename || `${uuidv4()}_${file.name.replace(/\s+/g, '_')}`;
    const fullPath = `${path}/${filename}`;
    const storageRef = ref(storage, fullPath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log(`File uploaded successfully to ${fullPath}`);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Uploads multiple files to Firebase Storage
 * @param files - Array of files to upload
 * @param path - Path in storage
 * @returns Promise with array of download URLs
 */
export const uploadMultipleFiles = async (
  files: File[],
  path: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, path));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw error;
  }
};

/**
 * Deletes a file from Firebase Storage using its URL
 * @param fileUrl - URL of the file to delete
 * @returns Promise<boolean> indicating success
 */
export const deleteFileByUrl = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const decodedUrl = decodeURIComponent(fileUrl);
    const startIndex = decodedUrl.indexOf('o/') + 2;
    const endIndex = decodedUrl.indexOf('?');
    const storagePath = decodedUrl.substring(startIndex, endIndex);
    
    // Create a reference to the file
    const fileRef = ref(storage, storagePath);
    
    // Delete the file
    await deleteObject(fileRef);
    console.log(`File deleted successfully: ${storagePath}`);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

/**
 * Gets all files for a user in a specific path
 * @param userId - User ID
 * @param subPath - Optional sub-path (e.g., "photos")
 * @returns Promise with array of download URLs
 */
export const getUserFiles = async (
  userId: string,
  subPath?: string
): Promise<string[]> => {
  try {
    const path = subPath ? `users/${userId}/${subPath}` : `users/${userId}`;
    const dirRef = ref(storage, path);
    
    // List all items in the directory
    const listResult = await listAll(dirRef);
    
    // Get download URLs for all items
    const urlPromises = listResult.items.map(itemRef => getDownloadURL(itemRef));
    return await Promise.all(urlPromises);
  } catch (error) {
    console.error("Error getting user files:", error);
    throw error;
  }
};

/**
 * Checks if a file exists by its URL
 * @param fileUrl - URL of the file to check
 * @returns Promise<boolean> indicating if file exists
 */
export const fileExists = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const decodedUrl = decodeURIComponent(fileUrl);
    const startIndex = decodedUrl.indexOf('o/') + 2;
    const endIndex = decodedUrl.indexOf('?');
    const storagePath = decodedUrl.substring(startIndex, endIndex);
    
    // Create a reference to the file
    const fileRef = ref(storage, storagePath);
    
    // Try to get the download URL
    await getDownloadURL(fileRef);
    return true;
  } catch (error) {
    // If error is because file doesn't exist, return false
    if (error.code === 'storage/object-not-found') {
      return false;
    }
    // Otherwise rethrow
    console.error("Error checking if file exists:", error);
    throw error;
  }
};

/**
 * Uploads an image to Firebase Storage and returns the download URL
 * @param file The file to upload
 * @param path The path to upload the file to (e.g. 'profiles/user123/avatar.jpg')
 * @param onProgress Optional callback to track upload progress
 * @returns Promise that resolves with the download URL
 */
export const uploadImage = async (
  file: File, 
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit");
    }
    
    // Start upload task
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate progress
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle errors
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error: any) {
    toast.error(error.message || "Error uploading image");
    throw error;
  }
};

/**
 * Compresses an image before uploading to reduce file size 
 * @param file The file to compress
 * @param maxWidth Maximum width in pixels
 * @param quality JPEG quality (0-1)
 * @returns Promise that resolves with a compressed File object
 */
export const compressImage = async (
  file: File, 
  maxWidth = 1200, 
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down if image is larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
};

/**
 * Deletes an image from Firebase Storage
 * @param url The download URL of the image to delete
 * @returns Promise that resolves when the deletion is complete
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extract the path from the download URL
    const decodedUrl = decodeURIComponent(url);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    const path = decodedUrl.substring(startIndex, endIndex);
    
    // Create reference and delete
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error: any) {
    toast.error(error.message || "Error deleting image");
    throw error;
  }
}; 