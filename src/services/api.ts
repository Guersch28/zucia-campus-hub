import { API_BASE_URL } from "@/config/env";

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
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  // Some endpoints return empty body
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

/* ------------------------------------------------------------------ */
/*  Auth                                                              */
/* ------------------------------------------------------------------ */
export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};

/* ------------------------------------------------------------------ */
/*  Files                                                             */
/* ------------------------------------------------------------------ */
export const filesApi = {
  list: async (year?: string, semester?: string): Promise<CourseFile[]> => {
    const params = new URLSearchParams();
    if (year && year !== "all") params.set("year", year);
    if (semester && semester !== "all") params.set("semester", semester);
    const qs = params.toString();
    const data = await request<{ files: CourseFile[] }>(`/files${qs ? `?${qs}` : ""}`);
    return data.files || [];
  },

  upload: async (file: File, year: string, semester: string): Promise<CourseFile> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("year", year);
    fd.append("semester", semester);
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: { ...authHeader() }, // no Content-Type → browser sets boundary
      body: fd,
    });
    return handle<CourseFile>(res);
  },

  delete: (fileId: string) =>
    request<{ message: string }>(`/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
    }),

  downloadUrl: (fileId: string) =>
    `${API_BASE_URL}/download/${encodeURIComponent(fileId)}`,

  summarize: async (fileId: string): Promise<{ summary: string }> => {
    const fd = new FormData();
    fd.append("file_id", fileId);
    const res = await fetch(`${API_BASE_URL}/summarize`, {
      method: "POST",
      headers: { ...authHeader() },
      body: fd,
    });
    return handle(res);
  },

  ask: (fileId: string, question: string) =>
    request<{ answer: string }>("/ask-question", {
      method: "POST",
      body: JSON.stringify({ file_id: fileId, question }),
    }),
};

/* ------------------------------------------------------------------ */
/*  PDF Chat (per-file conversational)                                */
/* ------------------------------------------------------------------ */
export const pdfChatApi = {
  history: async (fileId: string): Promise<ChatPdfMessage[]> => {
    const data = await request<{ messages: ChatPdfMessage[] }>(
      `/chat/${encodeURIComponent(fileId)}`,
    );
    return data.messages || [];
  },

  send: (fileId: string, message: string) =>
    request<{ status: string; response?: string }>("/chat/message", {
      method: "POST",
      body: JSON.stringify({ file_id: fileId, message, is_user: true }),
    }),

  clear: (fileId: string) =>
    request<{ status: string }>(`/chat/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
    }),
};

/* ------------------------------------------------------------------ */
/*  Lecturer notes & student responses                                */
/* ------------------------------------------------------------------ */
export const lecturerApi = {
  postNote: (fileId: string, message: string) =>
    request("/lecturer/message", {
      method: "POST",
      body: JSON.stringify({ file_id: fileId, message }),
    }),

  getNote: async (fileId: string): Promise<LecturerNote | null> => {
    const data = await request<{ message: LecturerNote | null }>(
      `/lecturer/message/${encodeURIComponent(fileId)}`,
    );
    return data.message;
  },

  getResponses: async (fileId: string): Promise<StudentResponse[]> => {
    const data = await request<{ responses: StudentResponse[] }>(
      `/student/responses/${encodeURIComponent(fileId)}`,
    );
    return data.responses || [];
  },
};

export const studentApi = {
  postResponse: (fileId: string, response: string) =>
    request("/student/response", {
      method: "POST",
      body: JSON.stringify({ file_id: fileId, response }),
    }),

  publicResponses: async (fileId: string): Promise<StudentResponse[]> => {
    const data = await request<{ responses: StudentResponse[] }>(
      `/public/responses/${encodeURIComponent(fileId)}`,
    );
    return data.responses || [];
  },
};

/* ------------------------------------------------------------------ */
/*  ZUCIA Chatbot (university-wide)                                   */
/* ------------------------------------------------------------------ */
export const zuciaApi = {
  ask: (question: string) =>
    request<ZuciaReply>("/chat", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
};
