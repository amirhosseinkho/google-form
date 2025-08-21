# راه‌اندازی سیستم گزارش‌گیری

## مراحل راه‌اندازی

### 1. راه‌اندازی بک‌اند

```bash
cd backend
./gradlew bootRun
```

بک‌اند روی پورت 8080 اجرا خواهد شد.

### 2. راه‌اندازی فرانت‌اند

```bash
cd frontend
npm install
npm run dev
```

فرانت‌اند روی پورت 5173 اجرا خواهد شد.

### 3. تست API

برای تست API endpoints، فایل `frontend/src/test-api.html` را در مرورگر باز کنید.

## API Endpoints

### گزارش‌ها
- `GET /api/reports/system-stats` - آمار کلی سیستم
- `GET /api/reports/forms-with-stats` - لیست فرم‌ها با آمار
- `GET /api/reports/form/{formId}/analytics` - تحلیل‌های یک فرم خاص
- `GET /api/reports/recent-activity` - فعالیت‌های اخیر
- `GET /api/reports/submissions-count` - تعداد کل ارسال‌ها

### فرم‌ها
- `GET /api/forms/{formId}` - دریافت یک فرم خاص
- `GET /api/forms` - لیست همه فرم‌ها

## مشکلات احتمالی و راه‌حل

### 1. خطای CORS
اگر با خطای CORS مواجه شدید، مطمئن شوید که:
- بک‌اند روی پورت 8080 اجرا می‌شود
- فرانت‌اند روی پورت 5173 اجرا می‌شود
- فایل `WebConfig.kt` درست تنظیم شده است

### 2. خطای اتصال به دیتابیس
اگر با خطای دیتابیس مواجه شدید:
- مطمئن شوید که دیتابیس PostgreSQL در حال اجرا است
- فایل `application.properties` را بررسی کنید
- لاگ‌های بک‌اند را بررسی کنید

### 3. داده‌های خالی
اگر گزارش‌ها خالی هستند:
- مطمئن شوید که فرم‌هایی در دیتابیس وجود دارند
- مطمئن شوید که ارسال‌هایی برای فرم‌ها وجود دارند
- API را با فایل تست بررسی کنید

## ساختار کد

### بک‌اند
- `ReportsController.kt` - کنترلر API گزارش‌ها
- `ReportsService.kt` - سرویس منطق گزارش‌گیری
- `ReportsDTO.kt` - DTO های گزارش‌ها

### فرانت‌اند
- `reportsApi.ts` - API service برای گزارش‌ها
- `formsApi.ts` - API service برای فرم‌ها
- `ReportPage.tsx` - صفحه جزئیات گزارش
- `ReportsPage.tsx` - صفحه لیست گزارش‌ها

## ویژگی‌های اضافه شده

1. **مدیریت خطا**: تمام API calls دارای error handling هستند
2. **Fallback Data**: در صورت عدم اتصال به API، داده‌های mock نمایش داده می‌شوند
3. **Type Safety**: تمام interface ها با TypeScript تعریف شده‌اند
4. **Responsive Design**: صفحات با طراحی responsive ساخته شده‌اند 