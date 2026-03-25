import { type CourseMaterial } from "@/constants/zcuData";
import { FileText, Eye, MessageSquare, Calendar } from "lucide-react";

interface FileCardProps {
  material: CourseMaterial;
  onChatPDF: () => void;
}

const FileCard = ({ material, onChatPDF }: FileCardProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 zcu-card-hover group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-foreground truncate">{material.subject}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{material.filename}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{material.description}</p>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`badge-year-${material.year} text-[11px] px-2.5 py-1 rounded-lg`}>Year {material.year}</span>
        <span className={`badge-sem-${material.semester} text-[11px] px-2.5 py-1 rounded-lg`}>Sem {material.semester}</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
          <Calendar className="w-3 h-3" />{material.upload_date}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/20 transition-all">
          <Eye className="w-3.5 h-3.5" /> View PDF
        </button>
        <button
          onClick={onChatPDF}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all shadow-sm shadow-primary/15"
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
