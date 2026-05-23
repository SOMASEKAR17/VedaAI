
# VedaAI -- AI Assessment Creator

> Built by **Somasekar Naidu L** as part of the VedaAI Full Stack Engineer hiring assignment.

**GitHub:** https://github.com/SOMASEKAR17/VedaAI
**Live Demo:** https://vedaai.duckdns.org

---

## What is this?

VedaAI Assessment Creator is a full-stack web application that allows teachers to create assignments, generate structured AI-powered question papers, manage a personal question bank, and export professional PDF exam papers -- all in real time.

---

## Features

### Core
- Assignment creation form with validation (subject, grade, question types, marks, difficulty, due date)
- Optional PDF or text file upload as reference content for question generation
- AI-powered question generation via Groq API (structured JSON, never raw LLM output)
- Questions grouped into sections (Section A, B, C) by type
- Real-time generation status via WebSocket (no polling)
- Structured result page with exam-paper layout, student info fields, and question hierarchy
- Assignment history page (all previous assignments with status and quick-view)

### Bonus (all implemented)
- PDF export via Puppeteer -- proper A4 formatting, inline styles, not a browser print dialog
- Answer key toggle popup before download -- teacher chooses whether to include answers
- Difficulty tags on every question ( [easy] / [medium] / [hard] )
- Regenerate button -- replays generation with the same assignment data, no re-filling the form

### Extra (beyond the assignment)
- Question Bank -- every generated question is auto-saved to MongoDB tagged by subject, grade, difficulty, and type
- Custom Paper Builder -- teacher picks questions from the bank using filters (subject, difficulty, type) and composes a custom paper without re-generating

---

## Architecture Overview

```
Browser (Next.js)
      |
      | HTTPS (REST)         WebSocket (wss)
      |                          |
      +------------ Backend (Express + TypeScript) ------------+
                        |              |              |
                     MongoDB         Redis         BullMQ
                   (assignments,   (job state,    (generation
                    results,        cache)          worker)
                    question bank)
                                                        |
                                                    Groq API
                                                  (LLM generation)
                                                        |
                                                Puppeteer (PDF)
```

**Request flow:**

1. Teacher submits the assignment form
2. Backend validates, saves Assignment to MongoDB (status: pending), pushes to Redis queue, Redis pushes jobs one by one to BullMQ, returns `assignmentId` immediately
3. Frontend opens a WebSocket connection and registers with `assignmentId`
4. BullMQ worker picks up the job, calls Groq API with a structured prompt
5. Response is parsed and validated with Zod before touching the DB (never rendered raw)
6. Worker saves GenerationResult to MongoDB, updates Redis cache, emits `generation:completed` via WebSocket
7. Frontend receives the event and navigates to the result page
8. All generated questions are auto-saved to the Question Bank in the same worker step

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js + TypeScript | App Router, SSR, strong typing |
| State | Zustand | Lightweight, no boilerplate vs Redux |
| Real-time | WebSocket (ws) | Persistent connection, no polling overhead |
| Backend | Node.js + Express + TypeScript | Familiar, fast to build REST APIs |
| Queue | BullMQ | Reliable job retries, worker isolation, job state tracking |
| Cache | Redis (ioredis) | Sub-millisecond status lookups, avoids DB hits on every poll |
| Database | MongoDB + Mongoose | Flexible schema suits evolving question/section structure |
| AI | Groq API | Fast inference, structured JSON output via prompt engineering |
| PDF | Puppeteer | Real PDF binary from HTML template, not browser print |
| Container | Docker + Docker Compose | One-command setup, isolated networks |
| Reverse Proxy | Nginx + Certbot | HTTPS termination, WebSocket proxying, SSL auto-renewal |
| Deployment | AWS EC2 (Ubuntu 22.04) | Full control, Docker Compose runs identically to local |

---

## Setup Instructions (Docker)

### Prerequisites
- Docker installed
- A Groq API key (free at console.groq.com)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/SOMASEKAR17/VedaAI
cd VedaAI

# 2. Create backend environment file
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your values:

```env
PORT=4000
NODE_ENV=production

MONGODB_URI=mongodb://mongo:27017/vedaai

REDIS_HOST=redis
REDIS_PORT=6379

GROQ_API_KEY=your_groq_api_key_here

FRONTEND_URL=http://localhost:3000

MAX_FILE_SIZE_MB=10
```

```bash
# 3. Create frontend environment file
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

```bash
# 4. Start everything
docker-compose up --build

