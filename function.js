// Receipt Parser Function for Glide
// This function accepts an image URL and calls the Cloudflare receipt parser endpoint
// It returns the parsed receipt data including vendor, date, total, line items, etc.
// Uses self-referencing to only process once per row

window.function = async function (imageUrl, existingResult) {
  // Extract values from parameters
  imageUrl = imageUrl?.value ?? "";
  existingResult = existingResult?.value;
  
  // If result already exists, return it (prevents reprocessing)
  if (existingResult && existingResult !== "" && existingResult !== "undefined") {
    try {
      // If it's a string, try to parse it as JSON (in case it was stringified)
      if (typeof existingResult === 'string') {
        const parsed = JSON.parse(existingResult);
        return parsed;
      }
      return existingResult;
    } catch (e) {
      // If parsing fails, return as-is
      return existingResult;
    }
  }
  
  // Return undefined if no imageUrl is provided
  if (!imageUrl) return undefined;

  try {
    // Call the Cloudflare receipt parser endpoint
    const response = await fetch('https://receipt-parser.zachtyz.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    });

    // Handle HTTP errors
    if (!response.ok) {
      console.error("Cloudflare receipt parser error:", response.status, response.statusText);
      return undefined;
    }

    // Parse and return the receipt data as object
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling receipt parser:", error.message);
    return undefined;
  }
}

