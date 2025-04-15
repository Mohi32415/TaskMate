import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "../lib/useLocalStorage";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type SyncContextType = {
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  syncNow: () => Promise<void>;
  offlineData: any[];
  addOfflineData: (item: any) => void;
};

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  // Get user safely
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (e) {
    console.log("Auth context not available in SyncProvider");
  }
  
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useLocalStorage<string | null>("last-synced", null);
  const [offlineData, setOfflineData] = useLocalStorage<any[]>("offline-data", []);
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Add new item to offline data
  const addOfflineData = useCallback((item: any) => {
    setOfflineData(prev => [...prev, { ...item, timestamp: new Date().toISOString() }]);
  }, [setOfflineData]);
  
  // Sync offline data when back online
  const syncOfflineData = useCallback(async () => {
    if (!user || !isOnline || offlineData.length === 0) return;
    
    setIsSyncing(true);
    
    try {
      // Here we would process each offline item
      // For example, if we have task progress:
      for (const item of offlineData) {
        if (item.type === 'task_progress') {
          await apiRequest('POST', `/api/tasks/${item.taskId}/progress`, {
            value: item.value,
            date: item.date,
            synced: true
          });
        } else if (item.type === 'challenge_progress') {
          await apiRequest('POST', `/api/challenges/${item.challengeId}/progress`, {
            value: item.value,
            date: item.date,
            synced: true
          });
        } else if (item.type === 'chat_message') {
          await apiRequest('POST', `/api/challenges/${item.challengeId}/messages`, {
            content: item.content,
            synced: true
          });
        }
      }
      
      // Clear offline data after successful sync
      setOfflineData([]);
      
      // Update last synced time
      const now = new Date().toISOString();
      setLastSynced(now);
      
      toast({
        title: "Sync completed",
        description: `${offlineData.length} items synchronized`
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Could not synchronize offline data",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, isOnline, offlineData, setOfflineData, setLastSynced, toast]);
  
  // Manual sync
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: "Cannot sync",
        description: "You are currently offline",
        variant: "destructive"
      });
      return;
    }
    
    await syncOfflineData();
    
    // Update last synced time even if there was no offline data
    if (offlineData.length === 0) {
      const now = new Date().toISOString();
      setLastSynced(now);
      
      toast({
        title: "Sync completed",
        description: "All data is up to date"
      });
    }
  }, [isOnline, syncOfflineData, offlineData.length, setLastSynced, toast]);
  
  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineData.length > 0) {
      syncOfflineData();
    }
  }, [isOnline, offlineData.length, syncOfflineData]);
  
  // Parse last synced date
  const lastSyncedDate = lastSynced ? new Date(lastSynced) : null;
  
  return (
    <SyncContext.Provider 
      value={{ 
        isOnline, 
        isSyncing, 
        lastSynced: lastSyncedDate, 
        syncNow, 
        offlineData,
        addOfflineData
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
