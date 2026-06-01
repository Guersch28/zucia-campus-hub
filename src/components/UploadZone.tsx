import { useCallback, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

interface Props {
  onFile: (file: File | null) => void;
  currentFile: File | null;
  maxSizeMB?: number;
}

const UploadZone = ({ onFile, currentFile, maxSizeMB = 20 }: Props) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    (f: File | undefined | null) => {
      setError(null);
      if (!f) return;
      if (!f.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are allowed.");
        return;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds the ${maxSizeMB} MB limit.`);
        return;
      }
      onFile(f);
    },
    [onFile, maxSizeMB],
  );

  if (currentFile) {
    return (
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-muted/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(currentFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={() => onFile(null)}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`flex flex-col items-center justify-center w-full py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-input hover:border-accent/60 hover:bg-muted/40"
        }`}
      >
        <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          Drag & drop a PDF or <span className="text-accent">browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Max {maxSizeMB} MB</p>
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </label>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default UploadZone;
