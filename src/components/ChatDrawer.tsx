import { useState, useRef, useEffect } from "react";
import { matchZcuKeyword } from "@/constants/zcuData";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import zcuLogo from "@/assets/zcu-logo.png";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  source?: string;
}

const ChatDrawer = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), role: "user", content: text.trim() }]);
    setInput("");
    setIsTyping(true);

    const localAnswer = matchZcuKeyword(text);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "bot",
          content: localAnswer || `Thanks for asking! For detailed information, please visit our ZCU ChatBot page or contact info@zcu.ac.zm.`,
          source: localAnswer ? "Knowledge Base" : "AI",
        },
      ]);
      setIsTyping(false);
      if (!open) setUnread((u) => u + 1);
    }, localAnswer ? 300 : 1000);
  };

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setOpen(true); setUnread(0); }}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
          >
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="zcu-gradient p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary-foreground p-0.5 flex items-center justify-center">
                  <img src={zcuLogo} alt="ZCU" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">ZCU ChatBot</p>
                  <p className="text-[10px] text-primary-foreground/70">Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground transition-all">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  👋 Hi! Ask me anything about ZCU.
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
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="p-3 border-t border-border flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask ZCU ChatBot..."
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <button type="submit" disabled={!input.trim()} className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatDrawer;
