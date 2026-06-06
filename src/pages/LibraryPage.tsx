import { useEffect, useState, useCallback, useMemo } from "react";
import { filesApi, type CourseFile } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  FileText, Search, Filter, MessageSquare, Sparkles, Eye, Download,
  Upload as UploadIcon, Loader2, Trash2, AlertCircle, Plus, BookOpen,
} from "lucide-react";
import ChatPDFModal from "@/components/ChatPDFModal";
import QAGeneratorModal from "@/components/QAGeneratorModal";
import UploadZone from "@/components/UploadZone";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

function formatSize(bytes: number) {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const LibraryPage = () => {
  const { user } = useAuth();
  const isLecturer = user?.role === "lecturer";

  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [groupBy, setGroupBy] = useState<"year" | "semester" | "date">("year");
  const [search, setSearch] = useState("");

  const [chatFile, setChatFile] = useState<CourseFile | null>(null);
  const [qaFile, setQaFile] = useState<CourseFile | null>(null);
  const [previewFile, setPreviewFile] = useState<CourseFile | null>(null);

  // upload state (lecturer)
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFiles(await filesApi.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () =>
      files.filter((f) => !search || f.filename.toLowerCase().includes(search.toLowerCase())),
    [files, search],
  );

  const groups = useMemo(() => {
    const map = new Map<string, CourseFile[]>();
    for (const f of filtered) {
      let key: string;
      if (groupBy === "year") key = `Year ${f.year}`;
      else if (groupBy === "semester") key = `Semester ${f.semester}`;
      else key = new Date(f.uploaded_at).toLocaleDateString();
      const arr = map.get(key) ?? [];
      arr.push(f);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      await filesApi.upload(pendingFile, year, semester);
      toast({ title: "Uploaded", description: "Material is now visible to students." });
      setPendingFile(null);
      await load();
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    try {
      await filesApi.delete(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "Deleted" });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl zcu-gradient flex items-center justify-center text-accent shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl text-foreground">Library</h1>
          <p className="text-muted-foreground text-sm">
            {isLecturer
              ? "Upload, manage, and chat with your course materials."
              : "Browse, preview, chat with, and generate Q&A from your course materials."}
          </p>
        </div>
      </header>

      {/* Lecturer upload section */}
      {isLecturer && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full bg-card rounded-2xl border border-border p-4 hover:bg-muted/30 transition-all group">
            <div className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-accent" />
              <h2 className="text-base font-semibold text-foreground">Upload Material</h2>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 bg-card rounded-2xl border border-border p-5 space-y-4">
            <UploadZone onFile={setPendingFile} currentFile={pendingFile} />
            {pendingFile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Year</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                    {["1", "2", "3", "4"].map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Semester</label>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm">
                    {["1", "2"].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                      : <><Plus className="w-4 h-4" /> Upload</>}
                  </button>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        >
          <option value="year">Group by Year</option>
          <option value="semester">Group by Semester</option>
          <option value="date">Group by Date</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading library…
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold">Library is empty</h3>
          <p className="text-muted-foreground text-sm">
            {isLecturer ? "Upload your first material above." : "No materials available yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([groupName, items]) => (
            <Collapsible key={groupName} defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full bg-card rounded-xl border border-border px-4 py-3 hover:bg-muted/30 group">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{groupName}</h3>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((file) => (
                  <article
                    key={file.id}
                    className="bg-card rounded-2xl border border-border p-4 zcu-card-hover flex flex-col"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate" title={file.filename}>
                          {file.filename}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {isLecturer ? user?.username : "lecturer"} · {new Date(file.uploaded_at).toLocaleDateString()} · {formatSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className={`badge-year-${file.year} text-[10px] px-2 py-0.5 rounded-full`}>Y{file.year}</span>
                      <span className={`badge-sem-${file.semester} text-[10px] px-2 py-0.5 rounded-full`}>S{file.semester}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">PDF</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-auto">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => setChatFile(file)}
                        className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {isLecturer ? "Chat" : "Ask AI"}
                      </button>
                      {!isLecturer && (
                        <button
                          onClick={() => setQaFile(file)}
                          className="col-span-2 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:brightness-105"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Generate Q&amp;A
                        </button>
                      )}
                      {isLecturer && (
                        <>
                          <a
                            href={filesApi.downloadUrl(file.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {chatFile && <ChatPDFModal file={chatFile} onClose={() => setChatFile(null)} />}
      {qaFile && <QAGeneratorModal file={qaFile} onClose={() => setQaFile(null)} />}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-border"
          >
            <header className="flex items-center justify-between gap-3 p-4 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm font-semibold text-foreground truncate">{previewFile.filename}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">✕</button>
            </header>
            <div className="flex-1 bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground max-w-md">
                Inline preview opens when the FastAPI backend is connected. In demo mode use{" "}
                <strong>Ask AI</strong> or <strong>Generate Q&amp;A</strong> to interact with this document.
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setChatFile(previewFile); setPreviewFile(null); }}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                >
                  <MessageSquare className="w-4 h-4 inline mr-1.5" /> Chat with this Paper
                </button>
                {!isLecturer && (
                  <button
                    onClick={() => { setQaFile(previewFile); setPreviewFile(null); }}
                    className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold"
                  >
                    <Sparkles className="w-4 h-4 inline mr-1.5" /> Generate Q&amp;A
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
