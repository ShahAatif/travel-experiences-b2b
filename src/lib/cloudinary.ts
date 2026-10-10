/**
 * Cloudinary image upload and management module.
 */

/**
 * Generate a Cloudinary upload signature for client-side uploads
 */
export function generateUploadSignature(folder: string = 'experiences'): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const timestamp = Math.floor(Date.now() / 1000);
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = `${timestamp}:${apiKey}:${paramsToSign}`;

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  };
}

/**
 * Build a Cloudinary URL for an image
 */
export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string } = {}
): string {
  const { width, height, crop, quality } = options;
  let transformations = '';

  if (width) transformations += `w_${width},`;
  if (height) transformations += `h_${height},`;
  if (crop) transformations += `c_${crop},`;
  if (quality) transformations += `q_${quality},`;

  // Remove trailing comma
  if (transformations.endsWith(',')) {
    transformations = transformations.slice(0, -1);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`;
  }

  return `${baseUrl}/${publicId}`;
}
