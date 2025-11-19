// Receipt Parser Function for Glide
// This function accepts an image URL and calls the Cloudflare receipt parser endpoint
// It returns structured data including receipt data, status, and error information

window.function = async function (imageUrl, skipProcessing, existingResult) {
  // Extract values from parameters
  imageUrl = imageUrl?.value ?? "";
  skipProcessing = skipProcessing?.value ?? false;
  existingResult = existingResult?.value ?? "";
  
  console.log('[Receipt Parser] Function called with imageUrl:', imageUrl ? 'present' : 'missing');
  console.log('[Receipt Parser] Skip processing:', skipProcessing);
  console.log('[Receipt Parser] Existing result:', existingResult ? 'present' : 'missing');
  
  // If skipProcessing is true, return existing result to preserve it (no API call)
  if (skipProcessing === true) {
    console.log('[Receipt Parser] Skip processing is true, returning existing result - no API call');
    // Return existing result if available, otherwise undefined
    return existingResult && existingResult.trim() !== "" ? existingResult : undefined;
  }
  
  // If result already exists, return it (prevents reprocessing)
  if (existingResult && existingResult.trim() !== "" && existingResult !== "undefined") {
    console.log('[Receipt Parser] Result already exists, returning existing data - no API call');
    return existingResult;
  }
  
  // Return undefined if no imageUrl is provided
  if (!imageUrl) {
    console.log('[Receipt Parser] No imageUrl provided, returning undefined - no API call');
    return undefined;
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
      return JSON.stringify(result);
    }

    // Parse the response
    const data = await response.json();
    
    // Check if it's actually a receipt
    if (data.is_receipt === false) {
      result.status = "not_receipt";
      result.error = "Image does not appear to be a receipt";
      result.raw = data;
      return JSON.stringify(result);
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
    
    // Return as JSON string (Glide requires string type)
    return JSON.stringify(result);
  } catch (error) {
    // Network or parsing errors
    console.error('[Receipt Parser] Fetch error:', error);
    result.status = "error";
    result.error = `Error: ${error.message}`;
    return JSON.stringify(result);
  }
}

