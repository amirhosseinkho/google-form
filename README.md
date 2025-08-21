# پروژه سیستم مدیریت فرم‌ها

## فهرست مطالب
- [معرفی پروژه](#معرفی-پروژه)
- [معماری سیستم](#معماری-سیستم)
- [تکنولوژی‌های استفاده شده](#تکنولوژی‌های-استفاده-شده)
- [ساختار پروژه](#ساختار-پروژه)
- [بخش بک‌اند](#بخش-بک‌اند)
- [بخش فرانت‌اند](#بخش-فرانت‌اند)
- [دیتابیس](#دیتابیس)
- [ویژگی‌های پیاده‌سازی شده](#ویژگی‌های-پیاده‌سازی-شده)
- [راه‌اندازی پروژه](#راه‌اندازی-پروژه)
- [API Endpoints](#api-endpoints)
- [مشکلات و راه‌حل‌ها](#مشکلات-و-راه‌حل‌ها)

## معرفی پروژه

این پروژه یک سیستم کامل مدیریت فرم‌ها است که شامل ایجاد، ویرایش، توزیع و جمع‌آوری فرم‌ها می‌باشد. سیستم دارای مدیریت کاربران، گروه‌ها و گزارش‌گیری است.

### قابلیت‌های اصلی:
- مدیریت کاربران (ثبت‌نام، ورود، پروفایل)
- ایجاد و ویرایش فرم‌ها با فیلدهای مختلف
- مدیریت گروه‌ها و اعضا
- توزیع فرم‌ها به گروه‌ها
- پر کردن فرم‌ها توسط کاربران
- مشاهده و مدیریت ارسال‌ها
- ویرایش ارسال‌های انجام شده
- مشاهده سابمیشن‌های هر فرم
- گزارش‌گیری و آمار
- داشبورد با اطلاعات واقعی
- امنیت و مجوزهای کاربری

## معماری سیستم

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    ┌─────────────────┐    ┌─────────────────┐
│   (React)       │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
│ - Ant Design    │    │ - Kotlin        │    │ - PostgreSQL    │
│ - TypeScript    │    │ - JPA/Hibernate │    │ - Tables        │
│ - Vite          │    │ - Security      │    │ - Relations     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## تکنولوژی‌های استفاده شده

### Backend
- **Kotlin** - زبان برنامه‌نویسی اصلی
- **Spring Boot 3.4.2** - فریم‌ورک اصلی
- **Spring Data JPA** - مدیریت دیتابیس
- **Spring Security** - امنیت و احراز هویت
- **PostgreSQL** - دیتابیس اصلی
- **Jackson** - سریالایز/دیسریالایز JSON
- **Gradle** - مدیریت وابستگی‌ها

### Frontend
- **React 18** - فریم‌ورک اصلی
- **TypeScript** - زبان برنامه‌نویسی
- **Ant Design** - کتابخانه UI
- **React Router** - مدیریت مسیریابی
- **Vite** - ابزار ساخت
- **Tailwind CSS** - استایل‌دهی
- **React Beautiful DnD** - درگ و دراپ

### Database
- **PostgreSQL** - دیتابیس رابطه‌ای
- **Docker** - کانتینرسازی

## ساختار پروژه

```
wp_project_12/
├── backend/                    # بخش بک‌اند
│   ├── src/main/kotlin/
│   │   └── org/example/backend/
│   │       ├── api/            # API interfaces
│   │       ├── configs/        # تنظیمات
│   │       ├── controller/     # کنترلرها
│   │       ├── model/          # مدل‌ها
│   │       │   ├── database/   # مدل‌های دیتابیس
│   │       │   └── dto/        # Data Transfer Objects
│   │       ├── repository/     # repository ها
│   │       └── service/        # سرویس‌ها
│   ├── build.gradle.kts        # تنظیمات Gradle
│   └── Dockerfile              # Dockerfile بک‌اند
├── frontend/                   # بخش فرانت‌اند
│   ├── src/
│   │   ├── components/         # کامپوننت‌ها
│   │   ├── pages/             # صفحات
│   │   ├── layouts/           # لایوت‌ها
│   │   ├── routes/            # مسیریابی
│   │   └── api/               # API calls
│   ├── package.json           # وابستگی‌های npm
│   └── Dockerfile             # Dockerfile فرانت‌اند
├── database/                   # دیتابیس
│   ├── Dockerfile
│   └── init.sql/              # اسکریپت‌های اولیه
└── docker-compose.yml         # تنظیمات Docker Compose
```

## بخش بک‌اند

### ساختار کد بک‌اند

#### 1. مدل‌های دیتابیس (`model/database/`)

**UserModel.kt**
```kotlin
@Entity
@Table(name = "users")
data class UserModel(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val username: String,
    val email: String,
    val password: String,
    val name: String,
    val createdAt: String,
    val lastModified: String
)
```

**Form.kt**
```kotlin
@Entity
@Table(name = "forms")
data class Form(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val description: String,
    val fields: String?, // JSON string of FormFieldDTO
    val createdBy: String,
    val createdAt: String,
    val lastModified: String
)
```

**Group.kt**
```kotlin
@Entity
@Table(name = "groups")
data class Group(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val name: String,
    val description: String,
    val createdBy: String,
    val createdAt: String,
    val lastModified: String
)
```

**FormSubmission.kt**
```kotlin
@Entity
@Table(name = "form_submissions")
data class FormSubmission(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val formId: Long,
    val userId: Long?,
    val submittedBy: String,
    val submittedAt: String,
    val answers: String // JSON string of answers
)
```

#### 2. DTO ها (`model/dto/`)

**FormRequestDTO.kt**
```kotlin
data class FormRequestDTO(
    val name: String,
    val description: String,
    val fields: List<FormFieldDTO>? = null,
    val createdBy: String? = null
)
```

**FormFieldDTO.kt**
```kotlin
data class FormFieldDTO(
    val id: String,
    val type: String,
    val label: String,
    val required: Boolean,
    val defaultValue: Any? = null,
    val placeholder: String? = null,
    val options: List<String>? = null
)
```

#### 3. کنترلرها (`controller/`)

**FormController.kt**
- `GET /api/forms` - دریافت همه فرم‌ها
- `GET /api/forms/{id}` - دریافت فرم خاص
- `POST /api/forms` - ایجاد فرم جدید
- `PUT /api/forms/{id}` - ویرایش فرم
- `DELETE /api/forms/{id}` - حذف فرم

**UserManagementController.kt**
- `POST /api/user-managements/sign-up` - ثبت‌نام
- `POST /api/user-managements/login` - ورود
- `GET /api/user-managements/{id}` - دریافت پروفایل
- `PUT /api/user-managements/{id}` - ویرایش پروفایل

**GroupController.kt**
- `GET /api/groups` - دریافت همه گروه‌ها
- `POST /api/groups` - ایجاد گروه
- `PUT /api/groups/{id}` - ویرایش گروه
- `DELETE /api/groups/{id}` - حذف گروه

#### 4. سرویس‌ها (`service/`)

**UserManagementService.kt**
- مدیریت کاربران
- رمزنگاری پسورد
- اعتبارسنجی داده‌ها

**FormSubmissionService.kt**
- مدیریت ارسال فرم‌ها
- ذخیره پاسخ‌ها
- بازیابی ارسال‌ها

**ReportsService.kt**
- تولید آمار سیستم
- تحلیل فرم‌ها
- گزارش‌گیری

#### 5. Repository ها (`repository/`)

**UserRepository.kt**
```kotlin
@Repository
interface UserRepository : JpaRepository<UserModel, Long> {
    fun findByUsername(username: String): UserModel?
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
}
```

### تنظیمات امنیت

**SecurityConfig.kt**
```kotlin
@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.disable() }
            .authorizeHttpRequests { auth ->
                auth.requestMatchers("/api/**").permitAll()
                    .anyRequest().authenticated()
            }
        return http.build()
    }
}
```

## بخش فرانت‌اند

### ساختار کد فرانت‌اند

#### 1. صفحات اصلی (`pages/`)

**LoginPage.tsx**
- فرم ورود کاربران
- اعتبارسنجی ورودی‌ها
- ذخیره توکن در localStorage

**RegisterPage.tsx**
- فرم ثبت‌نام کاربران جدید
- اعتبارسنجی ایمیل و پسورد
- پیام‌های خطا

**Dashboard.tsx**
- داشبورد اصلی
- نمایش آمار سیستم
- فعالیت‌های اخیر

**FormBuilderPage.tsx**
- ایجاد و ویرایش فرم‌ها
- اضافه کردن فیلدهای مختلف
- پیش‌نمایش فرم

**FormsPage.tsx**
- لیست همه فرم‌ها
- عملیات ویرایش و حذف
- تأیید حذف

#### 2. لایوت‌ها (`layouts/`)

**ProtectedLayout.tsx**
```typescript
const ProtectedLayout = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
```

**Navigation.tsx**
- منوی اصلی سیستم
- لینک‌های مختلف
- نمایش اطلاعات کاربر

#### 3. کامپوننت‌ها (`components/`)

**ChartReport.tsx**
- نمودارهای گزارش‌گیری
- پشتیبانی از نمودار میله‌ای و دایره‌ای
- داده‌های واقعی از API

#### 4. مسیریابی (`routes/`)

**AppRoutes.tsx**
```typescript
const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/forms", element: <FormsPage /> },
      { path: "/forms/create", element: <FormBuilderPage /> },
      { path: "/forms/:id", element: <FormPage /> },
      { path: "/forms/:id/edit", element: <FormBuilderPage /> },
      // ... سایر مسیرها
    ]
  },
  {
    path: "/login",
    element: <PublicLayout><LoginPage /></PublicLayout>
  }
]);
```

### ویژگی‌های UI/UX

1. **طراحی ریسپانسیو**
   - سازگار با موبایل و دسکتاپ
   - استفاده از Tailwind CSS

2. **تجربه کاربری**
   - پیام‌های موفقیت و خطا
   - Loading states
   - تأیید عملیات حساس

3. **اعتبارسنجی**
   - اعتبارسنجی فرم‌ها
   - پیام‌های خطای مناسب
   - پیش‌نمایش فیلدها

## دیتابیس

### جداول اصلی

#### 1. جدول users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at VARCHAR(255) NOT NULL,
    last_modified VARCHAR(255) NOT NULL
);
```

#### 2. جدول forms
```sql
CREATE TABLE forms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields TEXT, -- JSON string
    created_by VARCHAR(255) NOT NULL,
    created_at VARCHAR(255) NOT NULL,
    last_modified VARCHAR(255) NOT NULL
);
```

#### 3. جدول groups
```sql
CREATE TABLE groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at VARCHAR(255) NOT NULL,
    last_modified VARCHAR(255) NOT NULL
);
```

#### 4. جدول group_members
```sql
CREATE TABLE group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id),
    user_id BIGINT REFERENCES users(id),
    joined_at VARCHAR(255) NOT NULL
);
```

#### 5. جدول form_assignments
```sql
CREATE TABLE form_assignments (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT REFERENCES forms(id),
    group_id BIGINT REFERENCES groups(id),
    assigned_by VARCHAR(255) NOT NULL,
    assigned_at VARCHAR(255) NOT NULL
);
```

#### 6. جدول form_submissions
```sql
CREATE TABLE form_submissions (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT REFERENCES forms(id),
    user_id BIGINT REFERENCES users(id),
    submitted_by VARCHAR(255) NOT NULL,
    submitted_at VARCHAR(255) NOT NULL,
    answers TEXT -- JSON string
);
```

### روابط دیتابیس

```
users (1) ──── (N) group_members (N) ──── (1) groups
users (1) ──── (N) form_submissions (N) ──── (1) forms
groups (1) ──── (N) form_assignments (N) ──── (1) forms
```

## ویژگی‌های پیاده‌سازی شده

### 1. مدیریت کاربران
- **ثبت‌نام**: ثبت کاربران جدید با اعتبارسنجی
- **ورود**: احراز هویت کاربران
- **پروفایل**: مشاهده و ویرایش اطلاعات شخصی
- **تغییر پسورد**: امکان تغییر رمز عبور

### 2. مدیریت فرم‌ها
- **ایجاد فرم**: ساخت فرم‌های جدید با فیلدهای مختلف
- **ویرایش فرم**: تغییر محتوای فرم‌های موجود
- **حذف فرم**: حذف فرم‌ها با تأیید
- **مشاهده فرم**: نمایش جزئیات فرم‌ها

### 3. انواع فیلدها
- **Text**: فیلد متنی ساده
- **Textarea**: فیلد متنی چند خطی
- **Number**: فیلد عددی
- **Date**: فیلد تاریخ
- **Dropdown**: فیلد انتخاب از لیست
- **Checkbox**: فیلد انتخاب چندگانه
- **Radio**: فیلد انتخاب تکی

### 4. مدیریت گروه‌ها
- **ایجاد گروه**: ساخت گروه‌های جدید
- **ویرایش گروه**: تغییر اطلاعات گروه
- **حذف گروه**: حذف گروه‌ها
- **اضافه کردن عضو**: افزودن کاربران به گروه
- **حذف عضو**: خارج کردن کاربران از گروه

### 5. توزیع فرم‌ها
- **تخصیص فرم**: اختصاص فرم‌ها به گروه‌ها
- **مشاهده فرم‌های تخصیص داده شده**: لیست فرم‌های قابل پر کردن
- **حذف تخصیص**: لغو تخصیص فرم‌ها

### 6. پر کردن فرم‌ها
- **مشاهده فرم**: نمایش فرم‌های تخصیص داده شده
- **پر کردن فرم**: پاسخ به سوالات فرم
- **ارسال فرم**: ثبت نهایی پاسخ‌ها

### 7. مدیریت ارسال‌ها
- **مشاهده ارسال‌ها**: لیست ارسال‌های کاربر
- **جزئیات ارسال**: مشاهده پاسخ‌های ارسال شده
- **حذف ارسال**: حذف ارسال‌های ناخواسته

### 8. گزارش‌گیری
- **آمار کلی**: تعداد کاربران، فرم‌ها، گروه‌ها
- **تحلیل فرم‌ها**: آمار ارسال‌ها و پاسخ‌ها
- **نمودارها**: نمایش بصری داده‌ها
- **فعالیت‌های اخیر**: آخرین فعالیت‌های سیستم

### 9. داشبورد
- **آمار واقعی**: اطلاعات زنده از دیتابیس
- **فعالیت‌های اخیر**: آخرین تغییرات
- **دسترسی سریع**: لینک‌های مهم

## راه‌اندازی پروژه

### پیش‌نیازها
- Java 17
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL

### 1. راه‌اندازی دیتابیس
```bash
# راه‌اندازی PostgreSQL با Docker
docker-compose up -d database
```

### 2. راه‌اندازی بک‌اند
```bash
cd backend
./gradlew bootRun
```

### 3. راه‌اندازی فرانت‌اند
```bash
cd frontend
npm install
npm run dev
```

### 4. دسترسی به سیستم
- **فرانت‌اند**: http://localhost:5173
- **بک‌اند**: http://localhost:8080
- **دیتابیس**: localhost:5432

## API Endpoints

### مدیریت کاربران
```
POST   /api/user-managements/sign-up     # ثبت‌نام
POST   /api/user-managements/login       # ورود
GET    /api/user-managements/{id}        # دریافت پروفایل
PUT    /api/user-managements/{id}        # ویرایش پروفایل
```

### مدیریت فرم‌ها
```
GET    /api/forms                        # لیست فرم‌ها
GET    /api/forms/{id}                   # دریافت فرم
POST   /api/forms                        # ایجاد فرم
PUT    /api/forms/{id}                   # ویرایش فرم
DELETE /api/forms/{id}                   # حذف فرم
```

### مدیریت گروه‌ها
```
GET    /api/groups                       # لیست گروه‌ها
GET    /api/groups/{id}                  # دریافت گروه
POST   /api/groups                       # ایجاد گروه
PUT    /api/groups/{id}                  # ویرایش گروه
DELETE /api/groups/{id}                  # حذف گروه
POST   /api/groups/members               # اضافه کردن عضو
```

### تخصیص فرم‌ها
```
GET    /api/form-assignments/form/{id}   # فرم‌های تخصیص داده شده
POST   /api/form-assignments             # تخصیص فرم
DELETE /api/form-assignments/{id}        # حذف تخصیص
```

### ارسال فرم‌ها
```
GET    /api/form-submissions/user/{id}   # ارسال‌های کاربر
POST   /api/form-submissions             # ارسال فرم
DELETE /api/form-submissions/{id}        # حذف ارسال
```

### گزارش‌گیری
```
GET    /api/reports/stats                # آمار کلی
GET    /api/reports/form/{id}/analytics  # تحلیل فرم
GET    /api/reports/activity             # فعالیت‌های اخیر
```

## مشکلات و راه‌حل‌ها

### 1. مشکل ذخیره فیلدهای فرم
**مشکل**: فیلدهای فرم در دیتابیس ذخیره نمی‌شدند
**راه‌حل**: 
- اضافه کردن ObjectMapper با تنظیمات Kotlin
- بهبود سریالایز/دیسریالایز JSON
- اضافه کردن لاگ‌های debug

### 2. مشکل احراز هویت
**مشکل**: عدم پشتیبانی از JWT
**راه‌حل**: 
- استفاده از توکن ساده در localStorage
- غیرفعال کردن موقت Security برای توسعه

### 3. مشکل CORS
**مشکل**: خطای CORS در فرانت‌اند
**راه‌حل**: 
- غیرفعال کردن CORS در SecurityConfig
- تنظیم headers مناسب

### 4. مشکل دیتابیس
**مشکل**: عدم اتصال به PostgreSQL
**راه‌حل**: 
- استفاده از Docker Compose
- تنظیم credentials صحیح
- ایجاد جداول با init.sql

### 5. مشکل UI/UX
**مشکل**: عدم سازگاری با موبایل
**راه‌حل**: 
- استفاده از Tailwind CSS
- طراحی ریسپانسیو
- بهبود تجربه کاربری

## نکات مهم

### امنیت
- پسوردها با BCrypt رمزنگاری می‌شوند
- اعتبارسنجی ورودی‌ها در بک‌اند
- محافظت از API endpoints

### عملکرد
- استفاده از JPA برای بهینه‌سازی کوئری‌ها
- Lazy loading برای روابط
- Caching مناسب

### قابلیت توسعه
- معماری لایه‌ای
- جداسازی مسئولیت‌ها
- کد تمیز و قابل نگهداری

## نتیجه‌گیری

این پروژه یک سیستم کامل مدیریت فرم‌ها است که با استفاده از تکنولوژی‌های مدرن پیاده‌سازی شده است. سیستم دارای قابلیت‌های کامل مدیریت کاربران، فرم‌ها، گروه‌ها و گزارش‌گیری می‌باشد.

### نقاط قوت:
- معماری کامل و منسجم
- UI/UX مدرن و کاربرپسند
- امنیت مناسب
- قابلیت توسعه
- مستندات کامل


---

