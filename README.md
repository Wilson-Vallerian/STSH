# STSH Backend - my-backend

This is the backend server for **STSH (StartShield)**, a secure, token-based platform built using **Node.js**, **Express**, and **MongoDB**. It supports features like authentication with OTP, STSH token transfers, loan management, agriculture request processing, and insurance subscriptions.

---

## 🔧 Tech Stack

- **Node.js + Express** - Backend framework
- **MongoDB + Mongoose** - Database and ODM
- **Joi** - Schema validation
- **bcryptjs** - Password hashing
- **nodemailer** - Email OTP system
- **multer** - File uploads (profile pictures, QR codes)
- **qrcode** - QR code generation
- **node-cron** - Scheduled background jobs
- **helmet, xss-clean, express-mongo-sanitize** - Security middleware
- **express-rate-limit** - Rate limiting for authentication routes

---

## 🚀 Deployment on Render

This project is deployed as a **Web Service** on [Render](https://render.com/).

### 🌐 Render Web Service Settings

| Setting         | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| **Name**        | `my-backend`                                                         |
| **Repository**  | [`STSH`](https://github.com/Wilson-Vallerian/STSH)                  |
| **Build Command** |  npm install && npm install multer && npm install qrcode && npm install node-cron && npm install bcryptjs && npm install nodemailer && npm install helmet && npm install express-rate-limit && npm install express-mongo-sanitize && npm install xss-clean && npm install joi |
| **Start Command** | node server.js|
