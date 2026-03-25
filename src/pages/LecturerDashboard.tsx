import { useState, useCallback } from "react";
import { mockMaterials, type CourseMaterial } from "@/constants/zcuData";
import UploadZone from "@/components/UploadZone";
import { Trash2, Download, Eye, FileText, Plus, Upload as UploadIcon, Tag, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface KnowledgeEntry {
  id: number;
  title: string;
  content: string;
  source_type: string;
  tags: string[];
  date_added: string;
}

const LecturerDashboard = () => {
  const [files, setFiles] = useState<CourseMaterial[]>([...mockMaterials]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [description, setDescription] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Knowledge Base
  const [kbTab, setKbTab] = useState<"text" | "upload">("text");
  const [kbTitle, setKbTitle] = useState("");
  const [kbContent, setKbContent] = useState("");
  const [kbTags, setKbTags] = useState("");
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([
    { id: 1, title: "IT Department Welcome Note", content: "Welcome to the ZCU IT Department...", source_type: "text", tags: ["IT", "support"], date_added: "2025-01-01" },
  ]);

  const handleFileDrop = useCallback((file: File) => {
    setPendingFile(file);
  }, []);

  const handleUpload = () => {
    if (!pendingFile || !subject.trim()) {
      toast({ title: "Error", description: "Please select a file and enter subject name", variant: "destructive" });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const newFile: CourseMaterial = {
            id: String(Date.now()),
            filename: `${subject.replace(/\s+/g, "_")}_${year}yr_${semester}sem_${Date.now()}.pdf`,
            subject,
            year: Number(year),
            semester: Number(semester),
            description,
            upload_date: new Date().toISOString().split("T")[0],
            view_count: 0,
          };
          setFiles((prev) => [newFile, ...prev]);
          setPendingFile(null);
          setSubject("");
          setDescription("");
          setUploading(false);
          toast({ title: "Success", description: "File uploaded successfully!" });
          return 0;
        }
        return p + 10;
      });
    }, 200);
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast({ title: "Deleted", description: "File removed successfully" });
  };

  const addKnowledgeText = () => {
    if (!kbTitle.trim() || !kbContent.trim()) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }
    const entry: KnowledgeEntry = {
      id: Math.max(0, ...knowledgeEntries.map((e) => e.id)) + 1,
      title: kbTitle,
      content: kbContent,
      source_type: "text",
      tags: kbTags.split(",").map((t) => t.trim()).filter(Boolean),
      date_added: new Date().toISOString().split("T")[0],
    };
    setKnowledgeEntries((prev) => [...prev, entry]);
    setKbTitle("");
    setKbContent("");
    setKbTags("");
    toast({ title: "Success", description: "Knowledge entry added!" });
  };

  const handleKbFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "txt" && ext !== "docx") {
      toast({ title: "Error", description: "Only .txt and .docx files are supported", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const entry: KnowledgeEntry = {
        id: Math.max(0, ...knowledgeEntries.map((e) => e.id)) + 1,
        title: file.name.replace(/\.(txt|docx)$/, ""),
        content: content.substring(0, 5000),
        source_type: "document",
        tags: ["uploaded"],
        date_added: new Date().toISOString().split("T")[0],
      };
      setKnowledgeEntries((prev) => [...prev, entry]);
      toast({ title: "Success", description: "Document uploaded and added to knowledge base!" });
    };
    reader.readAsText(file);
  };

  const deleteKnowledge = (id: number) => {
    setKnowledgeEntries((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Deleted", description: "Knowledge entry removed" });
  };

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Lecturer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload materials and manage knowledge base</p>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <UploadIcon className="w-5 h-5 text-primary" /> Upload Course Material
        </h2>
        <UploadZone onFile={handleFileDrop} currentFile={pendingFile} />
        {pendingFile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject Name *" className="px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <div className="flex gap-3">
              <select value={year} onChange={(e) => setYear(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
              </select>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="1">Semester 1</option><option value="2">Semester 2</option>
              </select>
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description / Notes" rows={2} className="md:col-span-2 px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
            <div className="md:col-span-2">
              {uploading && (
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              <button onClick={handleUpload} disabled={uploading} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                <Plus className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Material"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Uploaded Materials ({files.length})</h2>
        <div className="space-y-3">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-all">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{f.subject}</p>
                <p className="text-xs text-muted-foreground">{f.filename} · {f.upload_date}</p>
              </div>
              <span className={`badge-year-${f.year} text-xs px-2 py-0.5 rounded-full font-medium`}>Y{f.year}</span>
              <span className={`badge-sem-${f.semester} text-xs px-2 py-0.5 rounded-full font-medium`}>S{f.semester}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" />{f.view_count}</span>
              <button className="text-muted-foreground hover:text-primary transition-colors"><Download className="w-4 h-4" /></button>
              <button onClick={() => deleteFile(f.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Knowledge Base Manager</h2>
        <p className="text-sm text-muted-foreground">
          Knowledge Base: <strong>{knowledgeEntries.length}</strong> entries | Last updated: <strong>{knowledgeEntries.length > 0 ? knowledgeEntries[knowledgeEntries.length - 1].date_added : "N/A"}</strong>
        </p>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted p-1 w-fit">
          <button onClick={() => setKbTab("text")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${kbTab === "text" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
            Paste Text
          </button>
          <button onClick={() => setKbTab("upload")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${kbTab === "upload" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
            Upload Document
          </button>
        </div>

        {kbTab === "text" ? (
          <div className="space-y-3">
            <input value={kbTitle} onChange={(e) => setKbTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <textarea value={kbContent} onChange={(e) => setKbContent(e.target.value)} placeholder="Paste ZCU information here..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
            <input value={kbTags} onChange={(e) => setKbTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <button onClick={addKnowledgeText} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Save Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all">
              <UploadIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Upload .txt or .docx file</span>
              <input type="file" accept=".txt,.docx" onChange={handleKbFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* Knowledge Entries List */}
        <div className="space-y-2 pt-4 border-t border-border">
          {knowledgeEntries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">{entry.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.source_type === "text" ? "bg-primary/10 text-primary" : "bg-secondary/30 text-secondary-foreground"}`}>
                    {entry.source_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{entry.tags.join(", ")}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.date_added}</span>
                </div>
              </div>
              <button onClick={() => deleteKnowledge(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
