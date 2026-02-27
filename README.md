#  CoachAssist CRM

A full-stack AI-powered CRM built for wellness coaches to manage leads, track activities, and generate intelligent follow-ups using Google Gemini.

---

##  Overview

CoachAssist CRM helps wellness coaches:

- Manage leads efficiently  
- Track interactions with a structured timeline  
- Generate AI-powered WhatsApp messages & call scripts  
- Monitor business performance via real-time analytics  

Built as part of a Full Stack Developer assessment with performance, scalability, and production-readiness in mind.

---

##  Key Features

###  Authentication
- Secure JWT-based login & registration
- Protected dashboard routes

###  Lead Management (CRUD)
- Create, update, delete leads
- Filter by status & tags
- Search by name or phone
- Assign follow-up dates

###  Activity Timeline
- CALL, WHATSAPP, NOTE, STATUS_CHANGE, AI_MESSAGE_GENERATED
- Cursor-based pagination
- Optimized MongoDB indexing

###  AI-Powered Follow-ups
- Generates:
  - Short WhatsApp message
  - 3-point call script
  - Objection handling (if INTERESTED)
- Strict structured JSON output
- Server-side Gemini integration

### Dashboard Analytics
- Funnel status breakdown
- Conversion rate
- Overdue follow-ups
- Top lead sources
- 7-day activity graph

###  Performance Optimizations
- Redis caching (60s TTL)
- AI rate limiting (5 requests/hour per user)
- Efficient MongoDB aggregation pipelines

---

#  Project Screenshots

<div align="center">

###  Login Page
<img src="./screenshots/0.png" width="800"/>
<br/><br/>

### Dashboard Overview
<img src="./screenshots/1.png" width="800"/>
<br/><br/>

### Lead List with Filters
<img src="./screenshots/2.png" width="800"/>
<br/><br/>

###  Lead Detail View
<img src="./screenshots/3.png" width="800"/>
<br/><br/>

### Activity Timeline
<img src="./screenshots/4.png" width="800"/>
<br/><br/>

###  AI Generated Follow-up
<img src="./screenshots/5.png" width="800"/>
<br/><br/>

###  Analytics Section
<img src="./screenshots/6.png" width="800"/>
<br/><br/>

###  Responsive UI
<img src="./screenshots/7.png" width="800"/>
<br/><br/>

###  Redis & Performance Demo
<img src="./screenshots/8.png" width="800"/>

</div>

---

# 🛠 Tech Stack

## Frontend
- Next.js (App Router)
- Tailwind CSS
- Headless UI
- Heroicons

## Backend
- Node.js
- Express.js

## Database
- MongoDB 
- Mongoose ODM

## Caching & Queue
- Redis (Cloud)

## AI Integration
- Google Gemini 

---

# ⚙️ Setup Instructions

##  Prerequisites

- Node.js (v18+)
- MongoDB Atlas
- Redis Cloud
- Gemini API Key

---

## Environment Variables

Create a `.env` file inside `/backend`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password

GEMINI_API_KEY=your_gemini_api_key
````

---

## Installation & Running

###  Backend

```bash
cd backend
npm install
npm run dev
```

###  Frontend

```bash
cd frontend
npm install
npm run dev
```

Application will run at:

```
http://localhost:3000
```

---

#  Architecture & Performance Design

## MongoDB Collections

### Users

* Stores authentication data

### Leads

Indexed fields:

* assignedTo
* status
* nextFollowUpAt
* name
* phone

### Activities

Indexed fields:

* lead
* createdAt

Supports efficient cursor-based pagination.

---

## ⚡ Caching Strategy

### Dashboard Analytics

* Key: `dashboard:{userId}:{date}`
* TTL: 60 seconds
* Reduces MongoDB aggregation load

### AI Rate Limiting

* Max 5 AI requests per user per hour
* Implemented using Redis counters with expiry

---

#  API Endpoints

## Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

## Leads

* `GET /api/leads`
* `POST /api/leads`
* `PATCH /api/leads/:id`
* `DELETE /api/leads/:id`

## Dashboard

* `GET /api/dashboard`

## Timeline

* `GET /api/leads/:id/timeline`

## AI Follow-up

* `POST /api/leads/:id/ai-followup`

---

#  Example AI Output

```json
{
  "whatsappMessage": "Hi John! Following up on your wellness goals. Open to a quick 15-min chat this week?",
  "callScript": [
    "Confirm wellness interest",
    "Discuss stress & energy challenges",
    "Schedule short discovery call"
  ],
  "objectionHandling": "Question: I'm too busy.\nAnswer: Even short sessions can improve clarity and focus."
}
```

---

# Author

**Sukhdev Singh**
