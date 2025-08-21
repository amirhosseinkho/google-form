# میکروسرویس‌های سیستم مدیریت فرم‌ها

این دایرکتوری شامل تمام میکروسرویس‌های سیستم مدیریت فرم‌ها است که از معماری میکروسرویس استفاده می‌کنند.

## ساختار دایرکتوری

```
microservices/
├── discovery-server/           # Eureka Discovery Server
├── api-gateway/               # API Gateway
├── user-management-service/    # سرویس مدیریت کاربران
├── form-management-service/    # سرویس مدیریت فرم‌ها
├── group-management-service/   # سرویس مدیریت گروه‌ها
├── form-submission-service/    # سرویس ارسال فرم‌ها
├── reports-service/            # سرویس گزارش‌گیری
├── sql/                       # اسکریپت‌های دیتابیس
├── docker-compose.yml         # تنظیمات Docker Compose
├── build-all.sh               # اسکریپت ساخت همه سرویس‌ها
└── README.md                  # این فایل
```

## سرویس‌ها

### 1. Discovery Server (Port: 8761)
- مدیریت ثبت و کشف سرویس‌ها
- استفاده از Spring Cloud Netflix Eureka

### 2. API Gateway (Port: 8080)
- نقطه ورودی واحد برای تمام درخواست‌ها
- مسیریابی و Load Balancing
- استفاده از Spring Cloud Gateway

### 3. User Management Service (Port: 8081)
- مدیریت کاربران و احراز هویت
- JWT token management
- Password encryption

### 4. Form Management Service (Port: 8082)
- مدیریت فرم‌ها و فیلدها
- قالب‌های فرم
- جستجو و فیلتر

### 5. Group Management Service (Port: 8083)
- مدیریت گروه‌ها و اعضا
- نقش‌های گروه
- محدودیت تعداد اعضا

### 6. Form Submission Service (Port: 8084)
- ارسال فرم‌ها
- تخصیص فرم‌ها به گروه‌ها
- مدیریت پیش‌نویس‌ها

### 7. Reports Service (Port: 8085)
- تولید گزارش‌ها و آمار
- تحلیل داده‌ها
- نمودارها و گراف‌ها

## راه‌اندازی

### پیش‌نیازها
- Java 17
- Docker & Docker Compose
- Gradle

### ساخت همه سرویس‌ها
```bash
# ساخت همه میکروسرویس‌ها
chmod +x build-all.sh
./build-all.sh
```

### اجرای با Docker Compose
```bash
# راه‌اندازی همه سرویس‌ها
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف سرویس‌ها
docker-compose down
```

### اجرای جداگانه هر سرویس
```bash
# مثال برای User Management Service
cd user-management-service
./gradlew bootRun
```

## پورت‌های استفاده شده

| سرویس | پورت | توضیحات |
|--------|------|----------|
| Discovery Server | 8761 | Eureka Dashboard |
| API Gateway | 8080 | نقطه ورودی اصلی |
| User Management | 8081 | مدیریت کاربران |
| Form Management | 8082 | مدیریت فرم‌ها |
| Group Management | 8083 | مدیریت گروه‌ها |
| Form Submission | 8084 | ارسال فرم‌ها |
| Reports | 8085 | گزارش‌گیری |
| PostgreSQL | 5432 | دیتابیس |
| Frontend | 5173 | رابط کاربری |

## دیتابیس

هر میکروسرویس schema مخصوص خود را در PostgreSQL دارد:

- `user_management`: جداول مربوط به کاربران
- `form_management`: جداول مربوط به فرم‌ها
- `group_management`: جداول مربوط به گروه‌ها
- `form_submission`: جداول مربوط به ارسال‌ها
- `reports`: جداول مربوط به گزارش‌ها

## API Endpoints

### User Management
```
POST   /api/users/register
POST   /api/users/login
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

### Form Management
```
POST   /api/forms
GET    /api/forms
GET    /api/forms/{id}
PUT    /api/forms/{id}
DELETE /api/forms/{id}
```

### Group Management
```
POST   /api/groups
GET    /api/groups
PUT    /api/groups/{id}
POST   /api/groups/members
DELETE /api/groups/members
```

### Form Submission
```
POST   /api/submissions
GET    /api/submissions/user/{id}
PUT    /api/submissions/{id}
POST   /api/assignments
```

### Reports
```
GET    /api/reports/stats
GET    /api/reports/forms/{id}
GET    /api/reports/users
```

## مانیتورینگ

### Health Checks
هر سرویس endpoint های زیر را ارائه می‌دهد:
```
GET /actuator/health
GET /actuator/info
GET /actuator/metrics
```

### Eureka Dashboard
- آدرس: http://localhost:8761
- مشاهده سرویس‌های ثبت شده
- وضعیت سلامت سرویس‌ها

## توسعه

### اضافه کردن سرویس جدید
1. ایجاد دایرکتوری جدید
2. کپی کردن `build.gradle.kts` و تغییر نام
3. ایجاد مدل‌ها، DTOها، سرویس‌ها و کنترلرها
4. اضافه کردن به `docker-compose.yml`
5. اضافه کردن مسیر در API Gateway

### تغییر پورت
1. تغییر در `application.yml` سرویس
2. تغییر در `docker-compose.yml`
3. تغییر در API Gateway routes

## عیب‌یابی

### مشکلات رایج
1. **سرویس ثبت نمی‌شود**: بررسی اتصال به Eureka
2. **خطای CORS**: بررسی تنظیمات در کنترلرها
3. **خطای دیتابیس**: بررسی اتصال و schema ها
4. **سرویس در دسترس نیست**: بررسی health check

### لاگ‌ها
```bash
# مشاهده لاگ سرویس خاص
docker-compose logs -f user-management-service

# مشاهده لاگ همه سرویس‌ها
docker-compose logs -f
```

## امنیت

- JWT tokens برای احراز هویت
- Password encryption با BCrypt
- Role-based access control
- CORS configuration
- Rate limiting در API Gateway

## تست

### Unit Tests
```bash
cd user-management-service
./gradlew test
```

### Integration Tests
```bash
cd user-management-service
./gradlew integrationTest
```

### End-to-End Tests
```bash
# تست API Gateway
curl http://localhost:8080/api/users/health

# تست مستقیم سرویس
curl http://localhost:8081/api/users/health
```

## مقیاس‌گذاری

### Horizontal Scaling
```bash
# مقیاس‌گذاری سرویس خاص
docker-compose up -d --scale user-management-service=3
```

### Load Balancing
- Eureka به صورت خودکار Load Balancing انجام می‌دهد
- API Gateway درخواست‌ها را توزیع می‌کند

## پشتیبانی

برای سوالات و مشکلات:
1. بررسی لاگ‌ها
2. بررسی health checks
3. بررسی اتصال دیتابیس
4. بررسی تنظیمات Eureka

## منابع مفید

- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Netflix Eureka](https://github.com/Netflix/eureka)
- [Microservices Architecture](https://microservices.io/)
