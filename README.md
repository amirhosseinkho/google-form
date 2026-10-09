> Persian version: [README.fa.md](README.fa.md)

# Form management system

## Contents

- [Introduction](#introduction)
- [System architecture](#system-architecture)
- [Technologies](#technologies)
- [Project structure](#project-structure)
- [Back end](#back-end)
- [Front end](#front-end)
- [Database](#database)
- [Implemented features](#implemented-features)
- [Running the project](#running-the-project)
- [API endpoints](#api-endpoints)
- [Problems and solutions](#problems-and-solutions)

## Introduction

This project is a complete form management system for creating, editing, distributing and collecting forms. It includes user management, groups and reporting.

### Main features

- User management (sign-up, login, profile)
- Creating and editing forms with different field types
- Managing groups and their members
- Distributing forms to groups
- Filling in forms
- Viewing and managing submissions
- Editing submitted responses
- Viewing the submissions of each form
- Reports and statistics
- A dashboard with live data
- Security and user permissions

## System architecture

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

## Technologies

### Back end

- **Kotlin**: main programming language
- **Spring Boot 3.4.2**: main framework
- **Spring Data JPA**: database access
- **Spring Security**: security and authentication
- **PostgreSQL**: main database
- **Jackson**: JSON serialization/deserialization
- **Gradle**: dependency management

### Front end

- **React 18**: main framework
- **TypeScript**: programming language
- **Ant Design**: UI library
- **React Router**: routing
- **Vite**: build tool
- **Tailwind CSS**: styling
- **React Beautiful DnD**: drag and drop

### Database

- **PostgreSQL**: relational database
- **Docker**: containerization

## Project structure

```
google-form/
├── backend/                    # back end
│   ├── src/main/kotlin/
│   │   └── org/example/backend/
│   │       ├── api/            # API interfaces
│   │       ├── configs/        # configuration
│   │       ├── controller/     # controllers
│   │       ├── model/          # models
│   │       │   ├── database/   # database models
│   │       │   └── dto/        # data transfer objects
│   │       ├── repository/     # repositories
│   │       └── service/        # services
│   ├── build.gradle.kts        # Gradle configuration
│   └── Dockerfile              # back-end Dockerfile
├── frontend/                   # front end
│   ├── src/
│   │   ├── components/         # components
│   │   ├── pages/              # pages
│   │   ├── layouts/            # layouts
│   │   ├── routes/             # routing
│   │   └── api/                # API calls
│   ├── package.json            # npm dependencies
│   └── Dockerfile              # front-end Dockerfile
├── database/                   # database
│   ├── Dockerfile
│   └── init.sql/               # initialization scripts
└── docker-compose.yml          # Docker Compose configuration
```

## Back end

### Back-end code structure

#### 1. Database models (`model/database/`)

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

#### 2. DTOs (`model/dto/`)

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

#### 3. Controllers (`controller/`)

**FormController.kt**
- `GET /api/forms`: get all forms
- `GET /api/forms/{id}`: get one form
- `POST /api/forms`: create a form
- `PUT /api/forms/{id}`: edit a form
- `DELETE /api/forms/{id}`: delete a form

**UserManagementController.kt**
- `POST /api/user-managements/sign-up`: sign up
- `POST /api/user-managements/login`: log in
- `GET /api/user-managements/{id}`: get a profile
- `PUT /api/user-managements/{id}`: edit a profile

**GroupController.kt**
- `GET /api/groups`: get all groups
- `POST /api/groups`: create a group
- `PUT /api/groups/{id}`: edit a group
- `DELETE /api/groups/{id}`: delete a group

#### 4. Services (`service/`)

**UserManagementService.kt**
- user management
- password hashing
- data validation

**FormSubmissionService.kt**
- managing form submissions
- storing answers
- retrieving submissions

**ReportsService.kt**
- system statistics
- form analytics
- reports

#### 5. Repositories (`repository/`)

**UserRepository.kt**
```kotlin
@Repository
interface UserRepository : JpaRepository<UserModel, Long> {
    fun findByUsername(username: String): UserModel?
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
}
```

### Security configuration

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

## Front end

### Front-end code structure

#### 1. Main pages (`pages/`)

**LoginPage.tsx**
- user login form
- input validation
- stores the token in `localStorage`

**RegisterPage.tsx**
- sign-up form for new users
- email and password validation
- error messages

**Dashboard.tsx**
- the main dashboard
- system statistics
- recent activity

**FormBuilderPage.tsx**
- creating and editing forms
- adding different field types
- form preview

**FormsPage.tsx**
- list of all forms
- edit and delete actions
- delete confirmation

#### 2. Layouts (`layouts/`)

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
- the main menu
- navigation links
- user information

#### 3. Components (`components/`)

**ChartReport.tsx**
- report charts
- bar and pie charts
- real data from the API

#### 4. Routing (`routes/`)

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
      // ... other routes
    ]
  },
  {
    path: "/login",
    element: <PublicLayout><LoginPage /></PublicLayout>
  }
]);
```

### UI/UX

1. **Responsive design**
   - works on mobile and desktop
   - built with Tailwind CSS

2. **User experience**
   - success and error messages
   - loading states
   - confirmation for sensitive actions

3. **Validation**
   - form validation
   - clear error messages
   - field preview

## Database

### Main tables

#### 1. users
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

#### 2. forms
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

#### 3. groups
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

#### 4. group_members
```sql
CREATE TABLE group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id),
    user_id BIGINT REFERENCES users(id),
    joined_at VARCHAR(255) NOT NULL
);
```

#### 5. form_assignments
```sql
CREATE TABLE form_assignments (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT REFERENCES forms(id),
    group_id BIGINT REFERENCES groups(id),
    assigned_by VARCHAR(255) NOT NULL,
    assigned_at VARCHAR(255) NOT NULL
);
```

#### 6. form_submissions
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

### Relationships

```
users (1) ──── (N) group_members (N) ──── (1) groups
users (1) ──── (N) form_submissions (N) ──── (1) forms
groups (1) ──── (N) form_assignments (N) ──── (1) forms
```

## Implemented features

### 1. User management

- **Sign-up**: registering new users with validation
- **Login**: user authentication
- **Profile**: viewing and editing personal information
- **Password change**: users can change their password

### 2. Form management

- **Create**: build new forms with different field types
- **Edit**: change existing forms
- **Delete**: delete forms after confirmation
- **View**: show form details

### 3. Field types

- **Text**: single-line text
- **Textarea**: multi-line text
- **Number**: numeric field
- **Date**: date field
- **Dropdown**: choose from a list
- **Checkbox**: multiple choice
- **Radio**: single choice

### 4. Group management

- **Create** groups
- **Edit** group information
- **Delete** groups
- **Add members** to a group
- **Remove members** from a group

### 5. Distributing forms

- **Assign** forms to groups
- **View assigned forms**: the list of forms a user can fill in
- **Remove assignments**

### 6. Filling in forms

- **View** assigned forms
- **Fill in** answers
- **Submit** the final answers

### 7. Managing submissions

- **View** the user's submissions
- **Details** of submitted answers
- **Delete** unwanted submissions

### 8. Reports

- **Overall statistics**: number of users, forms and groups
- **Form analytics**: submission and answer statistics
- **Charts**: visual presentation of the data
- **Recent activity**: the latest activity in the system

### 9. Dashboard

- **Live statistics** from the database
- **Recent activity**: the latest changes
- **Quick access** to important links

## Running the project

### Prerequisites

- Java 17
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL

### 1. Start the database

```bash
# Start PostgreSQL with Docker
docker-compose up -d database
```

### 2. Start the back end

```bash
cd backend
./gradlew bootRun
```

### 3. Start the front end

```bash
cd frontend
npm install
npm run dev
```

### 4. Access

- **Front end**: http://localhost:5173
- **Back end**: http://localhost:8080
- **Database**: localhost:5432

## API endpoints

### User management

```
POST   /api/user-managements/sign-up     # sign up
POST   /api/user-managements/login       # log in
GET    /api/user-managements/{id}        # get profile
PUT    /api/user-managements/{id}        # edit profile
```

### Forms

```
GET    /api/forms                        # list forms
GET    /api/forms/{id}                   # get a form
POST   /api/forms                        # create a form
PUT    /api/forms/{id}                   # edit a form
DELETE /api/forms/{id}                   # delete a form
```

### Groups

```
GET    /api/groups                       # list groups
GET    /api/groups/{id}                  # get a group
POST   /api/groups                       # create a group
PUT    /api/groups/{id}                  # edit a group
DELETE /api/groups/{id}                  # delete a group
POST   /api/groups/members               # add a member
```

### Form assignments

```
GET    /api/form-assignments/form/{id}   # assignments of a form
POST   /api/form-assignments             # assign a form
DELETE /api/form-assignments/{id}        # remove an assignment
```

### Form submissions

```
GET    /api/form-submissions/user/{id}   # a user's submissions
POST   /api/form-submissions             # submit a form
DELETE /api/form-submissions/{id}        # delete a submission
```

### Reports

```
GET    /api/reports/stats                # overall statistics
GET    /api/reports/form/{id}/analytics  # form analytics
GET    /api/reports/activity             # recent activity
```

## Problems and solutions

### 1. Form fields were not saved

**Problem**: form fields were not being stored in the database.
**Solution**:
- added an `ObjectMapper` configured for Kotlin
- improved JSON serialization/deserialization
- added debug logging

### 2. Authentication

**Problem**: no JWT support.
**Solution**:
- a simple token stored in `localStorage`
- Spring Security temporarily disabled for development

### 3. CORS

**Problem**: CORS errors in the front end.
**Solution**:
- disabled CORS in `SecurityConfig`
- set the appropriate headers

### 4. Database connection

**Problem**: could not connect to PostgreSQL.
**Solution**:
- used Docker Compose
- set the correct credentials
- created the tables with `init.sql`

### 5. UI/UX

**Problem**: the interface did not work well on mobile.
**Solution**:
- used Tailwind CSS
- responsive design
- better user experience

## Notes

### Security

- passwords are hashed with BCrypt
- inputs are validated in the back end
- API endpoints are protected

### Performance

- JPA for efficient queries
- lazy loading for relationships
- caching where appropriate

### Extensibility

- layered architecture
- separation of responsibilities
- clean, maintainable code

## Conclusion

This project is a complete form management system built with modern technologies. It covers user, form and group management as well as reporting.

### Strengths

- a complete, consistent architecture
- a modern, user-friendly UI
- appropriate security
- extensibility
- complete documentation
