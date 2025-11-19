# Fixing Circular Dependency in Glide

## The Problem:
Glide detected a circular dependency:
- Receipt Results → depends on → Conditional Image
- Conditional Image → depends on → Receipt Results (checks if empty)
- This creates a cycle ❌

## The Solution: Use a Separate "Processed" Flag Column

Instead of checking if Receipt Results is empty, use a separate column to track processing status.

## Step-by-Step Setup:

### Step 1: Create Your Table Columns

1. **Image Column** (Image type) - Stores receipt images
2. **Processed Flag Column** (Text/Boolean type) - Tracks if receipt has been processed
   - Default value: empty or `false`
   - This is NOT a computed column, just a regular column
3. **Receipt Data Column** (Text type) - Your Experimental Code Column
4. **Conditional Image Column** (Text type) - Controls when processing happens

### Step 2: Create the Conditional Column

1. Add a new **"If-Then-Else"** computed column
2. Name it: `Conditional Image` (or similar)
3. Configure it:
   - **If:** `{Processed_Flag}` is empty (or equals `false`)
   - **Then:** Return `{Image_Column}` (the image URL)
   - **Else:** Return empty/blank

**Key Change:** Check `Processed_Flag` instead of `Receipt_Data`

### Step 3: Set Up Experimental Code Column

1. Add Experimental Code Column → Map to `Receipt Data` column
2. Paste your GitHub Pages URL
3. Map `imageUrl` parameter to your **`Conditional Image`** column

### Step 4: Update Processed Flag (Optional Automation)

After processing, you can automatically set the Processed Flag:

**Option A: Manual** - Set Processed Flag to `true` or `"processed"` after you see results

**Option B: Automatic** - Create a computed column:
- Name: `Processed Flag Auto`
- Formula: `IF({Receipt_Data} is not empty, "processed", "")`
- This sets the flag automatically when Receipt Data is populated

## How It Works:

**First Time (Processed Flag is empty):**
- Conditional Image → Returns Image URL (because Processed Flag is empty)
- Function → Processes → Returns JSON
- Receipt Data → Gets populated
- Processed Flag → Can be set to "processed" (manually or automatically)

**Subsequent Times (Processed Flag is "processed"):**
- Conditional Image → Returns empty (because Processed Flag is NOT empty)
- Function → Receives empty → Returns `undefined`
- Receipt Data → Keeps existing value
- No API call ✅

## Column Dependencies (No Cycle):

- Receipt Data → depends on → Conditional Image ✅
- Conditional Image → depends on → Processed Flag ✅
- Processed Flag → independent (or depends on Receipt Data for auto-update) ✅
- No circular dependency!

## Alternative: Simpler Approach

If you don't want a separate flag column, you can:

1. **Skip the conditional column entirely**
2. **Check in the function itself** - but we'd need to pass Receipt Data as a parameter
3. **Use a trigger column** - manually control when processing happens

Would you like me to update the function to accept Receipt Data as a parameter so it can check itself?

