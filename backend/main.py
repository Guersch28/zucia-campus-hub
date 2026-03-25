"""
ZUCIA Backend - Zambia Catholic University Intelligent Campus Assistant
FastAPI backend for chatbot, file management, and knowledge base.
"""
import os
import json
import time
import re
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ZUCIA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
SECRET_KEY = os.getenv("SECRET_KEY", "zucia-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
UPLOAD_DIR = "./uploads"
ANSWERS_FILE = "./answers.json"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Auth
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

USERS = {
    "student": {"password": "student123", "role": "student"},
    "lecturer": {"password": "ITT2025", "role": "lecturer"},
}

# In-memory storage
answers_data = {}
files_metadata: List[dict] = []


def load_answers():
    global answers_data
    with open(ANSWERS_FILE, "r") as f:
        answers_data = json.load(f)


def save_answers():
    with open(ANSWERS_FILE, "w") as f:
        json.dump(answers_data, f, indent=2)


@app.on_event("startup")
def startup():
    load_answers()


# Models
class LoginRequest(BaseModel):
    username: str
    password: str


class ChatRequest(BaseModel):
    message: str
    history: list = []


class ChatPDFRequest(BaseModel):
    file_id: str
    question: str
    history: list = []


class KnowledgeTextRequest(BaseModel):
    title: str
    content: str
    tags: list = []


# Auth helpers
def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_lecturer(user=Depends(get_current_user)):
    if user["role"] != "lecturer":
        raise HTTPException(status_code=403, detail="Lecturer access required")
    return user


# Auth endpoint
@app.post("/api/login")
def login(req: LoginRequest):
    user = USERS.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": req.username, "role": user["role"]})
    return {"token": token, "role": user["role"], "username": req.username}


# File endpoints
@app.get("/api/files")
def list_files(year: Optional[int] = None, semester: Optional[int] = None, user=Depends(get_current_user)):
    load_answers()
    filtered = files_metadata
    if year:
        filtered = [f for f in filtered if f["year"] == year]
    if semester:
        filtered = [f for f in filtered if f["semester"] == semester]
    return filtered


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    subject: str = Form(...),
    year: int = Form(...),
    semester: int = Form(...),
    description: str = Form(""),
    user=Depends(require_lecturer),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 20MB")

    timestamp = int(time.time())
    safe_subject = re.sub(r"[^a-zA-Z0-9]", "_", subject)
    filename = f"{safe_subject}_{year}yr_{semester}sem_{timestamp}.pdf"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    file_meta = {
        "id": str(timestamp),
        "filename": filename,
        "subject": subject,
        "year": year,
        "semester": semester,
        "description": description,
        "upload_date": datetime.now().strftime("%Y-%m-%d"),
        "view_count": 0,
        "filepath": filepath,
    }
    files_metadata.insert(0, file_meta)
    return file_meta


@app.delete("/api/files/{file_id}")
def delete_file(file_id: str, user=Depends(require_lecturer)):
    global files_metadata
    file = next((f for f in files_metadata if f["id"] == file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if os.path.exists(file["filepath"]):
        os.remove(file["filepath"])
    files_metadata = [f for f in files_metadata if f["id"] != file_id]
    return {"message": "File deleted"}


@app.get("/api/files/{file_id}/download")
def download_file(file_id: str, user=Depends(get_current_user)):
    file = next((f for f in files_metadata if f["id"] == file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file["filepath"], filename=file["filename"], media_type="application/pdf")


@app.post("/api/files/{file_id}/view")
def view_file(file_id: str, user=Depends(get_current_user)):
    file = next((f for f in files_metadata if f["id"] == file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    file["view_count"] += 1
    return {"view_count": file["view_count"]}


# Chat endpoints
def search_knowledge_base(message: str) -> Optional[dict]:
    load_answers()
    msg_lower = message.lower()
    best_match = None
    best_score = 0

    # Search FAQs
    for faq in answers_data.get("faqs", []):
        q_words = set(faq["question"].lower().split())
        m_words = set(msg_lower.split())
        overlap = len(q_words & m_words)
        score = overlap / max(len(q_words), 1)
        if score > best_score:
            best_score = score
            best_match = faq["answer"]

    # Search custom knowledge
    for entry in answers_data.get("custom_knowledge", []):
        words = set(entry.get("content", "").lower().split()[:50])
        title_words = set(entry.get("title", "").lower().split())
        m_words = set(msg_lower.split())
        overlap = len((words | title_words) & m_words)
        score = overlap / max(len(m_words), 1)
        if score > best_score:
            best_score = score
            best_match = entry["content"]

    # Search university info
    for key, value in answers_data.get("university_info", {}).items():
        if isinstance(value, str) and any(w in msg_lower for w in key.lower().split("_")):
            if 0.5 > best_score:
                best_score = 0.5
                best_match = f"{key.replace('_', ' ').title()}: {value}"

    # Search programs
    for prog in answers_data.get("programs", []):
        if prog["name"].lower() in msg_lower or any(w in msg_lower for w in prog["name"].lower().split()):
            score = 0.7
            if score > best_score:
                best_score = score
                best_match = f"{prog['name']} ({prog['faculty']}): {prog['description']} Duration: {prog['duration']}. Requirements: {prog['entry_requirements']}"

    if best_score >= 0.6 and best_match:
        return {"answer": best_match, "source": "knowledge_base", "confidence": best_score}
    return None


@app.post("/api/chat")
def chat(req: ChatRequest, user=Depends(get_current_user)):
    # Step 1: Search knowledge base
    kb_result = search_knowledge_base(req.message)
    if kb_result:
        return {"reply": kb_result["answer"], "source": "knowledge_base"}

    # Step 2: Call Groq API
    if not GROQ_API_KEY:
        return {
            "reply": "I'm sorry, the AI service is not configured yet. Please contact the administrator to set up the GROQ_API_KEY.",
            "source": "ai",
        }

    try:
        import groq

        client = groq.Groq(api_key=GROQ_API_KEY)
        system_prompt = f"""You are ZUCIA, the intelligent assistant for Zambia Catholic University (ZCU).
Always answer based on the ZCU knowledge base provided. Be helpful, friendly, and professional.
If asked about ZCU specifics, use only the provided knowledge base.

ZCU Knowledge Base:
{json.dumps(answers_data, indent=2)}"""

        messages = [{"role": "system", "content": system_prompt}]
        for h in req.history[-10:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": req.message})

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return {"reply": response.choices[0].message.content, "source": "ai"}
    except Exception as e:
        return {"reply": f"I encountered an error: {str(e)}. Please try again.", "source": "ai"}


@app.post("/api/chat-pdf")
def chat_pdf(req: ChatPDFRequest, user=Depends(get_current_user)):
    file = next((f for f in files_metadata if f["id"] == req.file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        import fitz  # PyMuPDF

        doc = fitz.open(file["filepath"])
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")

    # Split into 500-word chunks
    words = full_text.split()
    chunks = []
    for i in range(0, len(words), 500):
        chunks.append(" ".join(words[i : i + 500]))

    # Find relevant chunks by keyword overlap
    q_words = set(req.question.lower().split())
    scored_chunks = []
    for chunk in chunks:
        c_words = set(chunk.lower().split())
        overlap = len(q_words & c_words)
        scored_chunks.append((overlap, chunk))
    scored_chunks.sort(reverse=True, key=lambda x: x[0])
    top_chunks = [c[1] for c in scored_chunks[:3]]
    context = "\n\n".join(top_chunks)

    if not HUGGINGFACE_API_KEY:
        return {
            "reply": "The PDF Q&A service is not configured. Please set up the HUGGINGFACE_API_KEY.",
            "filename": file["filename"],
            "source": "pdf",
        }

    try:
        import requests

        api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"
        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
        prompt = f"""<s>[INST] You are ZUCIA. Answer the question based only on the provided PDF content from Zambia Catholic University.

PDF Content:
{context}

Question: {req.question} [/INST]"""

        response = requests.post(api_url, headers=headers, json={"inputs": prompt, "parameters": {"max_new_tokens": 512}})
        result = response.json()

        if isinstance(result, list) and len(result) > 0:
            generated = result[0].get("generated_text", "")
            answer = generated.split("[/INST]")[-1].strip() if "[/INST]" in generated else generated
        else:
            answer = "I couldn't generate a response from the PDF content."

        return {"reply": answer, "filename": file["filename"], "source": "pdf"}
    except Exception as e:
        return {"reply": f"Error: {str(e)}", "filename": file["filename"], "source": "pdf"}


# Knowledge base endpoints
@app.get("/api/knowledge")
def get_knowledge(user=Depends(get_current_user)):
    load_answers()
    return answers_data.get("custom_knowledge", [])


@app.post("/api/knowledge/text")
def add_knowledge_text(req: KnowledgeTextRequest, user=Depends(require_lecturer)):
    load_answers()
    custom = answers_data.get("custom_knowledge", [])
    new_id = max([e.get("id", 0) for e in custom], default=0) + 1
    entry = {
        "id": new_id,
        "title": req.title.strip(),
        "content": req.content.strip(),
        "source_type": "text",
        "tags": [t.strip() for t in req.tags if t.strip()],
        "date_added": datetime.now().strftime("%Y-%m-%d"),
    }
    custom.append(entry)
    answers_data["custom_knowledge"] = custom
    save_answers()
    return entry


@app.post("/api/knowledge/upload")
async def upload_knowledge(file: UploadFile = File(...), user=Depends(require_lecturer)):
    ext = file.filename.lower().split(".")[-1] if file.filename else ""
    if ext not in ("txt", "docx"):
        raise HTTPException(status_code=400, detail="Only .txt and .docx files are supported")

    content_text = ""
    raw = await file.read()

    if ext == "txt":
        content_text = raw.decode("utf-8", errors="ignore")
    elif ext == "docx":
        try:
            import docx
            import io

            doc = docx.Document(io.BytesIO(raw))
            content_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading .docx: {str(e)}")

    load_answers()
    custom = answers_data.get("custom_knowledge", [])
    new_id = max([e.get("id", 0) for e in custom], default=0) + 1
    entry = {
        "id": new_id,
        "title": file.filename.rsplit(".", 1)[0],
        "content": content_text[:5000],
        "source_type": "document",
        "tags": ["uploaded"],
        "date_added": datetime.now().strftime("%Y-%m-%d"),
    }
    custom.append(entry)
    answers_data["custom_knowledge"] = custom
    save_answers()
    return entry


@app.delete("/api/knowledge/{entry_id}")
def delete_knowledge(entry_id: int, user=Depends(require_lecturer)):
    load_answers()
    custom = answers_data.get("custom_knowledge", [])
    answers_data["custom_knowledge"] = [e for e in custom if e.get("id") != entry_id]
    save_answers()
    return {"message": "Entry deleted"}


@app.get("/api/knowledge/reload")
def reload_knowledge(user=Depends(get_current_user)):
    load_answers()
    total = (
        len(answers_data.get("faqs", []))
        + len(answers_data.get("programs", []))
        + len(answers_data.get("custom_knowledge", []))
    )
    return {"total_entries": total}


@app.get("/api/zcu-info")
def get_zcu_info():
    load_answers()
    return answers_data


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
