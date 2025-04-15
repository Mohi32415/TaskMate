import { useSync } from "@/hooks/use-sync";
import { useLanguage } from "@/hooks/use-language";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  // Safely get sync and language contexts
  let isOnline = true;
  let t = (key: string) => key;
  
  try {
    const sync = useSync();
    isOnline = sync.isOnline;
  } catch (e) {
    console.log("Sync context not available in OfflineIndicator");
  }
  
  try {
    const lang = useLanguage();
    t = lang.t;
  } catch (e) {
    console.log("Language context not available in OfflineIndicator");
  }
  
  if (isOnline) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 p-2 bg-amber-500 text-white text-center z-50 animate-pulse">
      <p className="text-sm font-medium">
        <WifiOff className="inline-block mr-2 h-4 w-4" /> 
        {t("offline.message")}
      </p>
    </div>
  );
}
