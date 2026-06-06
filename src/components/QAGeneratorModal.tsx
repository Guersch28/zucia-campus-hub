import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, RefreshCw, ChevronDown, FileText } from "lucide-react";
import { filesApi, type CourseFile, type QAQuestion } from "@/services/api";

interface Props {
  file: CourseFile;
  onClose: () => void;
}

type QAType = "mcq" | "short" | "tf";

const TYPES: { value: QAType; label: string }[] = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "short", label: "Short Answer" },
  { value: "tf", label: "True or False" },
];

const QAGeneratorModal = ({ file, onClose }: Props) => {
  const [type, setType] = useState<QAType>("mcq");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const generate = async () => {
    setLoading(true);
    setRevealed({});
    try {
      const r = await filesApi.generateQA(file.id, type, count);
      setQuestions(r.questions);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
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
          className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden border border-border"
        >
          <header className="flex items-center justify-between gap-3 p-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl zcu-gradient text-accent flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">Q&amp;A Generator</p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {file.filename}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </header>

          <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QAType)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase">Count</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="ml-auto px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : questions.length
                  ? <><RefreshCw className="w-4 h-4" /> Regenerate</>
                  : <><Sparkles className="w-4 h-4" /> Generate</>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!questions.length && !loading && (
              <div className="text-center py-16 text-sm text-muted-foreground">
                Choose a question type and click <strong>Generate</strong> to create practice questions from this document.
              </div>
            )}
            {questions.map((q, idx) => {
              const open = revealed[q.id];
              return (
                <div key={q.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xs font-bold text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full shrink-0">Q{idx + 1}</span>
                    <p className="text-sm font-medium text-foreground">{q.question}</p>
                  </div>

                  {q.type === "mcq" && q.options && (
                    <ul className="space-y-1.5 mb-3 ml-1">
                      {q.options.map((opt, i) => (
                        <li key={i} className={`text-sm px-3 py-2 rounded-lg border ${
                          open && opt === q.answer
                            ? "border-primary bg-primary/10 text-foreground font-medium"
                            : "border-border text-muted-foreground"
                        }`}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [q.id]: !r[q.id] }))}
                    className="text-xs font-semibold text-accent-foreground/80 hover:text-primary inline-flex items-center gap-1"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
                    {open ? "Hide answer" : "Reveal answer"}
                  </button>

                  {open && (
                    <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-foreground"><strong>Answer:</strong> {q.answer}</p>
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QAGeneratorModal;
