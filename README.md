# FinTrack v2 - AI-Powered Enterprise Expense Management

FinTrack v2 is a production-quality, highly scalable expense management platform. It features Google Gemini GenAI integration, Redis caching, Docker containerization, and a modern SaaS dashboard.

## 🚀 Key Features

- **Google Gemini AI Integration**:
  - **AI Financial Advisor**: Generates personalized insights and spending analysis on the dashboard.
  - **Smart Suggestions**: Autocompletes expense categories and amounts as you type.
  - **Natural Language Chat**: Ask questions like *"How much did I spend on food this month?"* using the floating AI widget.
- **Scalability & Performance**:
  - **Redis Caching**: Heavy dashboard aggregations are cached with TTL invalidation.
  - **Bull Job Queue**: Offloads background AI generation.
  - **Connection Pooling**: Optimized MongoDB driver for high concurrent throughput.
- **Enterprise Dashboard**: Real-time analytics, interactive charts (Recharts), and advanced filtering.
- **Premium UI**: Framer Motion animations, dark mode support, and custom glassmorphism components.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS (v4), Vite, Recharts, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **AI & Cache**: Google Generative AI (Gemini), Redis, Bull
- **Infrastructure**: Docker, Docker Compose, Nginx (Frontend serving)
- **Testing**: Artillery (Load Testing)

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire stack (API, Frontend, MongoDB, Redis) is using Docker Compose.

1. Ensure Docker Desktop is running.
2. Setup environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Add your GEMINI_API_KEY to backend/.env
   ```
3. Build and start all services:
   ```bash
   docker compose up --build -d
   ```
4. Access the app:
   - Frontend: http://localhost:3000
   - API Health: http://localhost:5000/api/health
   - Redis GUI: http://localhost:8081

5. To stop the app:
   ```bash
   docker compose down
   ```

## 💻 Running Locally (Without Docker)

If you prefer to run it locally without Redis/Docker (the app degrades gracefully):

1. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Add your GEMINI_API_KEY
   npm run seed          # Seed demo data
   npm run dev           # Starts on port 5000
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev           # Starts on port 5173
   ```

## 👤 Demo Credentials
- **Email**: `demo@fintrack.com`
- **Password**: `demo123456`

## 📊 Load Testing

You can run the included load test to verify the caching and scalability improvements:

```bash
npm install -g artillery
npx artillery run tests/load-test.yml
```

---
Built with excellence for high-performance finance management.
