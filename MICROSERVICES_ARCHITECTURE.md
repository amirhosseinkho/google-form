# معماری میکروسرویس سیستم مدیریت فرم‌ها

## فهرست مطالب
- [معرفی معماری میکروسرویس](#معرفی-معماری-میکروسرویس)
- [ساختار کلی سیستم](#ساختار-کلی-سیستم)
- [جزئیات هر میکروسرویس](#جزئیات-هر-میکروسرویس)
- [مزایای معماری میکروسرویس](#مزایای-معماری-میکروسرویس)
- [چالش‌ها و راه‌حل‌ها](#چالش‌ها-و-راه‌حل‌ها)
- [راه‌اندازی و اجرا](#راه‌اندازی-و-اجرا)
- [نظارت و مانیتورینگ](#نظارت-و-مانیتورینگ)
- [مقیاس‌پذیری](#مقیاس‌پذیری)
- [امنیت](#امنیت)
- [تست و کیفیت](#تست-و-کیفیت)

## معرفی معماری میکروسرویس

این پروژه از معماری میکروسرویس استفاده می‌کند که در آن سیستم به چندین سرویس مستقل و کوچک تقسیم شده است. هر سرویس مسئولیت خاصی دارد و می‌تواند مستقل از سایر سرویس‌ها توسعه، استقرار و مقیاس‌گذاری شود.

### ویژگی‌های کلیدی معماری میکروسرویس:

1. **جداسازی مسئولیت‌ها**: هر سرویس مسئولیت خاصی دارد
2. **استقلال در توسعه**: تیم‌ها می‌توانند مستقل کار کنند
3. **مقیاس‌پذیری**: هر سرویس می‌تواند جداگانه مقیاس‌گذاری شود
4. **قابلیت نگهداری**: کد کوچک‌تر و قابل فهم‌تر
5. **انعطاف‌پذیری**: امکان استفاده از تکنولوژی‌های مختلف
6. **قابلیت اطمینان**: خرابی یک سرویس کل سیستم را تحت تأثیر قرار نمی‌دهد

## ساختار کلی سیستم

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│                         Port: 5173                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    API Gateway                                  │
│                     Port: 8080                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────┐ ┌─────▼─────┐
│   Eureka     │ │  User   │ │   Form    │
│ Discovery    │ │Management│ │Management │
│   Server     │ │ Service │ │ Service   │
│ Port: 8761   │ │Port:8081│ │Port: 8082 │
└──────────────┘ └─────────┘ └───────────┘
        │             │             │
        │        ┌────▼────┐ ┌─────▼─────┐
        │        │ Group   │ │   Form    │
        │        │Management│ │Submission │
        │        │ Service │ │ Service   │
        │        │Port:8083│ │Port: 8084 │
        │        └─────────┘ └───────────┘
        │             │             │
        │        ┌────▼────┐ ┌─────▼─────┐
        │        │Reports  │ │PostgreSQL │
        │        │Service  │ │ Database  │
        │        │Port:8085│ │Port: 5432 │
        │        └─────────┘ └───────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
              ┌───────▼───────┐
              │   Shared      │
              │   Network     │
              └───────────────┘
```

## جزئیات هر میکروسرویس

### 1. Eureka Discovery Server (Port: 8761)

**وظیفه**: مدیریت ثبت و کشف سرویس‌ها

**ویژگی‌ها**:
- ثبت خودکار سرویس‌ها
- کشف سرویس‌ها
- مانیتورینگ سلامت سرویس‌ها
- Load balancing

**تکنولوژی**: Spring Cloud Netflix Eureka

**پیکربندی**:
```yaml
eureka:
  server:
    enable-self-preservation: false
    eviction-interval-timer-in-ms: 1000
```

### 2. API Gateway (Port: 8080)

**وظیفه**: نقطه ورودی واحد برای تمام درخواست‌ها

**ویژگی‌ها**:
- مسیریابی درخواست‌ها
- Load balancing
- Cross-cutting concerns
- Rate limiting
- Authentication/Authorization

**تکنولوژی**: Spring Cloud Gateway

**مسیرهای تعریف شده**:
```yaml
routes:
  - id: user-management-service
    uri: lb://user-management-service
    predicates:
      - Path=/api/users/**
  
  - id: form-management-service
    uri: lb://form-management-service
    predicates:
      - Path=/api/forms/**
```

### 3. User Management Service (Port: 8081)

**وظیفه**: مدیریت کاربران، احراز هویت و مجوزها

**ویژگی‌ها**:
- ثبت‌نام و ورود کاربران
- مدیریت پروفایل
- مدیریت نقش‌ها
- JWT token management
- Password encryption

**API Endpoints**:
```
POST   /api/users/register          # ثبت‌نام
POST   /api/users/login             # ورود
GET    /api/users/{id}              # دریافت پروفایل
PUT    /api/users/{id}              # ویرایش پروفایل
POST   /api/users/{id}/change-password # تغییر پسورد
DELETE /api/users/{id}              # غیرفعال کردن کاربر
```

**مدل داده**:
```kotlin
@Entity
@Table(name = "users", schema = "user_management")
data class User(
    val id: Long? = null,
    val username: String,
    val email: String,
    val password: String,
    val name: String,
    val role: UserRole,
    val isActive: Boolean
)
```

### 4. Form Management Service (Port: 8082)

**وظیفه**: مدیریت فرم‌ها و فیلدهای آن‌ها

**ویژگی‌ها**:
- ایجاد و ویرایش فرم‌ها
- مدیریت فیلدهای مختلف
- قالب‌های فرم
- جستجو و فیلتر

**API Endpoints**:
```
POST   /api/forms                   # ایجاد فرم
GET    /api/forms                   # لیست فرم‌ها
GET    /api/forms/{id}              # دریافت فرم
PUT    /api/forms/{id}              # ویرایش فرم
DELETE /api/forms/{id}              # حذف فرم
GET    /api/forms/templates         # قالب‌های فرم
GET    /api/forms/search            # جستجو
```

**مدل داده**:
```kotlin
@Entity
@Table(name = "forms", schema = "form_management")
data class Form(
    val id: Long? = null,
    val name: String,
    val description: String?,
    val fields: String, // JSON
    val createdBy: String,
    val isTemplate: Boolean
)
```

### 5. Group Management Service (Port: 8083)

**وظیفه**: مدیریت گروه‌ها و اعضای آن‌ها

**ویژگی‌ها**:
- ایجاد و مدیریت گروه‌ها
- اضافه/حذف اعضا
- مدیریت نقش‌های گروه
- محدودیت تعداد اعضا

**API Endpoints**:
```
POST   /api/groups                  # ایجاد گروه
GET    /api/groups                  # لیست گروه‌ها
PUT    /api/groups/{id}             # ویرایش گروه
POST   /api/groups/members          # اضافه کردن عضو
DELETE /api/groups/members          # حذف عضو
GET    /api/groups/{id}/members     # اعضای گروه
```

**مدل داده**:
```kotlin
@Entity
@Table(name = "groups", schema = "group_management")
data class Group(
    val id: Long? = null,
    val name: String,
    val description: String?,
    val createdBy: String,
    val maxMembers: Int?
)
```

### 6. Form Submission Service (Port: 8084)

**وظیفه**: مدیریت ارسال فرم‌ها و تخصیص آن‌ها

**ویژگی‌ها**:
- ارسال فرم‌ها
- ذخیره پاسخ‌ها
- تخصیص فرم‌ها به گروه‌ها
- مدیریت پیش‌نویس‌ها

**API Endpoints**:
```
POST   /api/submissions             # ارسال فرم
GET    /api/submissions/user/{id}   # ارسال‌های کاربر
PUT    /api/submissions/{id}        # ویرایش ارسال
POST   /api/assignments             # تخصیص فرم
GET    /api/assignments/form/{id}   # تخصیص‌های فرم
```

**مدل داده**:
```kotlin
@Entity
@Table(name = "form_submissions", schema = "form_submission")
data class FormSubmission(
    val id: Long? = null,
    val formId: Long,
    val userId: Long,
    val answers: String, // JSON
    val isDraft: Boolean
)
```

### 7. Reports Service (Port: 8085)

**وظیفه**: تولید گزارش‌ها و آمار

**ویژگی‌ها**:
- آمار کلی سیستم
- تحلیل فرم‌ها
- گزارش‌های کاربران
- نمودارها و گراف‌ها

**API Endpoints**:
```
GET    /api/reports/stats           # آمار کلی
GET    /api/reports/forms/{id}      # تحلیل فرم
GET    /api/reports/users           # گزارش کاربران
GET    /api/reports/activity        # فعالیت‌های اخیر
```

## مزایای معماری میکروسرویس

### 1. **مقیاس‌پذیری**
- هر سرویس می‌تواند جداگانه مقیاس‌گذاری شود
- امکان استفاده از Auto-scaling
- بهینه‌سازی منابع بر اساس نیاز

### 2. **قابلیت نگهداری**
- کد کوچک‌تر و قابل فهم‌تر
- جداسازی مسئولیت‌ها
- امکان تغییر تکنولوژی در هر سرویس

### 3. **انعطاف‌پذیری در توسعه**
- تیم‌ها می‌توانند مستقل کار کنند
- امکان استفاده از زبان‌های مختلف
- سرعت توسعه بالاتر

### 4. **قابلیت اطمینان**
- خرابی یک سرویس کل سیستم را تحت تأثیر قرار نمی‌دهد
- امکان Retry و Circuit Breaker
- Redundancy و Failover

### 5. **قابلیت استقرار**
- امکان استقرار مستقل هر سرویس
- Rollback آسان
- A/B Testing

## چالش‌ها و راه‌حل‌ها

### 1. **پیچیدگی شبکه**
**چالش**: ارتباط بین سرویس‌ها پیچیده است
**راه‌حل**: 
- استفاده از Service Discovery (Eureka)
- API Gateway برای مدیریت درخواست‌ها
- Circuit Breaker برای مدیریت خطاها

### 2. **مدیریت داده**
**چالش**: توزیع داده بین سرویس‌ها
**راه‌حل**:
- Database per Service pattern
- Event-driven architecture
- Saga pattern برای تراکنش‌های پیچیده

### 3. **مانیتورینگ و Debugging**
**چالش**: پیگیری درخواست‌ها در سرویس‌های مختلف
**راه‌حل**:
- Distributed tracing (Zipkin)
- Centralized logging (ELK Stack)
- Health checks و metrics

### 4. **امنیت**
**چالش**: مدیریت امنیت در سرویس‌های مختلف
**راه‌حل**:
- JWT tokens
- API Gateway برای authentication
- Rate limiting و CORS

## راه‌اندازی و اجرا

### 1. **پیش‌نیازها**
```bash
# Java 17
java -version

# Docker & Docker Compose
docker --version
docker-compose --version

# Node.js 18+
node --version
```

### 2. **ساخت پروژه‌ها**
```bash
# ساخت همه میکروسرویس‌ها
cd microservices
./build-all.sh

# یا ساخت جداگانه
cd user-management-service
./gradlew build

cd form-management-service
./gradlew build
```

### 3. **اجرای با Docker Compose**
```bash
# راه‌اندازی همه سرویس‌ها
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف سرویس‌ها
docker-compose down
```

### 4. **تست سرویس‌ها**
```bash
# تست Eureka Server
curl http://localhost:8761

# تست API Gateway
curl http://localhost:8080/actuator/health

# تست User Service
curl http://localhost:8081/api/users/health
```

## نظارت و مانیتورینگ

### 1. **Health Checks**
هر سرویس endpoint های زیر را ارائه می‌دهد:
```
GET /actuator/health      # وضعیت سلامت
GET /actuator/info        # اطلاعات سرویس
GET /actuator/metrics     # متریک‌ها
```

### 2. **Eureka Dashboard**
- آدرس: http://localhost:8761
- مشاهده سرویس‌های ثبت شده
- وضعیت سلامت سرویس‌ها
- اطلاعات instance ها

### 3. **API Gateway Monitoring**
```
GET /actuator/gateway/routes    # مسیرهای تعریف شده
GET /actuator/gateway/globalfilters # فیلترهای اعمال شده
```

### 4. **Database Monitoring**
```sql
-- مشاهده جداول و schemas
SELECT schema_name FROM information_schema.schemata;

-- مشاهده جداول هر schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'user_management';
```

## مقیاس‌پذیری

### 1. **Horizontal Scaling**
```bash
# مقیاس‌گذاری سرویس خاص
docker-compose up -d --scale user-management-service=3

# Load balancing خودکار توسط Eureka
```

### 2. **Auto-scaling**
```yaml
# در Kubernetes
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-management-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 3. **Database Scaling**
- Read Replicas برای گزارش‌گیری
- Sharding بر اساس کاربر یا فرم
- Caching با Redis

## امنیت

### 1. **Authentication**
```kotlin
// JWT Token Generation
@Service
class JwtService {
    fun generateToken(username: String): String {
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(Date())
            .setExpiration(Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact()
    }
}
```

### 2. **Authorization**
```kotlin
// Role-based access control
@PreAuthorize("hasRole('ADMIN')")
fun deleteUser(id: Long) {
    // Only admins can delete users
}
```

### 3. **API Security**
```yaml
# Rate limiting در API Gateway
spring:
  cloud:
    gateway:
      default-filters:
        - name: RequestRateLimiter
          args:
            redis-rate-limiter.replenishRate: 10
            redis-rate-limiter.burstCapacity: 20
```

### 4. **Data Encryption**
```kotlin
// Password encryption
@Service
class UserService {
    fun registerUser(dto: UserRegistrationDTO): UserResponseDTO {
        val user = User(
            password = passwordEncoder.encode(dto.password)
        )
        return userRepository.save(user)
    }
}
```

## تست و کیفیت

### 1. **Unit Testing**
```kotlin
@Test
fun `should create user successfully`() {
    // Given
    val dto = UserRegistrationDTO("test", "test@test.com", "password", "Test User")
    
    // When
    val result = userService.registerUser(dto)
    
    // Then
    assertThat(result.username).isEqualTo("test")
    assertThat(result.email).isEqualTo("test@test.com")
}
```

### 2. **Integration Testing**
```kotlin
@SpringBootTest
@AutoConfigureTestDatabase
class UserServiceIntegrationTest {
    @Test
    fun `should save and retrieve user from database`() {
        // Test database integration
    }
}
```

### 3. **Contract Testing**
```kotlin
// Pact contract testing
@Pact(consumer = "user-service")
fun createUserPact(builder: PactDslWithProvider): RequestResponsePact {
    return builder
        .given("user exists")
        .uponReceiving("a request for user")
        .path("/api/users/1")
        .method("GET")
        .willRespondWith()
        .status(200)
        .body("""{"id":1,"username":"test"}""")
        .toPact()
}
```

### 4. **Performance Testing**
```bash
# Load testing با Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/users

# یا با JMeter
jmeter -n -t test-plan.jmx -l results.jtl
```

## نتیجه‌گیری

معماری میکروسرویس این پروژه مزایای قابل توجهی را ارائه می‌دهد:

### **نقاط قوت**:
1. **مقیاس‌پذیری بالا**: امکان مقیاس‌گذاری مستقل هر سرویس
2. **قابلیت نگهداری**: کد کوچک‌تر و قابل فهم‌تر
3. **انعطاف‌پذیری**: امکان استفاده از تکنولوژی‌های مختلف
4. **قابلیت اطمینان**: خرابی یک سرویس کل سیستم را تحت تأثیر قرار نمی‌دهد
5. **سرعت توسعه**: امکان توسعه موازی توسط تیم‌های مختلف

### **نکات مهم**:
1. **Service Discovery**: استفاده از Eureka برای مدیریت سرویس‌ها
2. **API Gateway**: نقطه ورودی واحد با قابلیت‌های پیشرفته
3. **Database per Service**: هر سرویس schema مخصوص خود را دارد
4. **Monitoring**: نظارت کامل بر سلامت و عملکرد سرویس‌ها
5. **Security**: امنیت چندلایه با JWT و Role-based access control

### **توصیه‌ها برای توسعه آینده**:
1. **Event-driven Architecture**: استفاده از Apache Kafka برای ارتباط بین سرویس‌ها
2. **Distributed Tracing**: پیاده‌سازی Zipkin برای ردیابی درخواست‌ها
3. **Centralized Logging**: استفاده از ELK Stack برای مدیریت لاگ‌ها
4. **Container Orchestration**: استفاده از Kubernetes برای مدیریت بهتر
5. **CI/CD Pipeline**: اتوماسیون کامل فرآیند توسعه و استقرار

این معماری پایه‌ای قوی برای توسعه و مقیاس‌گذاری سیستم در آینده فراهم می‌کند.
