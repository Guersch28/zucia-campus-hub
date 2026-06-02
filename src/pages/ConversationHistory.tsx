import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { filesApi, pdfChatApi, type CourseFile, type ChatPdfMessage } from "@/services/api";
import ChatPDFModal from "@/components/ChatPDFModal";
import { MessageSquare, FileText, Loader2, Sparkles, ChevronRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Thread {
  file: CourseFile;
  messages: ChatPdfMessage[];
  lastMessage: ChatPdfMessage;
}

const ZUCIA_STORAGE_KEY = "zucia_chat";

const ConversationHistory = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<CourseFile | null>(null);
  const [zuciaPreview, setZuciaPreview] = useState<{ count: number; last?: string; ts?: number }>({ count: 0 });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // ZUCIA general thread from localStorage
      try {
        const raw = localStorage.getItem(ZUCIA_STORAGE_KEY);
        if (raw) {
          const arr = JSON.parse(raw) as Array<{ content: string; timestamp: number }>;
          if (Array.isArray(arr) && arr.length) {
            const last = arr[arr.length - 1];
            setZuciaPreview({ count: arr.length, last: last.content, ts: last.timestamp });
          } else {
            setZuciaPreview({ count: 0 });
          }
        } else {
          setZuciaPreview({ count: 0 });
        }
      } catch { setZuciaPreview({ count: 0 }); }

      // PDF chat threads
      const files = await filesApi.list();
      const results = await Promise.allSettled(
        files.map(async (f) => {
          const msgs = await pdfChatApi.history(f.id);
          return { file: f, messages: msgs };
        }),
      );
      const out: Thread[] = [];
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.messages.length > 0) {
          const msgs = r.value.messages;
          out.push({ file: r.value.file, messages: msgs, lastMessage: msgs[msgs.length - 1] });
        }
      }
      out.sort((a, b) =>
        new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime(),
      );
      setThreads(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const fmt = (iso: string | number) => {
    const d = typeof iso === "number" ? new Date(iso) : new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="min-h-[calc(100vh-0px)] p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Conversation History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resume previous chats with ZUCIA or your PDFs.
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg border border-border hover:bg-muted transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ZUCIA general thread */}
      <motion.button
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate("/chatbot")}
        className="w-full text-left mb-3 p-4 rounded-xl border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all flex items-center gap-4 group"
      >
        <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-foreground truncate">ZUCIA Assistant</p>
            {zuciaPreview.ts && (
              <span className="text-[11px] text-muted-foreground shrink-0">{fmt(zuciaPreview.ts)}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {zuciaPreview.count > 0
              ? `${zuciaPreview.count} message${zuciaPreview.count > 1 ? "s" : ""} · ${zuciaPreview.last}`
              : "No messages yet — start a new conversation."}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent shrink-0" />
      </motion.button>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">PDF Conversations</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading conversations…
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          {error}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-sm text-muted-foreground">No PDF conversations yet.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Open a PDF from your dashboard and ask a question to start a thread.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => (
            <motion.li
              key={t.file.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => setActiveFile(t.file)}
                className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground truncate">{t.file.filename}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {fmt(t.lastMessage.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    <span className="font-medium">
                      {t.lastMessage.is_user ? "You: " : "ZUCIA: "}
                    </span>
                    {t.lastMessage.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                      {t.messages.length} msg{t.messages.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Year {t.file.year} · Sem {t.file.semester}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {activeFile && (
        <ChatPDFModal
          file={activeFile}
          onClose={() => { setActiveFile(null); load(); }}
        />
      )}
    </div>
  );
};

export default ConversationHistory;
