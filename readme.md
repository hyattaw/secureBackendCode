# Drewhyatt API

A modern, secure, fully‑containerized authentication and user‑management backend built with Node.js, Express, PostgreSQL, Argon2, JWT cookies, and MailHog. Includes a complete end‑to‑end automated test harness that validates the entire user lifecycle.

---

## 🚀 Features

### Authentication & Security
- Email + password signup  
- Email verification via token  
- Secure Argon2 password hashing  
- JWT access tokens (HTTP‑only cookies)  
- Refresh tokens with rotation  
- Protected routes  
- Password change  
- Logout  
- Account deletion  
- Full session invalidation  

### Infrastructure
- Dockerized API + PostgreSQL + MailHog  
- Automatic schema initialization  
- Environment‑based configuration  
- Clean separation of routes, middleware, and utilities  

### Developer Experience
- Local email testing via MailHog  
- PowerShell test harness for full auth lifecycle  
- Clear logging and error handling  
- Easy to extend with new routes or services  

---

## 🧱 Architecture Overview
<pre>
    /api
        docker-compose.yaml
        Dockerfile
        .env
        .npmrc
        package.json
        pnpm-policy.json
        pnpm-workspace.yaml
        /src
            authMiddleware.js
            authRoutes.js
            changePasswordRoute.js
            db.js
            deleteAccountRoute.js
            email.js
            index.js
            initDb.js
            loginRoute.js
            logoutRoute.js
            protectedRoutes.js
            refreshRoute.js
            requestPasswordResetRoute.js
            resetPasswordRoute.js
            test-auth.ps1
            verifyEmailRoute.js
        /db
            schema.sql
</pre>

### API
Express-based service exposing `/auth/*` routes.

### Database
PostgreSQL with the following core tables:

- `users`
- `refresh_tokens`
- `password_resets` (optional)
- `email_verification_token` stored per user

### Email
MailHog handles all outbound email during development:

- Verification emails  
- Password change notifications  

MailHog UI:
    http://localhost:8025

---

## 🐳 Running the Project (Docker)

From the project root:
    docker compose up --build

Services:
<pre>
    | Service        | Port | Description        |
    |----------------|------|--------------------|
    | API            | 4000 | Auth backend       |
    | PostgreSQL     | 5432 | Database           |
    | MailHog UI     | 8025 | Email viewer       |
    | MailHog SMTP   | 1025 | SMTP server        |
</pre>
---

## 🔐 Auth Endpoints

### POST /auth/signup
Creates a new user and sends a verification email.

### GET /auth/verify?token=...
Verifies email ownership.

### POST /auth/login
Authenticates user and sets cookies.

### GET /auth/me
Returns authenticated user info.

### POST /auth/refresh
Rotates refresh token and issues new access token.

### POST /auth/change-password
Requires authentication. Updates password and sends confirmation email.

### POST /auth/logout
Clears auth cookies.

### DELETE /auth/delete
Deletes user account and invalidates tokens.

---

## 🧪 Automated Test Script

The project includes a full end‑to‑end test harness:
    /api/src/test-auth.ps1


It validates:

1. Signup  
2. Email verification  
3. Login  
4. Protected route access  
5. Refresh token  
6. Password change  
7. Logout  
8. Login with new password  
9. Account deletion  
10. Confirm deletion  

Run it with:
    pwsh ./api/src/test-auth.ps1


---

## 📧 Email Delivery (MailHog)

All emails are routed to MailHog during development.

SMTP configuration:
    SMTP_HOST=mailhog
    SMTP_PORT=1025
    SMTP_SECURE=false
    SMTP_USER=
    SMTP_PASS=

View emails at:
    http://localhost:8025

---

## 🔧 Environment Variables

    Create `api/.env`:

    JWT_SECRET=your-secret
    DATABASE_URL=postgresql://drewhyatt:localdev@db:5432/drewhyatt

    SMTP_HOST=mailhog
    SMTP_PORT=1025
    SMTP_SECURE=false
    SMTP_USER=
    SMTP_PASS=

---

## 🛠️ Development Commands

### Install dependencies
    npm install


### Run API locally (non‑Docker)
    npm run dev

### Run tests
    pwsh ./src/test-auth.ps1

---

## 📌 Roadmap

- Password reset flow  
- Email templates (MJML)  
- Admin dashboard  
- OAuth login (Google, GitHub, Microsoft)  
- Rate limiting  
- Jest + Supertest integration tests  

---

## 📄 License
MIT License — free to use, modify, and distribute.