# Frontend:  http://localhost:8080
# Backend:   http://localhost:4000
```

---

## AWS EC2 Deployment

The application runs on an AWS EC2 instance (Ubuntu 22.04) with Nginx as a reverse proxy and Certbot managing SSL. Docker Compose handles all four services with isolated internal and public networks.

**Infrastructure:**

```
User → https://vedaai.duckdns.org (port 443)
            |
          Nginx
            |
    /           /api        /ws
    |             |           |
Frontend      Backend     Backend
(Docker:8080) (Docker:4000) (Docker:4000 WebSocket)
                  |               |
             MongoDB          Redis
           (internal)       (internal)
                  |
              Groq API
             (external)
```

**Network design:**

```
Internet
    |
  Port 80  (HTTP  -- redirects to HTTPS)
  Port 443 (HTTPS -- vedaai.duckdns.org)
  Port 4000 (Backend direct access)
    |
EC2 Instance
    |
    +-- public network  (frontend + backend)
    +-- internal network (backend + redis + mongo, never exposed)
```

**Services:**

| Container | Internal Port | Host Port | Access |
|---|---|---|---|
| vedaai-frontend | 3000 | 8080 | Via Nginx only |
| vedaai-backend | 4000 | 4000 | Via Nginx + direct |
| vedaai-mongo | 27017 | none | Internal only |
| vedaai-redis | 6379 | none | Internal only |

**Notes:**
- SSL certificate issued by Certbot, auto-renews via systemd timer
- 2GB swapfile added to prevent OOM kills during Docker builds
- AWS Security Group inbound rules: 22 (SSH), 80 (HTTP), 443 (HTTPS), 4000 (backend)



**Live URL:** https://vedaai.duckdns.org



## Screenshots

| Page | Screenshot |
|---|---|
| Assignment Form | <img width="1899" height="910" alt="Screenshot 2026-05-23 161642" src="https://github.com/user-attachments/assets/db67062b-32db-4fdf-a7b4-26b0a6c56a7f" /> |
| Generating (WebSocket live) | <img width="1902" height="916" alt="Screenshot 2026-05-23 164846" src="https://github.com/user-attachments/assets/1c29eca7-9be3-4364-ad75-a75e2f4cf6eb" /> |
| Result Page | <img width="1899" height="911" alt="Screenshot 2026-05-23 161806" src="https://github.com/user-attachments/assets/633a324d-4e39-4f9a-a1be-76c8c8b4a613" />|
| PDF Export | <img width="1894" height="974" alt="Screenshot 2026-05-23 161916" src="https://github.com/user-attachments/assets/fb8d3a50-29f9-4452-a9b8-baac7f7afea7" />|
| Custom Paper Builder | <img width="1897" height="869" alt="Screenshot 2026-05-23 190930" src="https://github.com/user-attachments/assets/5dc297e2-211f-41f9-b7a6-50a07ca2eb21" />|

---      


## Future Scope

- **Authentication** -- teacher accounts with personal assignment history and question banks
- **Student portal** -- share a paper link with students who fill in answers online
- **AI grading** -- auto-grade submitted answers against the answer key using LLM
- **Bloom's Taxonomy tagging** -- tag each question by cognitive level (Remember, Understand, Apply, etc.)
- **Question analytics** -- track which questions get regenerated most, identify gaps by subject
- **Export to Google Forms** -- push MCQ questions directly into a Google Form for online assessments
- **Collaborative editing** -- multiple teachers co-editing a paper before finalizing

---

## Project Structure

```
VedaAI/
├── backend/
│   ├── src/
│   │   ├── config/         MongoDB, Redis, env validation
│   │   ├── models/         Assignment, GenerationResult, QuestionBank
│   │   ├── queues/         BullMQ queue + worker
│   │   ├── routes/         assignments, results, question bank
│   │   ├── controllers/    request handlers
│   │   ├── services/       promptBuilder, llmService, responseParser, pdfService
│   │   ├── websocket/      WebSocket server + client registry
│   │   ├── middleware/      validation, upload, error handler
│   │   └── types/          shared TypeScript interfaces
│   ├── Dockerfile
│   └── server.ts
├── frontend/
│   ├── app/
│   │   ├── assignments/
│   │   │   ├── new/              creation form
│   │   │   └── [id]/
│   │   │       ├── generating/   WebSocket live status
│   │   │       └── result/       question paper output
│   │   └── question-bank/        bank browser + custom paper builder
│   ├── components/
│   ├── store/              Zustand store
│   ├── services/           API client
│   ├── hooks/              useGenerationSocket
│   └── types/
└── docker-compose.yml
```

---

*Built with Next.js, Express, BullMQ, Redis, MongoDB, Groq, Nginx, and Puppeteer. Deployed on AWS EC2.*
