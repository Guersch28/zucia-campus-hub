import { useState, useRef, useEffect } from "react";
import { type CourseMaterial } from "@/constants/zcuData";
import { X, Send, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ChatPDFModalProps {
  file: CourseMaterial;
  onClose: () => void;
}

interface PDFChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
}

const ChatPDFModal = ({ file, onClose }: ChatPDFModalProps) => {
  const storageKey = `zucia_pdf_chat_${file.id}`;
  const [messages, setMessages] = useState<PDFChatMsg[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, storageKey]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: PDFChatMsg = { id: String(Date.now()), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated PDF Q&A response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "bot",
          content: `Based on "${file.subject}" (${file.filename}):\n\nThis is a simulated response. In a production environment with the FastAPI backend running, ZUCIA would extract the actual PDF content and provide answers based on the document. Please connect the backend to enable full PDF Q&A functionality.`,
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg h-[600px] max-h-[80vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="zcu-gradient p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-primary-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-foreground truncate">{file.subject}</p>
              <p className="text-[10px] text-primary-foreground/70 truncate">{file.filename}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Ask any question about this document.
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="chat-bubble-bot flex items-center gap-1.5 px-4 py-3">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="p-3 border-t border-border flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this document..."
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
          />
          <button type="submit" disabled={!input.trim()} className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChatPDFModal;
