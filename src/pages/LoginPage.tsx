import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, GraduationCap, BookOpen, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [role, setRole] = useState<"student" | "lecturer">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);
    if (result.success) {
      navigate(result.role === "lecturer" ? "/lecturer" : "/student");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 zcu-hero-gradient relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-accent-foreground mb-8 font-bold text-xl shadow-lg shadow-accent/30">
              ZCU
            </div>

            <h1 className="text-5xl text-primary-foreground leading-tight mb-3">
              Zambia Catholic<br />University
            </h1>
            <p className="text-primary-foreground/60 text-base mb-12">
              Veritas et Lux · Truth and Light
            </p>

            <div className="space-y-5 max-w-sm">
              {[
                { icon: Sparkles, title: "ZUCIA Assistant", desc: "AI-powered answers about the university" },
                { icon: BookOpen, title: "Course Materials", desc: "Browse, download and chat with PDFs" },
                { icon: ShieldCheck, title: "Role-based Access", desc: "Tailored experience for students & lecturers" },
              ].map((f) => (
                <div key={f.title} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-primary-foreground font-semibold text-sm">{f.title}</p>
                    <p className="text-primary-foreground/50 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl zcu-gradient text-primary-foreground font-bold mb-3">
              ZCU
            </div>
            <h1 className="text-xl font-bold text-foreground">Zambia Catholic University</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to <span className="text-foreground font-semibold">ZUCIA</span> to continue
            </p>
          </div>

          <div className="flex rounded-xl bg-muted p-1 mb-6">
            {(["student", "lecturer"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "student" ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {r === "student" ? "Student" : "Lecturer"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`Enter ${role} username`}
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/15"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-muted/60 border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-foreground">Student</p>
                <p className="text-muted-foreground">user: <span className="font-mono text-foreground">student</span></p>
                <p className="text-muted-foreground">pass: <span className="font-mono text-foreground">student123</span></p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Lecturer</p>
                <p className="text-muted-foreground">user: <span className="font-mono text-foreground">lecturer</span></p>
                <p className="text-muted-foreground">pass: <span className="font-mono text-foreground">ITT2025</span></p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">
            © {new Date().getFullYear()} Zambia Catholic University
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
