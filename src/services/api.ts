import { API_BASE_URL } from "@/config/env";
import {
  isBackendDown,
  isNetworkError,
  markBackendDown,
  mockAuth,
  mockFiles,
  mockLecturer,
  mockPdfChat,
  mockStudent,
  mockZucia,
} from "./mockBackend";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
export interface LoginResponse {
  token: string;
  role: "student" | "lecturer";
  username: string;
}

export interface CourseFile {
  id: string;
  filename: string;
  year: string;
  semester: string;
  size: number;
  uploaded_at: string;
}

export interface ChatPdfMessage {
  message: string;
  is_user: boolean;
  timestamp: string;
  user?: string;
}

export interface LecturerNote {
  message: string;
  lecturer: string;
  timestamp: string;
}

export interface StudentResponse {
  student: string;
  response: string;
  timestamp: string;
}

export interface ZuciaReply {
  answer: string;
  source?: string;
  found_locally?: boolean;
  topic?: string;
  confidence?: number;
  structured?: {
    explanation: string;
    keyPoints: string;
    examples: string;
    summary: string;
  };
}

/* ------------------------------------------------------------------ */
/*  HTTP helper                                                       */
/* ------------------------------------------------------------------ */
function authHeader(): Record<string, string> {
  const token = localStorage.getItem("zcu_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch { /* ignore */ }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers || {}),
    },
  });
  return handle<T>(res);
}

/**
 * Run a real-backend call, falling back to the mock implementation
 * when the backend is unreachable (network error / preview without tunnel).
 */
async function withMock<T>(real: () => Promise<T>, mock: () => T | Promise<T>): Promise<T> {
  if (isBackendDown()) return await mock();
  try {
    return await real();
  } catch (err) {
    if (isNetworkError(err)) {
      markBackendDown();
      return await mock();
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/*  Auth                                                              */
/* ------------------------------------------------------------------ */
export const authApi = {
  login: (username: string, password: string) =>
    withMock<LoginResponse>(
      () =>
        request("/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        }),
      () => mockAuth.login(username, password),
    ),
};

/* ------------------------------------------------------------------ */
/*  Files                                                             */
/* ------------------------------------------------------------------ */
export const filesApi = {
  list: (year?: string, semester?: string): Promise<CourseFile[]> =>
    withMock(
      async () => {
        const params = new URLSearchParams();
        if (year && year !== "all") params.set("year", year);
        if (semester && semester !== "all") params.set("semester", semester);
        const qs = params.toString();
        const data = await request<{ files: CourseFile[] }>(`/files${qs ? `?${qs}` : ""}`);
        return data.files || [];
      },
      () => mockFiles.list(year, semester),
    ),

  upload: (file: File, year: string, semester: string): Promise<CourseFile> =>
    withMock(
      async () => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("year", year);
        fd.append("semester", semester);
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          headers: { ...authHeader() },
          body: fd,
        });
        return handle<CourseFile>(res);
      },
      () => mockFiles.upload(file, year, semester),
    ),

  delete: (fileId: string) =>
    withMock(
      () =>
        request<{ message: string }>(`/files/${encodeURIComponent(fileId)}`, {
          method: "DELETE",
        }),
      () => mockFiles.delete(fileId),
    ),

  downloadUrl: (fileId: string) =>
    isBackendDown() ? "#" : `${API_BASE_URL}/download/${encodeURIComponent(fileId)}`,

  summarize: (fileId: string): Promise<{ summary: string }> =>
    withMock(
      async () => {
        const fd = new FormData();
        fd.append("file_id", fileId);
        const res = await fetch(`${API_BASE_URL}/summarize`, {
          method: "POST",
          headers: { ...authHeader() },
          body: fd,
        });
        return handle(res);
      },
      () => mockFiles.summarize(fileId),
    ),

  ask: (fileId: string, question: string) =>
    withMock(
      () =>
        request<{ answer: string }>("/ask-question", {
          method: "POST",
          body: JSON.stringify({ file_id: fileId, question }),
        }),
      () => mockFiles.ask(fileId, question),
    ),
};

/* ------------------------------------------------------------------ */
/*  PDF Chat                                                          */
/* ------------------------------------------------------------------ */
export const pdfChatApi = {
  history: (fileId: string): Promise<ChatPdfMessage[]> =>
    withMock(
      async () => {
        const data = await request<{ messages: ChatPdfMessage[] }>(
          `/chat/${encodeURIComponent(fileId)}`,
        );
        return data.messages || [];
      },
      () => mockPdfChat.history(fileId),
    ),

  send: (fileId: string, message: string) =>
    withMock(
      () =>
        request<{ status: string; response?: string }>("/chat/message", {
          method: "POST",
          body: JSON.stringify({ file_id: fileId, message, is_user: true }),
        }),
      () => mockPdfChat.send(fileId, message),
    ),

  clear: (fileId: string) =>
    withMock(
      () =>
        request<{ status: string }>(`/chat/${encodeURIComponent(fileId)}`, {
          method: "DELETE",
        }),
      () => mockPdfChat.clear(fileId),
    ),
};

/* ------------------------------------------------------------------ */
/*  Lecturer / student notes                                          */
/* ------------------------------------------------------------------ */
export const lecturerApi = {
  postNote: (fileId: string, message: string) =>
    withMock(
      () =>
        request("/lecturer/message", {
          method: "POST",
          body: JSON.stringify({ file_id: fileId, message }),
        }),
      () => mockLecturer.postNote(fileId, message),
    ),

  getNote: (fileId: string): Promise<LecturerNote | null> =>
    withMock(
      async () => {
        const data = await request<{ message: LecturerNote | null }>(
          `/lecturer/message/${encodeURIComponent(fileId)}`,
        );
        return data.message;
      },
      () => mockLecturer.getNote(fileId),
    ),

  getResponses: (fileId: string): Promise<StudentResponse[]> =>
    withMock(
      async () => {
        const data = await request<{ responses: StudentResponse[] }>(
          `/student/responses/${encodeURIComponent(fileId)}`,
        );
        return data.responses || [];
      },
      () => mockLecturer.getResponses(fileId),
    ),
};

export const studentApi = {
  postResponse: (fileId: string, response: string) =>
    withMock(
      () =>
        request("/student/response", {
          method: "POST",
          body: JSON.stringify({ file_id: fileId, response }),
        }),
      () => mockStudent.postResponse(fileId, response),
    ),

  publicResponses: (fileId: string): Promise<StudentResponse[]> =>
    withMock(
      async () => {
        const data = await request<{ responses: StudentResponse[] }>(
          `/public/responses/${encodeURIComponent(fileId)}`,
        );
        return data.responses || [];
      },
      () => mockStudent.publicResponses(fileId),
    ),
};

/* ------------------------------------------------------------------ */
/*  ZUCIA university chat                                             */
/* ------------------------------------------------------------------ */
export const zuciaApi = {
  ask: (question: string): Promise<ZuciaReply> =>
    withMock(
      () =>
        request<ZuciaReply>("/chat", {
          method: "POST",
          body: JSON.stringify({ question }),
        }),
      () => mockZucia.ask(question),
    ),
};
