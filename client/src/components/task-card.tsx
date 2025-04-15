import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useSync } from "@/hooks/use-sync";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Task, TaskProgress, Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/progress-ring";
import { MoreVertical, Repeat, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TaskCardProps {
  task: Task;
  category?: Category;
  isUpcoming?: boolean;
  onDelete?: (taskId: number) => void;
}

export function TaskCard({ task, category, isUpcoming = false, onDelete }: TaskCardProps) {
  const { t } = useLanguage();
  const { isOnline, addOfflineData } = useSync();
  const queryClient = useQueryClient();
  const today = new Date();
  
  const [progressValue, setProgressValue] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  
  // Query task progress for today
  const { data: progressData } = useQuery({
    queryKey: ["/api/tasks", task.id, "progress"],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}/progress`);
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
    enabled: !isUpcoming
  });
  
  // Find today's progress
  useEffect(() => {
    if (progressData && !isUpcoming) {
      const todayProgress = progressData.find((p: TaskProgress) => {
        const progressDate = new Date(p.date);
        return (
          progressDate.getDate() === today.getDate() &&
          progressDate.getMonth() === today.getMonth() &&
          progressDate.getFullYear() === today.getFullYear()
        );
      });
      
      if (todayProgress) {
        setProgressValue(todayProgress.value);
        setFeedback(todayProgress.feedback || "");
      }
    }
  }, [progressData, isUpcoming, today]);
  
  // Check if task is scheduled for today
  const isTaskForToday = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayDay = days[today.getDay()];
    return task.schedule[todayDay as keyof typeof task.schedule];
  };
  
  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (value: number) => {
      const payload = {
        value,
        date: today.toISOString(),
        synced: isOnline
      };
      
      if (!isOnline) {
        // Store for later sync
        addOfflineData({
          type: 'task_progress',
          taskId: task.id,
          ...payload
        });
        return { value, feedback: getFeedback(value) };
      }
      
      const res = await apiRequest("POST", `/api/tasks/${task.id}/progress`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task.id, "progress"] });
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (onDelete) onDelete(task.id);
    }
  });
  
  // Get feedback based on progress value
  const getFeedback = (value: number): string => {
    if (value >= task.unitValue * 1.5) {
      return t("tasks.feedback.wow");
    } else if (value >= task.unitValue) {
      return t("tasks.feedback.goal");
    } else if (value >= task.unitValue * 0.75) {
      return t("tasks.feedback.almost");
    } else if (value >= task.unitValue * 0.5) {
      return t("tasks.feedback.keep");
    } else {
      return t("tasks.feedback.started");
    }
  };
  
  // Format schedule days
  const formatSchedule = () => {
    const schedule = task.schedule;
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const selectedDays = days.filter(day => schedule[day as keyof typeof schedule]);
    
    if (selectedDays.length === 7) {
      return t("schedule.everyday");
    } else if (selectedDays.length === 5 && 
              schedule.monday && schedule.tuesday && schedule.wednesday && 
              schedule.thursday && schedule.friday) {
      return t("schedule.weekdays");
    } else if (selectedDays.length === 2 && schedule.saturday && schedule.sunday) {
      return t("schedule.weekends");
    } else {
      return selectedDays
        .map(day => t(`schedule.day.${day.substring(0, 3)}`))
        .join(", ");
    }
  };
  
  // Handle value change and update
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setProgressValue(isNaN(value) ? 0 : value);
  };
  
  const handleValueBlur = () => {
    if (progressValue !== 0) {
      updateProgressMutation.mutate(progressValue);
    }
  };
  
  // Get category icon
  const getCategoryIcon = () => {
    return category?.icon || "fa-list";
  };
  
  // Get category name
  const getCategoryName = () => {
    return category?.name || t("category.other");
  };
  
  // Get category color class
  const getCategoryColorClass = () => {
    const categoryMap: Record<string, string> = {
      "Exercise": "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100",
      "Study": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      "Work": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
      "Mindfulness": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
    };
    
    return categoryMap[getCategoryName()] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };
  
  if (isUpcoming && isTaskForToday()) {
    return null; // If it's for today and marked as upcoming, don't render
  }
  
  return (
    <Card className={`task-card mb-4 ${isUpcoming ? "opacity-70" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-4">
            {isUpcoming ? (
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <i className={`fas ${getCategoryIcon()} text-gray-400 dark:text-gray-500`}></i>
              </div>
            ) : (
              <ProgressRing 
                value={progressValue} 
                max={task.unitValue}
                size={48}
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge variant="outline" className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColorClass()}`}>
                    <i className={`fas ${getCategoryIcon()} mr-1`}></i> {getCategoryName()}
                  </Badge>
                  <span className="ml-2 inline-flex items-center text-xs">
                    <Repeat className="h-3 w-3 mr-1" /> {formatSchedule()}
                  </span>
                </p>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-destructive"
                    onClick={() => deleteTaskMutation.mutate()}
                    disabled={deleteTaskMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            
            {!isUpcoming && (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <label htmlFor={`progress-${task.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {task.unitType === "minutes" ? t("tasks.time") : t("tasks.count")}
                  </label>
                  {feedback && (
                    <span className="text-xs text-emerald-500 font-medium">{feedback}</span>
                  )}
                </div>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    type="number"
                    id={`progress-${task.id}`}
                    value={progressValue}
                    onChange={handleValueChange}
                    onBlur={handleValueBlur}
                    min={0}
                    className="flex-1 block w-full rounded-md sm:text-sm"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                    {t(`unit.${task.unitType}`)}
                  </span>
                </div>
              </div>
            )}
            
            {isUpcoming && (
              <div className="mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isTaskForToday() ? "Today" : "Upcoming"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
