import { type CourseMaterial } from "@/constants/zcuData";
import { FileText, Eye, MessageSquare, Calendar } from "lucide-react";

interface FileCardProps {
  material: CourseMaterial;
  onChatPDF: () => void;
}

const FileCard = ({ material, onChatPDF }: FileCardProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 zcu-card-hover">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-foreground truncate">{material.subject}</h3>
          <p className="text-xs text-muted-foreground truncate">{material.filename}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{material.description}</p>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`badge-year-${material.year} text-xs px-2.5 py-0.5 rounded-full font-medium`}>Year {material.year}</span>
        <span className={`badge-sem-${material.semester} text-xs px-2.5 py-0.5 rounded-full font-medium`}>Sem {material.semester}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
          <Calendar className="w-3 h-3" />{material.upload_date}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-all">
          <Eye className="w-3.5 h-3.5" /> View PDF
        </button>
        <button
          onClick={onChatPDF}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Chat with PDF
        </button>
      </div>

      <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
        <Eye className="w-3 h-3" /> {material.view_count} views
      </div>
    </div>
  );
};

export default FileCard;
