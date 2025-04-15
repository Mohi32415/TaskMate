import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Challenge, Category, ChallengeProgress, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, ChartLine } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format, differenceInDays, addDays } from "date-fns";
import { ChatSection } from "./chat-section";

interface ChallengeCardProps {
  challenge: Challenge;
  category?: Category;
  creator?: User;
  participant?: User;
}

export function ChallengeCard({ challenge, category, creator, participant }: ChallengeCardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Current challenge day
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays, setTotalDays] = useState(30);
  const [progress, setProgress] = useState(0);
  
  // Calculate days and progress
  useEffect(() => {
    if (challenge.startDate && challenge.endDate) {
      const start = new Date(challenge.startDate);
      const end = new Date(challenge.endDate);
      const today = new Date();
      
      const total = differenceInDays(end, start);
      setTotalDays(total);
      
      if (today < start) {
        setCurrentDay(0); // Not started yet
      } else if (today > end) {
        setCurrentDay(total); // Completed
      } else {
        setCurrentDay(differenceInDays(today, start) + 1);
      }
      
      setProgress(Math.min(100, (currentDay / total) * 100));
    }
  }, [challenge.startDate, challenge.endDate, currentDay]);
  
  // Format challenge participants
  const getChallengePartner = () => {
    if (!user) return null;
    
    return user.id === challenge.creatorId ? participant : creator;
  };
  
  const partner = getChallengePartner();
  
  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{challenge.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Badge variant="outline" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                <i className={`fas ${category?.icon || 'fa-list'} mr-1`}></i> 
                {category?.name || t("category.other")}
              </Badge>
              <span className="ml-2">
                {t("challenges.days", { current: currentDay, total: totalDays })}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChartLine className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {creator && (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <span className="text-xs font-medium">
                    {creator.displayName ? creator.displayName.charAt(0).toUpperCase() : creator.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {participant && (
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <span className="text-xs font-medium">
                    {participant.displayName ? participant.displayName.charAt(0).toUpperCase() : participant.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {partner && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("challenges.with", { name: partner.displayName || partner.username })}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="w-48 mr-2">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
          </div>
        </div>
      </CardHeader>
      
      {/* Chat section for challenges */}
      <ChatSection challengeId={challenge.id} partner={partner} />
    </Card>
  );
}
