# ZUCIA — ZCU Intelligent Campus Assistant (Frontend)

A modern React + Vite + TailwindCSS frontend for the ZCU Chatbot & Course
Material Management System. Wires into the existing **FastAPI** backend
(`main.py`) without any changes required.

---

## ✨ Design system

- **Primary:** Deep Navy `hsl(222 47% 15%)`
- **Accent:** Warm Amber `hsl(38 92% 50%)`
- **Type:** Sora (headings) + Inter (body)
- Tokenised in `src/index.css` — every component uses semantic Tailwind
  tokens (no hard-coded colours).

---

## 📂 Project structure

```
src/
├── components/        Reusable UI (Sidebar, UploadZone, ChatPDFModal…)
├── config/env.ts      Runtime config (reads VITE_* env vars)
├── hooks/useAuth.ts   Auth state + login/logout (calls /login)
├── pages/             LoginPage, StudentDashboard, LecturerDashboard, ChatbotPage
├── services/api.ts    All HTTP calls (auth, files, pdf-chat, ZUCIA)
└── index.css          Design tokens & utility classes
```

---

## 🚀 Setup

### 1. Backend (FastAPI — from your `main.py`)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # then fill in your keys
uvicorn main:app --reload --port 8000
```

Required Python packages (`requirements.txt`):

```
fastapi
uvicorn[standard]
python-multipart
aiofiles
PyPDF2
python-dotenv
groq
requests
pydantic
```

Required env vars (`backend/.env`):

```
GROQ_API_KEY=...           # required
HUGGING_FACE_TOKEN=...     # optional, enables Mistral PDF chat
ADMIN_PASS=admin123
ALLOWED_ORIGINS=http://localhost:8080
```

> ⚠️ **Please share / drop the supporting backend files** (`answers.json`,
> `services/knowledge_base.py`, `routers/knowledge.py`) so the chatbot
> endpoints work end-to-end. Without them the `/chat` endpoint will fail to
> import on startup.

### 2. Frontend

```bash
cp .env.example .env       # set VITE_API_BASE_URL=http://localhost:8000
bun install                # or: npm install
bun run dev                # or: npm run dev
```

The app runs on `http://localhost:8080`.

---

## 🔑 Demo credentials

| Role     | Username   | Password     |
|----------|------------|--------------|
| Student  | `student`  | `student123` |
| Lecturer | `lecturer` | `ITT2025`    |

(Backend uses password-based role assignment — any username is accepted as
long as the password matches.)

---

## 🔌 Endpoints consumed

| Feature                | Method | Path                          |
|------------------------|--------|-------------------------------|
| Login                  | POST   | `/login`                      |
| List files             | GET    | `/files?year&semester`        |
| Upload PDF             | POST   | `/upload`                     |
| Delete file            | DELETE | `/files/{id}`                 |
| Download file          | GET    | `/download/{id}`              |
| Chat with PDF          | POST   | `/chat/message`               |
| PDF chat history       | GET    | `/chat/{id}`                  |
| Clear PDF chat         | DELETE | `/chat/{id}`                  |
| ZUCIA chatbot          | POST   | `/chat`                       |
| Lecturer note          | POST   | `/lecturer/message`           |
| Student response       | POST   | `/student/response`           |

All authenticated requests send `Authorization: Bearer <token>` where the
token is the base64 string returned by `/login`.

---

## 🛠️ Tech stack

- **React 18** + **Vite 5** + **TypeScript 5**
- **TailwindCSS v3** with custom design tokens
- **shadcn/ui** primitives
- **framer-motion** for transitions
- **react-router-dom** for routing
- **lucide-react** for icons
