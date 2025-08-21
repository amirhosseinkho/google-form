# 🔧 Fix Field Names Issue

## 🎯 Problem
The charts are showing "Value" instead of the actual field name (like "Age" or "سن").

## 🔍 Root Cause
The issue is in the JSON parsing logic in `ReportsService.kt`. The system is not correctly extracting field names from the submission data structure.

## ✅ Solution Applied

### 1. Improved JSON Parsing
Updated `parseJsonAnswers()` function to properly handle the JSON structure:

```kotlin
private fun parseJsonAnswers(answersString: String): Map<String, String> {
    val answers = mutableMapOf<String, String>()
    
    try {
        // Remove outer brackets if it's an array
        var cleanString = answersString.trim()
        if (cleanString.startsWith("[") && cleanString.endsWith("]")) {
            cleanString = cleanString.substring(1, cleanString.length - 1)
        }
        
        // Split by },{ to get individual objects
        val objects = cleanString.split("},{")
        
        objects.forEach { obj ->
            val cleanObj = obj.trim().removePrefix("{").removeSuffix("}")
            val pairs = cleanObj.split(",")
            
            var currentFieldId = ""
            var currentValue = ""
            
            pairs.forEach { pair ->
                val keyValue = pair.trim().split(":")
                if (keyValue.size == 2) {
                    val key = keyValue[0].trim().removeSurrounding("\"")
                    val value = keyValue[1].trim().removeSurrounding("\"")
                    
                    when {
                        key == "fieldId" -> {
                            currentFieldId = value
                        }
                        key == "value" -> {
                            currentValue = value
                        }
                    }
                }
            }
            
            // If we have both fieldId and value, add to answers
            if (currentFieldId.isNotEmpty() && currentValue.isNotEmpty()) {
                answers[currentFieldId] = currentValue
            }
        }
    } catch (e: Exception) {
        // If JSON parsing fails, try simple parsing
        return parseSimpleAnswers(answersString)
    }
    
    return answers
}
```

### 2. Enhanced Field Label Mapping
Updated `getFieldLabel()` function to handle more field types:

```kotlin
private fun getFieldLabel(fieldName: String): String {
    return when (fieldName.lowercase()) {
        "age" -> "سن"
        "gender" -> "جنسیت"
        "department" -> "دپارتمان"
        "education" -> "تحصیلات"
        "experience" -> "تجربه"
        "satisfaction" -> "رضایت"
        "rating" -> "امتیاز"
        "salary" -> "حقوق"
        "name" -> "نام"
        "email" -> "ایمیل"
        "phone" -> "تلفن"
        "address" -> "آدرس"
        "city" -> "شهر"
        "country" -> "کشور"
        "job_title" -> "عنوان شغلی"
        "company" -> "شرکت"
        "years_experience" -> "سال‌های تجربه"
        "skills" -> "مهارت‌ها"
        "languages" -> "زبان‌ها"
        "certifications" -> "گواهینامه‌ها"
        "value" -> "مقدار"
        "fieldid" -> "شناسه فیلد"
        else -> {
            // Try to clean up the field name and make it more readable
            val cleaned = fieldName.replace("_", " ").replace("-", " ")
            if (cleaned.length > 1) {
                cleaned.capitalize()
            } else {
                fieldName
            }
        }
    }
}
```

### 3. Added Debug Logging
Added debug prints to help troubleshoot parsing issues:

```kotlin
private fun parseSubmissionAnswers(answersString: String): Map<String, String> {
    val answers = mutableMapOf<String, String>()
    
    try {
        // Debug: Print the raw input
        println("DEBUG: Raw answers string: $answersString")
        
        // Try to parse as JSON first
        if (answersString.startsWith("{") || answersString.startsWith("[")) {
            val jsonAnswers = parseJsonAnswers(answersString)
            println("DEBUG: Parsed JSON answers: $jsonAnswers")
            return jsonAnswers
        } else {
            // Parse as key-value pairs
            val simpleAnswers = parseSimpleAnswers(answersString)
            println("DEBUG: Parsed simple answers: $simpleAnswers")
            return simpleAnswers
        }
    } catch (e: Exception) {
        println("DEBUG: Error parsing answers: ${e.message}")
        // If parsing fails, return empty map
    }
    
    return answers
}
```

## 🧪 Testing

### 1. Use Debug Tool
Open `debug-field-names.html` in your browser to:
- Check raw submission data
- Test JSON parsing
- Debug field stats
- Verify field names

### 2. Check Backend Logs
After starting the backend, check the console output for debug messages:
```
DEBUG: Raw answers string: [{"fieldId":"age","value":"25"},{"fieldId":"gender","value":"male"}]
DEBUG: Parsed JSON answers: {age=25, gender=male}
```

### 3. Test Specific Form
1. Start backend: `./gradlew bootRun`
2. Open `debug-field-names.html`
3. Enter your form ID
4. Click "Debug Field Stats"
5. Check if field names are correct

## 🔄 Expected Data Structure

The system expects submission data in this format:
```json
[
  {"fieldId": "age", "value": "25"},
  {"fieldId": "gender", "value": "male"},
  {"fieldId": "department", "value": "IT"}
]
```

## 🎯 Expected Result

After the fix, charts should show:
- ✅ "سن" instead of "Value" for age field
- ✅ "جنسیت" instead of "Value" for gender field
- ✅ "دپارتمان" instead of "Value" for department field

## 🚀 Next Steps

1. **Rebuild Backend**: `./gradlew build`
2. **Start Backend**: `./gradlew bootRun`
3. **Test with Debug Tool**: Open `debug-field-names.html`
4. **Verify Charts**: Check if field names are correct
5. **Remove Debug Logs**: Once working, remove debug prints

## 🔍 Troubleshooting

If the issue persists:

1. **Check Data Format**: Verify submission data structure
2. **Review Debug Logs**: Check backend console output
3. **Test JSON Parsing**: Use the debug tool to test parsing
4. **Verify Field IDs**: Ensure field IDs match expected names

The fix should resolve the field name display issue and show proper Persian labels in the charts! 

image.png
باشه، این کامندها رو اجرا کن تا ببینیم چه داده‌هایی در دیتابیس داریم:

**1. بررسی فرم‌های موجود:**
```sql
SELECT id, name, fields FROM form ORDER BY id;
```

**2. بررسی سابمیشن‌های موجود:**
```sql
SELECT id, form_id, submitted_by, answers FROM form_submission ORDER BY id;
```

**3. بررسی یک فرم خاص (مثلاً فرم ID 1):**
```sql
SELECT id, name, fields, created_by FROM form WHERE id = 1;
```

**4. بررسی سابمیشن‌های یک فرم خاص:**

```sql
SELECT id, form_id, submitted_by, answers, submitted_at FROM form_submission WHERE form_id = 1;
```

**5. بررسی تعداد سابمیشن‌ها برای هر فرم:**
```sql
SELECT f.id, f.name, COUNT(fs.id) as submission_count 
FROM form f 
LEFT JOIN form_submission fs ON f.id = fs.form_id 
GROUP BY f.id, f.name;
```

این کامندها رو یکی یکی اجرا کن و نتیجه رو بهم بگو تا ببینیم چه فرم‌هایی داریم و ساختار داده‌ها چطوریه. 