# Extracting Fields from JSON String in Glide

Since Glide's Experimental Code Column returns a JSON string (not an object), here are the best approaches to extract individual fields:

## Option 1: Multiple Experimental Code Columns (Not Recommended)
**Pros:** Each field gets its own column  
**Cons:** Makes multiple API calls (inefficient, expensive, slow)

Create separate Experimental Code Columns for each field (vendor, total, date, etc.), but this would call your Cloudflare API multiple times per receipt.

## Option 2: Text Extraction Functions (Recommended)
**Pros:** Fast, no additional API calls, works with existing JSON string  
**Cons:** Requires regex/text manipulation

Use Glide's computed column formulas with text extraction functions:

### For Simple Fields (vendor, status, error):
```
REGEX({Receipt_Data}, "\"vendor\":\"([^\"]+)\"")
REGEX({Receipt_Data}, "\"status\":\"([^\"]+)\"")
REGEX({Receipt_Data}, "\"error\":\"([^\"]+)\"")
```

### For Numeric Fields (total, subtotal, tax):
```
REGEX({Receipt_Data}, "\"total\":([0-9.]+)")
REGEX({Receipt_Data}, "\"subtotal\":([0-9.]+)")
REGEX({Receipt_Data}, "\"tax\":([0-9.]+)")
```

### For Date Fields:
```
REGEX({Receipt_Data}, "\"date\":\"([^\"]+)\"")
```

## Option 3: Helper Experimental Code Columns (Best for Complex Parsing)
**Pros:** Clean, reusable, handles edge cases  
**Cons:** Requires additional code columns

Create small helper Experimental Code Columns that parse the JSON string:

### Vendor Column:
```javascript
window.function = function (receiptData) {
  const data = receiptData?.value;
  if (!data) return undefined;
  try {
    const parsed = JSON.parse(data);
    return parsed.vendor || null;
  } catch (e) {
    return null;
  }
}
```

### Total Column:
```javascript
window.function = function (receiptData) {
  const data = receiptData?.value;
  if (!data) return undefined;
  try {
    const parsed = JSON.parse(data);
    return parsed.total || null;
  } catch (e) {
    return null;
  }
}
```

## Option 4: Single Column with Rich Display (Simplest)
**Pros:** No additional columns needed  
**Cons:** Can't easily filter/sort by individual fields

Keep the JSON string in one column and use Glide's display features:
- Show formatted text using Markdown/Rich Text display
- Create a custom component that parses and displays the JSON nicely

## Recommended Approach: Option 2 + Option 3 Hybrid

1. **Keep the JSON string** in your main Receipt Data column
2. **Extract key fields** using REGEX formulas for simple fields (status, vendor, total)
3. **Use helper Experimental Code Columns** for complex fields (line_items array, nested objects)

## Example Glide Setup:

### Columns to Create:

1. **Receipt Data** (Text) - Your Experimental Code Column (returns JSON string)
2. **Status** (Text) - Computed: `REGEX({Receipt_Data}, "\"status\":\"([^\"]+)\"")`
3. **Vendor** (Text) - Computed: `REGEX({Receipt_Data}, "\"vendor\":\"([^\"]+)\"")`
4. **Total** (Number) - Computed: `REGEX({Receipt_Data}, "\"total\":([0-9.]+)")`
5. **Date** (Date) - Computed: Parse the date string from JSON
6. **Error** (Text) - Computed: `REGEX({Receipt_Data}, "\"error\":\"([^\"]+)\"")`

## Notes:

- Glide's REGEX function syntax: `REGEX(column, pattern)` where pattern uses capture groups `()`
- For arrays (like line_items), you'll need a helper Experimental Code Column to parse and format
- Null values in JSON will need special handling in your regex patterns
- Test your regex patterns with sample JSON strings first

