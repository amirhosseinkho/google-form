# 🧪 Testing Guide - Field Name Fixes

## 🎯 What We Fixed

The main issue was that charts were showing UUIDs (like `937b60fa-2ffe-45b0-8ac5-1c199055b9ac`) instead of meaningful field names (like "سن" for age).

## ✅ Changes Made

### 1. Enhanced JSON Parsing
- Added support for `label` field in JSON structure
- Added support for `type` field to infer field names
- Improved field name extraction logic

### 2. UUID Filtering
- Added `isUUID()` function to detect UUID patterns
- Added `filterValidFields()` to remove UUID fields
- Added `extractMeaningfulFieldName()` to get proper field names

### 3. Better Field Label Mapping
- Enhanced Persian label mapping
- Added fallback logic for unknown fields
- Improved field name cleaning

## 🧪 Testing Steps

### Step 1: Test Field Parsing Logic
1. Open `test-field-parsing.html` in your browser
2. You'll see sample JSON data that matches your submission format
3. Click "Test Complete Flow" to see the parsing process
4. Verify that:
   - UUID fields are filtered out
   - Meaningful field names are extracted
   - Persian labels are applied correctly

### Step 2: Test Backend Changes
1. Build the backend: `./gradlew build`
2. Start the backend: `./gradlew bootRun`
3. Check console output for debug messages like:
   ```
   DEBUG: Raw answers string: [{"fieldId":"937b60fa-2ffe-45b0-8ac5-1c199055b9ac","value":"25","label":"age","type":"number"}]
   DEBUG: Parsed JSON answers: {age=25}
   DEBUG: Filtered answers: {age=25}
   DEBUG: Added field: age = 25 (from fieldId: 937b60fa-2ffe-45b0-8ac5-1c199055b9ac, label: age)
   ```

### Step 3: Test API Endpoints
1. Open `debug-field-names.html` in your browser
2. Enter your form ID
3. Click "Debug Field Stats"
4. Check if field names are now showing as "سن" instead of UUIDs

### Step 4: Test Frontend Charts
1. Start frontend: `npm run dev`
2. Navigate to your form report page
3. Check if charts show proper field names
4. Verify that dropdown shows "سن" instead of UUID

## 🔍 Expected Results

### Before Fix:
```
Chart Title: 937b60fa-2ffe-45b0-8ac5-1c199055b9ac
Field Dropdown: 937b60fa-2ffe-45b0-8ac5-1c199055b9ac (categorical)
```

### After Fix:
```
Chart Title: سن
Field Dropdown: سن (numerical)
```

## 📊 Sample Data Structure

The system now handles this JSON structure correctly:
```json
[
  {
    "fieldId": "937b60fa-2ffe-45b0-8ac5-1c199055b9ac",
    "value": "25",
    "label": "age",
    "type": "number"
  },
  {
    "fieldId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "value": "male",
    "label": "gender",
    "type": "radio"
  }
]
```

And extracts:
```json
{
  "age": "25",
  "gender": "male"
}
```

With labels:
```json
{
  "سن": "25",
  "جنسیت": "male"
}
```

## 🚨 Troubleshooting

### If UUIDs Still Appear:
1. Check backend console for debug messages
2. Verify JSON structure in your submissions
3. Check if `label` field is present in your data
4. Use `test-field-parsing.html` to test your exact data format

### If No Fields Appear:
1. Check if submissions have data
2. Verify JSON format is correct
3. Check backend logs for parsing errors
4. Test with sample data in `test-field-parsing.html`

### If Labels Are Wrong:
1. Check `getFieldLabel()` function
2. Verify field names are being extracted correctly
3. Add new field mappings if needed

## 🎯 Success Criteria

✅ Charts show "سن" instead of UUID  
✅ Field dropdown shows meaningful names  
✅ Persian labels are applied correctly  
✅ No UUID fields appear in charts  
✅ Debug logs show proper field extraction  

## 🔧 Manual Testing Commands

```bash
# Build and start backend
./gradlew build
./gradlew bootRun

# Check logs for debug messages
# Look for lines starting with "DEBUG:"

# Test API directly
curl http://localhost:8080/api/reports/form/1/field-stats

# Check if field names are correct in response
```

## 📝 Next Steps After Testing

1. **If everything works**: Remove debug logs for production
2. **If issues remain**: Check the specific error messages
3. **If new field types**: Add them to `getFieldLabel()` function
4. **If performance issues**: Consider caching field mappings

The fix should resolve the UUID display issue and show proper Persian field names in all charts! 🎉 