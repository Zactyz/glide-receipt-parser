# Glide REGEX Patterns for Receipt JSON Extraction

Based on your actual JSON structure, here are the exact REGEX patterns to use in Glide computed columns:

## JSON Structure:
```json
{
  "status":"success",
  "is_receipt":true,
  "vendor":"SHOP S",
  "date":"2023-02-05T11:58:20",
  "currency":null,
  "subtotal":0,
  "tax":0,
  "total":60,
  "line_items":[...],
  "error":null
}
```

## Glide Computed Column Formulas:

### Status Column (Text):
```
REGEX({Receipt_Data}, "\"status\":\"([^\"]+)\"")
```
Returns: `success`, `error`, `not_receipt`, or `processing`

### Vendor Column (Text):
```
REGEX({Receipt_Data}, "\"vendor\":\"([^\"]+)\"")
```
Returns: `SHOP S` or empty if null

### Total Column (Number):
```
REGEX({Receipt_Data}, "\"total\":([0-9.]+)")
```
Returns: `60` (as number)

### Subtotal Column (Number):
```
REGEX({Receipt_Data}, "\"subtotal\":([0-9.]+)")
```
Returns: `0` (as number)

### Tax Column (Number):
```
REGEX({Receipt_Data}, "\"tax\":([0-9.]+)")
```
Returns: `0` (as number)

### Date Column (Date/Text):
```
REGEX({Receipt_Data}, "\"date\":\"([^\"]+)\"")
```
Returns: `2023-02-05T11:58:20` (you may need to format this in Glide)

### Currency Column (Text):
```
REGEX({Receipt_Data}, "\"currency\":([^,}]+)")
```
Returns: `null` or currency code (note: handles null values)

### Error Column (Text):
```
REGEX({Receipt_Data}, "\"error\":([^,}]+)")
```
Returns: `null` or error message

### Is Receipt Column (Boolean/Text):
```
REGEX({Receipt_Data}, "\"is_receipt\":(true|false)")
```
Returns: `true` or `false`

## Handling Null Values:

For fields that might be null (like currency), you can use:

```
IF(REGEX({Receipt_Data}, "\"currency\":null"), "", REGEX({Receipt_Data}, "\"currency\":\"([^\"]+)\""))
```

## For Line Items Array:

Line items are more complex. You'll need a helper Experimental Code Column:

```javascript
window.function = function (receiptData) {
  const data = receiptData?.value;
  if (!data) return undefined;
  try {
    const parsed = JSON.parse(data);
    if (parsed.line_items && Array.isArray(parsed.line_items)) {
      // Return formatted line items (e.g., as comma-separated list)
      return parsed.line_items.map(item => 
        `${item.description || 'N/A'}: $${item.amount || 0}`
      ).join(', ');
    }
    return null;
  } catch (e) {
    return null;
  }
}
```

Or extract count:
```
REGEX({Receipt_Data}, "\"line_items\":\[.*?\].*?(\d+)")
```

## Testing Your Patterns:

1. Create a test computed column
2. Use the REGEX formula
3. Check if it extracts the correct value
4. Adjust the pattern if needed

## Notes:

- Glide's REGEX uses capture groups `()` - the first group is what gets returned
- `[^\"]+` means "one or more characters that aren't quotes"
- `[0-9.]+` means "one or more digits or decimal points"
- For numbers without quotes, don't include quotes in the pattern
- Test with your actual JSON string to ensure patterns work

