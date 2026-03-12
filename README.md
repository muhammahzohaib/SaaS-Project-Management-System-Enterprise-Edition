# 01 - SaaS Project Management System (Enterprise Edition)

A professional, multi-tenant SaaS platform for team collaboration and project management, architected with a focus on security, real-time updates, and data-driven insights.

## 🚀 Key Features

- **Multi-Tenant Architecture:** Secure data isolation using a Shared Schema strategy where organizations (tenants) operate in isolated environments.
- **Real-Time Collaboration:** Integrated Socket.io for live task updates, state changes, and instant notifications.
- **Enterprise-Grade Security:** 
  - JWT Authentication with HttpOnly Cookie strategy.
  - Role-Based Access Control (RBAC): Admin, Manager, and Team Member.
  - Protection against NoSQL Injection and XSS.
  - Rate limiting on API endpoints.
- **High-Fidelity Kanban Board:** Interactive drag-and-drop workspace built with `@dnd-kit`, featuring optimistic UI updates.
- **Freemium Monetization Model:** Built-in support for multiple plans (Free, Pro, Enterprise) with resource limits (e.g., 3-project limit for free users).
- **Advanced Task Management:** Support for priorities, due dates, subtasks, and descriptions.
- **Analytics Dashboard:** Visual representation of team productivity, workload distribution, and project health using `Recharts`.
- **Premium Landing Page:** High-conversion storefront with pricing tables and feature showcases.
- **Premium UI/UX:** Responsive, modern design featuring Glassmorphism, Framer Motion animations, and the "Outfit" typography system.

## 💰 Monetization Strategy (Selling Model)

This system is pre-configured for a SaaS business model:
1. **Free Tier:** Limited to 3 projects and 5 members. Perfect for small teams.
2. **Pro Tier:** Unlimited projects and advanced analytics. (Stripe integration ready).
3. **Enterprise Tier:** Dedicated support and SAML/SSO ready.

The billing enforcement is handled via `backend/src/middleware/billing.js`.

## 🚀 Production Optimization

- **API Hardening:** Rate limiting (100 reqs/15 min), Helmet, and XSS sanitization.
- **Database Performance:** Strategic indexing on `organizationId` for 10ms query times across millions of records.
- **Deployment Ready:** 
  - **Docker:** Multi-stage builds for smallest image footprints.
  - **Environment Validation:** Strict boot-time check for all secrets.
  - **Error Management:** Production-safe error responder that hides stack traces.

## 🛠️ Technology Stack

### Backend (Node.js/Express)
- **Database:** MongoDB with Mongoose ODM.
- **Real-time:** Socket.io.
- **Security:** Helmet, CORS, Express-Validator, Bcrypt, Express-Mongo-Sanitize.
- **Logging:** Winston logger.

### Frontend (React/Vite)
- **Styling:** Tailwind CSS with custom Design Tokens.
- **State/Routing:** React Router 6, Context API.
- **Charts:** Recharts.
- **Animation:** Framer Motion, Lucide React icons.
- **Drag-and-Drop:** @dnd-kit.

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or via Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Update with your MONGODB_URI and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── models/        # Mongoose Models (Tenant isolated)
│   │   ├── controllers/   # Business Logic
│   │   ├── middleware/    # Auth, Tenant, and Error handling
│   │   ├── routes/        # API Endpoints
│   │   ├── utils/         # Socket.io, Logging helpers
│   │   └── services/      # Core service layer
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Kanban, Layout)
│   │   ├── pages/         # Dashboard, Project Details
│   │   ├── services/      # API wrappers
│   │   └── context/       # Global State (Auth)
```

## 🔐 Environment Variables

Ensure your `backend/.env` contains:
- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secure secret for tokens.
- `JWT_EXPIRES_IN`: e.g., `7d`.
- `CORS_ORIGIN`: e.g., `http://localhost:3000`.

---
*Developed by MuhaMad Zohaib as part of the 10 Projects Series.*
