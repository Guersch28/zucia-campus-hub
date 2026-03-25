import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, GraduationCap, BookOpen, Sparkles, Shield } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);
      if (result.success) {
        navigate(role === "student" ? "/student" : "/lecturer");
      } else {
        setError(result.error || "Login failed");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 zcu-hero-gradient relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl" />
          <div className="absolute bottom-32 right-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-primary-foreground/5 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 mb-8">
              <span className="text-3xl font-serif font-bold text-primary-foreground">ZCU</span>
            </div>

            <h1 className="text-5xl font-serif font-bold text-primary-foreground leading-tight mb-4">
              Zambia Catholic<br />University
            </h1>
            <p className="text-primary-foreground/60 text-lg italic font-serif mb-10">
              Veritas et Lux — Truth and Light
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-primary-foreground font-medium text-sm">AI-Powered Assistant</p>
                  <p className="text-primary-foreground/50 text-xs">ZUCIA helps you with instant answers</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-primary-foreground font-medium text-sm">Course Materials</p>
                  <p className="text-primary-foreground/50 text-xs">Access PDFs and study resources</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-primary-foreground font-medium text-sm">Secure Platform</p>
                  <p className="text-primary-foreground/50 text-xs">Role-based access for students & lecturers</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl zcu-gradient mb-4">
              <span className="text-2xl font-serif font-bold text-primary-foreground">ZCU</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-foreground">Zambia Catholic University</h1>
            <p className="text-muted-foreground text-xs italic mt-1">Veritas et Lux</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to <span className="text-primary font-semibold">ZUCIA</span> to continue
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-xl bg-muted p-1.5 mb-6">
            <button
              type="button"
              onClick={() => { setRole("student"); setUsername(""); setPassword(""); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === "student"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => { setRole("lecturer"); setUsername(""); setPassword(""); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === "lecturer"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Lecturer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                placeholder={`Enter ${role} username`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-12 text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 px-4 py-3 rounded-xl border border-destructive/15"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-muted/60 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Student</p>
                <p className="text-muted-foreground">user: <span className="text-foreground font-mono">student</span></p>
                <p className="text-muted-foreground">pass: <span className="text-foreground font-mono">student123</span></p>
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Lecturer</p>
                <p className="text-muted-foreground">user: <span className="text-foreground font-mono">lecturer</span></p>
                <p className="text-muted-foreground">pass: <span className="text-foreground font-mono">ITT2025</span></p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">
            © {new Date().getFullYear()} Zambia Catholic University. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
