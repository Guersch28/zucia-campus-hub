import { useEffect, useState, useCallback } from "react";
import { filesApi, type CourseFile } from "@/services/api";
import {
  Trash2, Download, FileText, Plus, Upload as UploadIcon,
  Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import UploadZone from "@/components/UploadZone";

const LecturerDashboard = () => {
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.list();
      setFiles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async () => {
    if (!pendingFile) {
      toast({ title: "Please choose a PDF file", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      await filesApi.upload(pendingFile, year, semester);
      toast({ title: "Uploaded", description: "Material uploaded successfully." });
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
    if (!confirm("Delete this file? This cannot be undone.")) return;
    try {
      await filesApi.delete(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "Deleted", description: "File removed." });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl text-foreground">Lecturer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload course materials and manage uploaded PDFs.
        </p>
      </header>

      {/* Upload card */}
      <section className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <UploadIcon className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Upload Course Material</h2>
        </div>

        <UploadZone onFile={setPendingFile} currentFile={pendingFile} />

        {pendingFile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {["1", "2", "3", "4"].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {["1", "2"].map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                  : <><Plus className="w-4 h-4" /> Upload</>}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Files list */}
      <section className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Uploaded Materials <span className="text-muted-foreground font-normal">({files.length})</span>
          </h2>
          {!loading && !error && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4 mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Backend unavailable</p>
              <p className="text-xs opacity-80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No files uploaded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/40 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{f.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(f.uploaded_at).toLocaleString()}
                  </p>
                </div>
                <span className={`badge-year-${f.year} text-xs px-2 py-0.5 rounded-full hidden sm:inline`}>Y{f.year}</span>
                <span className={`badge-sem-${f.semester} text-xs px-2 py-0.5 rounded-full hidden sm:inline`}>S{f.semester}</span>
                <a
                  href={filesApi.downloadUrl(f.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LecturerDashboard;
