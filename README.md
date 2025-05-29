# 🔗 URL Shortener with Full Authentication

A modern URL shortener built with Node.js and Express, featuring full authentication (JWT, OAuth, sessions), secure email verification, password reset functionality, and a clean RESTful API.

## 🚀 Features

- 🔐 **Full Authentication System**
  - Email + Password login
  - OAuth login (Google)
  - JWT-based access & refresh tokens
  - Session management (optional)

- 📧 **Email Functionality**
  - Email verification
  - Password reset via email
  
- 🌐 **URL Shortening**
  - Shortened URLS for easy navigate
  - Redirect to original URL
    
- ⚙️ **Built with**
  - Node.js + Express
  - Drizzle ORM + MySql
  - Argon2 password hashing
  - MJML for email templating
  - OAuth 2.0
  
## 1.🛠️ Installation
npm install

### 2. Clone the Repository
git clone https://github.com/elishabhatti/url-shortener.git

### 3. drizzle studio setup
npm run db:migrate
npm run db:studio

### 4. start app
npm run dev
