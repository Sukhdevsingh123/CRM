# CoachAssist CRM 🚀

CoachAssist CRM is a specialized mini-CRM built for wellness coaches to manage leads, track client activity, and generate AI-powered follow-ups using Google Gemini.

## Features

- **Lead Management**: Complete CRUD operations for prospects with source and tag tracking.
- **AI Intelligence**: Generate personalized WhatsApp messages and call scripts using Gemini AI.
- **Activity Timeline**: High-performance, cursor-paginated timeline of all client interactions.
- **Global Search**: Instantly find leads by name or phone number.
- **Dashboard Analytics**: Real-time business metrics and activity visualizations.
- **Caching & Rate Limiting**: Redis-powered caching for analytics and rate limiting for AI calls.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (Turbopack), Tailwind CSS, Headless UI, Heroicons.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Atlas) with Mongoose.
- **Caching**: Redis (Cloud).
- **AI**: Google Gemini Pro (Generative AI).

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Redis Cloud Account
- Google AI Studio (Gemini) API Key

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Installation & Running

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🏗 Architecture & Caching

### MongoDB Collections & Indexes

- **Users**: Authentication and profile data.
- **Leads**: core client info.
    - `assignedTo`, `status`, `nextFollowUpAt` (Compound indexes for fast dashboard filtering).
    - `name`, `phone` (Text indexes for global search).
- **Activities**: Timeline events.
    - `lead`, `createdAt` (Compound index for cursor-based pagination).

### Caching Strategy
- **Dashboard Analytics**: Metadata is cached in Redis for **60 seconds** to reduce heavy MongoDB aggregation load during frequent navigation.
- **Activity Timeline**: Designed for high write/read frequency with efficient MongoDB indexing.

### Rate Limiting
- **AI Calls**: Restricted via custom Redis middleware to prevent API abuse and manage costs.

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register`: Create a new coach account.
- `POST /api/auth/login`: Get JWT token.

### Leads
- `GET /api/leads`: List leads with filters (status, tags, search).
- `POST /api/leads`: Create a new lead.
- `PATCH /api/leads/:id`: Update lead details or status.
- `DELETE /api/leads/:id`: Remove lead and its history.

### Dashboard & Activity
- `GET /api/dashboard`: Get analytics (cached).
- `GET /api/activities/:id/timeline`: Get lead activity history (cursor-based).
- `POST /api/activities/:id/activity`: Log a custom note.

### AI Follow-up
- `POST /api/ai/:id/ai-followup`: Generate new follow-up content.
- `GET /api/ai/:id/ai-content`: Retrieve last generated content.

### Example Request (Create Lead)
```bash
curl -X POST http://localhost:5001/api/leads \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "name": "John Doe",
  "phone": "+1234567890",
  "source": "Instagram",
  "status": "NEW",
  "tags": "yoga, morning-routine"
}'
```

---

## 👤 Author
**Sukhdev**
