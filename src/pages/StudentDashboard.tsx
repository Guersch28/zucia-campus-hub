import { useEffect, useState, useCallback } from "react";
import { filesApi, type CourseFile } from "@/services/api";
import { Filter, Search, Download, FileText, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import ChatPDFModal from "@/components/ChatPDFModal";

const YEARS = ["1", "2", "3", "4"];
const SEMS = ["1", "2"];

function formatSize(bytes: number) {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const StudentDashboard = () => {
  const [year, setYear] = useState<string>("all");
  const [semester, setSemester] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatFile, setChatFile] = useState<CourseFile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.list(year, semester);
      setFiles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, [year, semester]);

  useEffect(() => { load(); }, [load]);

  const filtered = files.filter((f) =>
    !search || f.filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl text-foreground">Course Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse, download and chat with your lecture PDFs.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="all">All Years</option>
          {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="all">All Semesters</option>
          {SEMS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Could not connect to backend</p>
            <p className="text-xs opacity-80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading materials…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold">No materials found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((file) => (
            <article
              key={file.id}
              className="bg-card rounded-2xl border border-border p-5 zcu-card-hover flex flex-col"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate" title={file.filename}>
                    {file.filename}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(file.uploaded_at).toLocaleDateString()} · {formatSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`badge-year-${file.year} text-xs px-2.5 py-1 rounded-full`}>Year {file.year}</span>
                <span className={`badge-sem-${file.semester} text-xs px-2.5 py-1 rounded-full`}>Sem {file.semester}</span>
              </div>

              <div className="flex gap-2 mt-auto">
                <a
                  href={filesApi.downloadUrl(file.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <button
                  onClick={() => setChatFile(file)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:brightness-105 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Ask AI
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {chatFile && <ChatPDFModal file={chatFile} onClose={() => setChatFile(null)} />}
    </div>
  );
};

export default StudentDashboard;
