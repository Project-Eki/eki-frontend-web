// Production server URL - change this to your actual domain when you have one
const PRODUCTION_API_URL = 'https://joineki.com';
const DEVELOPMENT_API_URL = 'http://127.0.0.1:8000';

// Detect if we're in production or development
const isProduction = () => {
  // Check if running on localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return false;
    }
  }
  // Check for production URL in the current page
  return true;
};

// Get the base URL for images
const getImageBaseUrl = () => {
  if (isProduction()) {
    return PRODUCTION_API_URL;
  }
  return DEVELOPMENT_API_URL;
};

/**
 * Convert a relative image path to a full URL
 * @param {string} url - The image path from backend (e.g., "/media/listings/images/photo.jpg")
 * @returns {string|null} - Full URL or null if no url provided
 */
export const resolveImageUrl = (url) => {
  if (!url) return null;
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Ensure the path starts with a slash
  const imagePath = url.startsWith('/') ? url : `/${url}`;
  
  // Combine base URL with image path
  return `${getImageBaseUrl()}${imagePath}`;
};

/**
 * Get the primary image from a listing
 * @param {Array} images - Array of image objects
 * @returns {string|null} - Full URL of the primary image or null
 */
export const getPrimaryImage = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  const primary = images.find(img => img.is_primary === true);
  const imageUrl = primary?.image || images[0]?.image;
  
  return resolveImageUrl(imageUrl);
};