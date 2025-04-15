import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  type: "tasks" | "challenges";
  onAction: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed bg-muted/40 min-h-[300px]">
      <div className="flex flex-col items-center text-center">
        <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <PlusCircle className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-xl font-medium mb-2">
          {type === "tasks" 
            ? t("emptyState.noTasksTitle") 
            : t("emptyState.noChallengesTitle")}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          {type === "tasks" 
            ? t("emptyState.noTasksDescription") 
            : t("emptyState.noChallengesDescription")}
        </p>
        
        <Button onClick={onAction}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {type === "tasks" 
            ? t("emptyState.createTask") 
            : t("emptyState.createChallenge")}
        </Button>
      </div>
    </div>
  );
}