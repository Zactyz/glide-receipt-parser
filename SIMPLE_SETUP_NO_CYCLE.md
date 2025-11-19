# Simple Setup - No Circular Dependencies

## The Solution: Conditional Image Column Only

Use a Conditional Image column that checks a regular (non-computed) Processed Flag column. This breaks the cycle!

## Step-by-Step Setup:

### Step 1: Create Your Table Columns

1. **Image Column** (Image type) - Stores receipt images
2. **Processed Flag Column** (Text type) - **Regular column** (NOT computed!)
   - Leave it empty by default
   - This will be updated via action/automation
3. **Conditional Image Column** (Text type) - Computed "If-Then-Else"
4. **Receipt Data Column** (Text type) - Your Experimental Code Column

### Step 2: Create the Conditional Image Column

1. Add a new **"If-Then-Else"** computed column
2. Name it: `Conditional Image`
3. Configure it:
   - **If:** `{Processed_Flag}` is empty
   - **Then:** Return `{Image_Column}` (the image URL)
   - **Else:** Return empty/blank

**Key:** This checks Processed Flag (regular column), not Receipt Data!

### Step 3: Set Up Experimental Code Column

1. Add Experimental Code Column → Map to `Receipt Data` column
2. Paste your GitHub Pages URL: `https://zactyz.github.io/glide-receipt-parser/`
3. Click Refresh
4. Map `imageUrl` parameter → `Conditional Image` column

**That's it!** No processedFlag parameter needed.

### Step 4: Update Processed Flag After Processing

**Option A: Glide Action Button** (Recommended)

1. Add a **Button** component to your screen
2. Configure action:
   - **Action:** Update Row
   - **Set:** `Processed_Flag` = `"processed"`
3. Optional: Show button only when:
   - `Receipt_Data` is not empty AND
   - `Processed_Flag` is empty

**Option B: Glide Automation**

1. Go to **Automations**
2. Create new automation:
   - **Trigger:** When `Receipt_Data` changes
   - **Condition:** `Receipt_Data` is not empty
   - **Action:** Update Row → Set `Processed_Flag` = `"processed"`

**Option C: Manual**

Just manually set Processed Flag to `"processed"` after you see Receipt Data populated.

## How It Works:

**First Time (Processed Flag is empty):**
- Conditional Image → Returns Image URL (because Processed Flag is empty)
- Function → Receives Image URL → Processes → Returns JSON
- Receipt Data → Gets populated
- **You set Processed Flag** → `"processed"` (via button/automation/manual)

**Subsequent Times (Processed Flag is "processed"):**
- Conditional Image → Returns empty (because Processed Flag is NOT empty)
- Function → Receives empty → Returns `undefined`
- Receipt Data → Keeps existing value
- **No API call** ✅

## Column Dependencies (No Cycle):

```
Image Column (independent)
    ↓
Processed Flag Column (regular column, updated by action/automation)
    ↓
Conditional Image Column (depends on Processed Flag + Image)
    ↓
Receipt Data Column (depends on Conditional Image only)
```

✅ **No circular dependencies!**

## Why This Works:

- **Processed Flag** is a regular column (not computed)
- It's updated via action/automation (one-way update)
- **Conditional Image** checks Processed Flag (not Receipt Data)
- **Receipt Data** only depends on Conditional Image
- No cycle!

## Quick Setup Checklist:

- [ ] Image Column created
- [ ] Processed Flag Column created (Text, regular column, empty by default)
- [ ] Conditional Image Column created (checks if Processed Flag is empty)
- [ ] Receipt Data Column created (Experimental Code Column)
- [ ] Experimental Code Column mapped: `imageUrl` → Conditional Image
- [ ] Action button or automation set up to update Processed Flag

## Result:

✅ API called only once per receipt  
✅ No circular dependencies  
✅ No repeated calls on Glide reload  
✅ Data persists correctly

