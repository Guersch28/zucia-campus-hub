import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface UploadZoneProps {
  onFile: (file: File) => void;
  currentFile: File | null;
}

const UploadZone = ({ onFile, currentFile }: UploadZoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const validateAndSet = useCallback((file: File) => {
    setError("");
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB");
      return;
    }
    onFile(file);
  }, [onFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }, [validateAndSet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  if (currentFile) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
        <FileText className="w-8 h-8 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{currentFile.name}</p>
          <p className="text-xs text-muted-foreground">{(currentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          dragOver ? "border-primary bg-primary/5" : "border-input hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <Upload className={`w-10 h-10 mb-2 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">PDF only, max 20MB</p>
        <input type="file" accept=".pdf" onChange={handleChange} className="hidden" />
      </label>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default UploadZone;
