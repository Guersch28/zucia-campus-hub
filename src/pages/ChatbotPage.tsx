import { useState, useRef, useEffect } from "react";
import { matchZcuKeyword } from "@/constants/zcuData";
import NewsTicker from "@/components/NewsTicker";
import { Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  source?: "ZCU Knowledge Base" | "AI Response";
  timestamp: number;
}

const QUICK_QUESTIONS = ["Admissions", "Fees", "Programs", "Campus Life", "Contact Us"];

const ChatbotPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("zucia_chat");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("zucia_chat", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", content: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Check local knowledge first
    const localAnswer = matchZcuKeyword(text);
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "bot",
        content: localAnswer || `Thank you for your question about "${text}". As ZUCIA, I'm here to help! For detailed information, please contact ZCU at info@zcu.ac.zm or call +260 211 123456. You can also visit our campus at Mpanshya Road, Lusaka.`,
        source: localAnswer ? "ZCU Knowledge Base" : "AI Response",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, localAnswer ? 400 : 1200);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("zucia_chat");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in">
      <NewsTicker />

      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full zcu-gradient flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">Z</span>
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-foreground">ZUCIA</h1>
            <p className="text-xs text-muted-foreground">ZCU Intelligent Campus Assistant</p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-all" title="Clear chat">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full zcu-gradient mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-serif font-bold text-primary-foreground">Z</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Welcome to ZUCIA!</h2>
            <p className="text-muted-foreground text-sm mb-6">Ask me anything about Zambia Catholic University</p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(`Tell me about ${q.toLowerCase()}`)}
                  className="px-4 py-2 rounded-full border border-border bg-card text-sm text-foreground hover:border-primary hover:bg-primary/5 transition-all"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.source && (
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    msg.source === "ZCU Knowledge Base" ? "bg-primary/10 text-primary" : "bg-secondary/20 text-secondary-foreground"
                  }`}>
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
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Questions (when has messages) */}
      {messages.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(`Tell me about ${q.toLowerCase()}`)}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-all whitespace-nowrap shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ZUCIA anything about ZCU..."
            className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
