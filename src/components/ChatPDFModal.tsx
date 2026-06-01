import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, FileText, Loader2, Trash2 } from "lucide-react";
import { pdfChatApi, type CourseFile, type ChatPdfMessage } from "@/services/api";

interface Props {
  file: CourseFile;
  onClose: () => void;
}

const ChatPDFModal = ({ file, onClose }: Props) => {
  const [messages, setMessages] = useState<ChatPdfMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const hist = await pdfChatApi.history(file.id);
        setMessages(hist);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [file.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const q = input.trim();
    if (!q || sending) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { message: q, is_user: true, timestamp: new Date().toISOString() },
    ]);
    setSending(true);
    try {
      const r = await pdfChatApi.send(file.id, q);
      if (r.response) {
        setMessages((prev) => [
          ...prev,
          { message: r.response!, is_user: false, timestamp: new Date().toISOString() },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          message: `Error: ${err instanceof Error ? err.message : "Failed"}`,
          is_user: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const clear = async () => {
    if (!confirm("Clear chat history for this PDF?")) return;
    try {
      await pdfChatApi.clear(file.id);
      setMessages([]);
    } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border border-border"
        >
          <header className="flex items-center justify-between gap-3 p-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{file.filename}</p>
                <p className="text-xs text-muted-foreground">Ask AI about this document</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clear}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-all"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading conversation…
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                Ask a question about this PDF to get started.
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.is_user ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${m.is_user ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="chat-bubble-bot flex items-center gap-1.5 px-5 py-4">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 p-3 border-t border-border"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this PDF…"
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-xl bg-accent text-accent-foreground hover:brightness-105 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatPDFModal;
