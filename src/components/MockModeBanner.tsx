import { useEffect, useState } from "react";
import { isBackendDown } from "@/services/mockBackend";
import { Info, X } from "lucide-react";

const MockModeBanner = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("mock_banner_dismissed") === "1",
  );

  useEffect(() => {
    const tick = () => setVisible(isBackendDown());
    tick();
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw]">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent/95 text-accent-foreground shadow-lg border border-accent/40 backdrop-blur">
        <Info className="w-4 h-4 shrink-0" />
        <p className="text-xs md:text-sm">
          Demo mode — FastAPI backend not reachable, using in-browser data so you can test every flow.
        </p>
        <button
          onClick={() => {
            sessionStorage.setItem("mock_banner_dismissed", "1");
            setDismissed(true);
          }}
          className="p-1 rounded-md hover:bg-accent-foreground/10 transition-all"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MockModeBanner;
