# Boolean Flag Setup - Skip Processing

## Setup with Boolean Flag

Use a boolean `skipProcessing` parameter that's computed based on a regular Processed Flag column.

## Step-by-Step Setup:

### Step 1: Create Your Table Columns

1. **Image Column** (Image type) - Stores receipt images
2. **Processed Flag Column** (Text type) - **Regular column** (NOT computed!)
   - Leave it empty by default
   - Set to `"processed"` after processing (via button action)
3. **Skip Processing Column** (Boolean type) - Computed column
   - Formula: `IF({Processed_Flag} is not empty, true, false)`
   - This converts the text flag to a boolean
4. **Conditional Image Column** (Text type) - Computed "If-Then-Else"
   - **If:** `{Processed_Flag}` is empty
   - **Then:** Return `{Image_Column}`
   - **Else:** Return empty
5. **Receipt Data Column** (Text type) - Your Experimental Code Column

### Step 2: Set Up Experimental Code Column

1. Add Experimental Code Column → Map to `Receipt Data` column
2. Paste your GitHub Pages URL: `https://zactyz.github.io/glide-receipt-parser/`
3. Click Refresh
4. Map parameters:
   - **`imageUrl`** → `Conditional Image` column
   - **`skipProcessing`** → `Skip Processing` column (boolean)

### Step 3: Update Processed Flag After Processing

**Use Glide Action Button** (Available in Free Tier):

1. Add a **Button** component to your screen
2. Configure action:
   - **Action:** Set Column Values (or Update Row)
   - **Set:** `Processed_Flag` = `"processed"`
3. Optional: Show button only when:
   - `Receipt_Data` is not empty AND
   - `Processed_Flag` is empty

## How It Works:

**First Time (Processed Flag is empty):**
- Skip Processing → `false` (because Processed Flag is empty)
- Conditional Image → Returns Image URL
- Function → Receives Image URL + `skipProcessing = false` → Processes → Returns JSON
- Receipt Data → Gets populated
- **Click button** → Sets Processed Flag to `"processed"`

**Subsequent Times (Processed Flag is "processed"):**
- Skip Processing → `true` (because Processed Flag is NOT empty)
- Conditional Image → Returns empty
- Function → Receives empty Image URL + `skipProcessing = true` → Returns `undefined` immediately
- **No API call** ✅

## Column Dependencies (No Cycle):

```
Image Column (independent)
    ↓
Processed Flag Column (regular column, updated by button action)
    ↓
Skip Processing Column (depends on Processed Flag only)
    ↓
Conditional Image Column (depends on Processed Flag + Image)
    ↓
Receipt Data Column (depends on Conditional Image + Skip Processing)
```

✅ **No circular dependencies!**

## Why This Works:

- **Processed Flag** = Regular column (not computed, updated by action)
- **Skip Processing** = Computed based on Processed Flag (one-way dependency)
- **Conditional Image** = Computed based on Processed Flag (one-way dependency)
- **Receipt Data** = Depends on Conditional Image + Skip Processing
- No cycles!

## Confirming Undefined Behavior:

✅ **Yes, Glide preserves existing values when computed columns return `undefined`**
- This is standard Glide behavior
- Returning `undefined` = "don't change anything"
- Only returning a value will update the column

