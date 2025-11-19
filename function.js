// Receipt Parser Function for Glide
// This function accepts an image URL and calls the Cloudflare receipt parser endpoint
// It returns structured data including receipt data, status, and error information
// Includes caching based on image URL to prevent repeated API calls

// Cache storage key prefix
const CACHE_PREFIX = 'receipt_parser_cache_';

// Helper function to get cache key from image URL
function getCacheKey(imageUrl) {
  // Use a hash of the URL as the cache key (or just use URL if it's reasonable length)
  // For simplicity, we'll use the URL directly (localStorage keys can be long)
  return CACHE_PREFIX + btoa(imageUrl).replace(/[/+=]/g, '_').substring(0, 50);
}

// Helper function to get cached result
function getCachedResult(imageUrl) {
  try {
    const cacheKey = getCacheKey(imageUrl);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (optional: add expiration)
      console.log('[Receipt Parser] Cache hit for:', imageUrl.substring(0, 50));
      return parsed;
    }
  } catch (e) {
    console.error('[Receipt Parser] Cache read error:', e);
  }
  return null;
}

// Helper function to cache result
function cacheResult(imageUrl, result) {
  try {
    const cacheKey = getCacheKey(imageUrl);
    localStorage.setItem(cacheKey, JSON.stringify({
      result: result,
      timestamp: Date.now(),
      url: imageUrl
    }));
    console.log('[Receipt Parser] Cached result for:', imageUrl.substring(0, 50));
  } catch (e) {
    console.error('[Receipt Parser] Cache write error:', e);
    // If storage is full, try to clear old entries
    try {
      clearOldCacheEntries();
      localStorage.setItem(cacheKey, JSON.stringify({
        result: result,
        timestamp: Date.now(),
        url: imageUrl
      }));
    } catch (e2) {
      console.error('[Receipt Parser] Cache write failed after cleanup:', e2);
    }
  }
}

// Helper function to clear old cache entries (keeps last 100)
function clearOldCacheEntries() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    if (keys.length > 100) {
      // Sort by timestamp and remove oldest
      const entries = keys.map(k => ({
        key: k,
        timestamp: JSON.parse(localStorage.getItem(k)).timestamp || 0
      })).sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest entries
      const toRemove = entries.slice(0, entries.length - 100);
      toRemove.forEach(entry => localStorage.removeItem(entry.key));
      console.log('[Receipt Parser] Cleared', toRemove.length, 'old cache entries');
    }
  } catch (e) {
    console.error('[Receipt Parser] Cache cleanup error:', e);
  }
}

window.function = async function (imageUrl, skipProcessing) {
  // Extract values from parameters
  imageUrl = imageUrl?.value ?? "";
  skipProcessing = skipProcessing?.value ?? false;
  
  console.log('[Receipt Parser] Function called with imageUrl:', imageUrl ? 'present' : 'missing');
  console.log('[Receipt Parser] Skip processing:', skipProcessing);
  
  // If skipProcessing is true, exit immediately (no API call)
  if (skipProcessing === true) {
    console.log('[Receipt Parser] Skip processing is true, returning undefined - no API call');
    return undefined;
  }
  
  // Return undefined if no imageUrl is provided
  if (!imageUrl) {
    console.log('[Receipt Parser] No imageUrl provided, returning undefined - no API call');
    return undefined;
  }

  // Check cache first - if we've processed this image URL before, return cached result
  const cached = getCachedResult(imageUrl);
  if (cached && cached.result) {
    console.log('[Receipt Parser] Returning cached result - no API call');
    return cached.result; // Return cached JSON string
  }

  // Return a "waiting" status if imageUrl is empty (shouldn't happen with conditional column)
  const result = {
    status: "processing",
    is_receipt: null,
    vendor: null,
    date: null,
    currency: null,
    subtotal: null,
    tax: null,
    total: null,
    line_items: [],
    error: null,
    raw: null
  };

  try {
    console.log('[Receipt Parser] Calling Cloudflare endpoint...');
    // Call the Cloudflare receipt parser endpoint
    const response = await fetch('https://receipt-parser.zachtyz.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    });
    
    console.log('[Receipt Parser] Response status:', response.status, response.statusText);

    // Handle HTTP errors
    if (!response.ok) {
      result.status = "error";
      result.error = `API Error: ${response.status} ${response.statusText}`;
      const resultString = JSON.stringify(result);
      // Don't cache errors - allow retry on next call
      return resultString;
    }

    // Parse the response
    const data = await response.json();
    
    // Check if it's actually a receipt
    if (data.is_receipt === false) {
      result.status = "not_receipt";
      result.error = "Image does not appear to be a receipt";
      result.raw = data;
      const resultString = JSON.stringify(result);
      // Cache even error results to avoid reprocessing
      cacheResult(imageUrl, resultString);
      return resultString;
    }

    // Success - populate receipt data
    result.status = "success";
    result.is_receipt = data.is_receipt ?? true;
    result.vendor = data.vendor ?? null;
    result.date = data.date ?? null;
    result.currency = data.currency ?? null;
    result.subtotal = data.subtotal ?? null;
    result.tax = data.tax ?? null;
    result.total = data.total ?? null;
    result.line_items = data.line_items ?? [];
    result.raw = data.raw ?? data;
    
    // Convert to JSON string
    const resultString = JSON.stringify(result);
    
    // Cache the result for future use
    cacheResult(imageUrl, resultString);
    
    // Return as JSON string (Glide requires string type)
    return resultString;
  } catch (error) {
    // Network or parsing errors
    console.error('[Receipt Parser] Fetch error:', error);
    result.status = "error";
    result.error = `Error: ${error.message}`;
    return JSON.stringify(result);
  }
}

