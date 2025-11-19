// Receipt Parser Function for Glide
// This function accepts an image URL and calls the Cloudflare receipt parser endpoint
// It returns the parsed receipt data including vendor, date, total, line items, etc.

window.function = async function (imageUrl) {
  // Extract the value from the parameter object and provide default
  imageUrl = imageUrl.value ?? "";
  
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

    // Parse and return the receipt data as JSON string
    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error("Error calling receipt parser:", error.message);
    return undefined;
  }
}

