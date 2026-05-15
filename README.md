<<<<<<< HEAD
# Gullak
=======
# FinTrack - Enterprise Expense Management Platform

FinTrack is a production-quality, full-stack expense management platform designed for enterprise-grade financial tracking. It features a modern SaaS dashboard, AI-driven insights, secure JWT authentication, and comprehensive reporting.

## 🚀 Key Features

- **Executive Dashboard**: Real-time analytics with interactive charts (Recharts).
- **AI Financial Insights**: Automatic generation of spending patterns and savings targets.
- **Transaction Management**: Full CRUD for income and expenses with advanced filtering.
- **Budget Intelligence**: Category-based monthly budgets with visual alert thresholds.
- **Automated Reports**: Exportable CSV audits and monthly performance breakdowns.
- **Premium Interface**: Responsive design with Dark/Light mode, Framer Motion animations, and custom Tailwind UI components.
- **Enterprise Security**: JWT-based auth, password hashing (bcrypt), and secure API middleware.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Axios, Recharts, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Auth**: JWT, bcryptjs, express-rate-limit, Helmet.
- **Storage**: Multer for profile avatar management.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Update MONGO_URI and JWT_SECRET
npm run seed        # Seed with realistic demo data
npm run dev         # Start API server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Start React app (Vite)
```

## 👤 Demo Credentials
- **Email**: `demo@fintrack.com`
- **Password**: `demo123456`

## 📂 Project Structure
```text
├── backend/
│   ├── config/      # DB connection
│   ├── controllers/ # API Logic
│   ├── models/      # Mongoose Schemas
│   ├── routes/      # API Endpoints
│   ├── middleware/  # Auth & Error handling
│   └── seeds/       # Demo data scripts
└── frontend/
    ├── src/
    │   ├── components/ # UI, Layout, Pages
    │   ├── context/    # State management
    │   ├── services/   # API communication
    │   └── assets/     # Styles & Images
```

---
Built with excellence for high-performance finance management.
>>>>>>> 574ed59 (Initial commit: FinTrack Enterprise Expense Management Platform)
