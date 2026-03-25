import { useState, useMemo } from "react";
import { mockMaterials, type CourseMaterial } from "@/constants/zcuData";
import FileCard from "@/components/FileCard";
import ChatPDFModal from "@/components/ChatPDFModal";
import { Filter, Search } from "lucide-react";

const StudentDashboard = () => {
  const [year, setYear] = useState<number | "all">("all");
  const [semester, setSemester] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [loading] = useState(false);
  const [chatFile, setChatFile] = useState<CourseMaterial | null>(null);

  const filtered = useMemo(() => {
    return mockMaterials.filter((m) => {
      if (year !== "all" && m.year !== year) return false;
      if (semester !== "all" && m.semester !== semester) return false;
      if (search && !m.subject.toLowerCase().includes(search.toLowerCase()) && !m.filename.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [year, semester, search]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Course Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and study your course materials</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={String(year)}
          onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="all">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>
        <select
          value={String(semester)}
          onChange={(e) => setSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="all">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
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

      {/* Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-4" />
              <div className="flex gap-2">
                <div className="h-8 bg-muted rounded w-20" />
                <div className="h-8 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No materials found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((material) => (
            <FileCard key={material.id} material={material} onChatPDF={() => setChatFile(material)} />
          ))}
        </div>
      )}

      {chatFile && (
        <ChatPDFModal file={chatFile} onClose={() => setChatFile(null)} />
      )}
    </div>
  );
};

export default StudentDashboard;
