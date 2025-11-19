# Final Setup Guide - No Circular Dependencies

## The Solution: Use a Separate "Processed Flag" Column

Since Glide doesn't allow self-referencing, we use a separate column to track processing status.

## Step-by-Step Setup:

### Step 1: Create Your Table Columns

1. **Image Column** (Image type) - Stores receipt images
2. **Processed Flag Column** (Text type) - Regular column (NOT computed)
   - Default: Leave empty
   - This tracks if the receipt has been processed
3. **Receipt Data Column** (Text type) - Your Experimental Code Column
4. **Conditional Image Column** (Text type) - Computed column

### Step 2: Create the Conditional Image Column

1. Add a new **"If-Then-Else"** computed column
2. Name it: `Conditional Image`
3. Configure it:
   - **If:** `{Processed_Flag}` is empty
   - **Then:** Return `{Image_Column}` (the image URL)
   - **Else:** Return empty/blank

**This prevents the circular dependency!**

### Step 3: Set Up Experimental Code Column

1. Add Experimental Code Column → Map to `Receipt Data` column
2. Paste your GitHub Pages URL: `https://zactyz.github.io/glide-receipt-parser/`
3. Click Refresh
4. Map parameters:
   - **`imageUrl`** → `Conditional Image` column
   - **`processedFlag`** → `Processed Flag` column

### Step 4: Set Processed Flag After Processing

**Option A: Manual** (Simplest)
- After you see Receipt Data populated, manually set Processed Flag to `"processed"` or `"yes"`

**Option B: Automatic** (Recommended)
- Create a computed column: `Processed Flag Auto`
- Formula: `IF({Receipt_Data} is not empty, "processed", "")`
- This automatically sets the flag when Receipt Data is populated
- Then use `Processed Flag Auto` instead of `Processed Flag` in the Experimental Code Column mapping

## How It Works:

**First Time (Processed Flag is empty):**
- Conditional Image → Returns Image URL (because Processed Flag is empty)
- Function → Receives Image URL + empty Processed Flag → Processes → Returns JSON
- Receipt Data → Gets populated
- Processed Flag → Gets set to "processed" (manually or automatically)

**Subsequent Times (Processed Flag is "processed"):**
- Conditional Image → Returns empty (because Processed Flag is NOT empty)
- Function → Receives empty Image URL → Returns `undefined`
- Receipt Data → Keeps existing value
- No API call ✅

## Column Dependencies (No Cycle):

```
Image Column (independent)
    ↓
Processed Flag Column (independent or depends on Receipt Data for auto-update)
    ↓
Conditional Image Column (depends on Processed Flag + Image)
    ↓
Receipt Data Column (depends on Conditional Image + Processed Flag)
```

✅ No circular dependencies!

## Quick Setup Checklist:

- [ ] Image Column created
- [ ] Processed Flag Column created (Text, empty by default)
- [ ] Conditional Image Column created (checks if Processed Flag is empty)
- [ ] Receipt Data Column created (Experimental Code Column)
- [ ] Experimental Code Column mapped:
  - [ ] `imageUrl` → Conditional Image
  - [ ] `processedFlag` → Processed Flag
- [ ] Processed Flag Auto column created (optional, for automatic flag setting)

## Result:

✅ API called only once per receipt  
✅ No circular dependencies  
✅ No repeated calls on Glide reload  
✅ Data persists correctly

