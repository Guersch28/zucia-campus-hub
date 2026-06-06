import { useState, useRef, useEffect } from "react";
import { zuciaApi } from "@/services/api";
import NewsTicker from "@/components/NewsTicker";
import { Send, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import zcuLogo from "@/assets/zcu-logo.png";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  source?: string;
  timestamp: number;
}

const QUICK_QUESTIONS = [
  "Tell me about admissions",
  "What programs do you offer?",
  "How much are the fees?",
  "Where is ZCU located?",
];

const STORAGE_KEY = "zucia_chat";

const ChatbotPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onNewChat = () => {
      setMessages([]);
      setInput("");
      localStorage.removeItem(STORAGE_KEY);
    };
    window.addEventListener("zcu:new-chat", onNewChat);
    return () => window.removeEventListener("zcu:new-chat", onNewChat);
  }, []);

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || isTyping) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: q, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    try {
      const reply = await zuciaApi.ask(q);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          content: reply.answer,
          source: reply.source,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "bot",
          content:
            "I couldn't reach the ZCU ChatBot service. Please verify the backend is running and try again.\n\n" +
            (err instanceof Error ? `(${err.message})` : ""),
          source: "Error",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <NewsTicker />

      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-background p-1 border border-border flex items-center justify-center">
            <img src={zcuLogo} alt="ZCU" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">ZCU ChatBot</h1>
            <p className="text-xs text-muted-foreground">Veritas Vos Liberabit · Campus Assistant</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          title="Clear chat"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl zcu-gradient mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-2xl text-foreground mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Ask me anything about Zambia Catholic University.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground hover:border-accent hover:bg-accent/5 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.source && msg.role === "bot" && (
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/15 text-accent-foreground/80 font-semibold">
                    {msg.source}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble-bot flex items-center gap-1.5 px-5 py-4">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 md:px-8 border-t border-border bg-card">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the ZCU ChatBot anything…"
            disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-accent text-accent-foreground hover:brightness-105 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
