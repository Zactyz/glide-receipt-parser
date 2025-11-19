# Receipt Parser - Glide Experimental Code Column

A receipt parser integration for Glide's Experimental Code Column that uses Tabscanner OCR to extract data from receipt images.

## Features

- Parse receipt images using advanced OCR (Tabscanner)
- Extract vendor, date, total, subtotal, tax, and line items
- Returns structured JSON data for use in Glide apps
- Hosted on GitHub Pages - free and always available

## How It Works

1. You provide an image URL to the function
2. The function calls your Cloudflare receipt parser endpoint
3. The Cloudflare Worker:
   - Fetches the image from the URL
   - Uploads it to Tabscanner API for OCR processing
   - Polls for results
   - Normalizes and returns the parsed data
4. The receipt data is returned to your Glide table

## Setup in Glide

1. Copy this repository's URL
2. In your Glide app's Data Editor:
   - Add a new column
   - Select "Computed" → "Experimental" → "Code"
   - Paste the GitHub Pages URL: `https://yourusername.github.io/glide-receipt-parser/`
3. Map the `imageUrl` parameter to your image column
4. Configure a conditional column to run only on empty rows (optional but recommended)

## Files

- **`glide.json`** - Metadata about the function (name, parameters, return type)
- **`function.js`** - The main JavaScript function that processes image URLs
- **`driver.js`** - Interface between the function and Glide
- **`index.html`** - Wrapper page that loads the scripts

## Requirements

- A Cloudflare Worker at `https://receipt-parser.zachtyz.workers.dev/` that handles the actual OCR
- The worker needs a Tabscanner API key (stored in Cloudflare environment variables)

## Parameter Details

### Input
- `imageUrl` (string) - A publicly accessible URL of a receipt image

### Output
Object containing:
```json
{
  "is_receipt": boolean,
  "vendor": string,
  "date": string (ISO format),
  "currency": string,
  "subtotal": number,
  "tax": number,
  "total": number,
  "line_items": [
    {
      "description": string,
      "quantity": number,
      "amount": number
    }
  ],
  "raw": object (full Tabscanner response)
}
```

## Security Notes

- This code is public, so don't include any secrets
- Your Cloudflare Worker should keep API keys in environment variables, not in client-side code
- Only pass public image URLs to this function

## Troubleshooting

- **Function not running**: Check that Glide can access this GitHub Pages URL
- **No results**: Verify the image URL is publicly accessible
- **Slow results**: OCR processing takes time (typically 1-3 seconds)
- **Errors**: Check the browser console for error messages

## License

MIT

