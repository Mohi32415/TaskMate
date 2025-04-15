import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Challenge, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ChallengeInvitationProps {
  challenge: Challenge;
  creator: User;
  categoryIcon?: string;
}

export function ChallengeInvitation({ 
  challenge, 
  creator,
  categoryIcon = "fa-running"
}: ChallengeInvitationProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responding, setResponding] = useState(false);
  
  // Response mutations
  const respondToChallengeInvitation = useMutation({
    mutationFn: async (status: 'active' | 'declined') => {
      // Set start and end dates if accepting
      const updateData: any = { status };
      
      if (status === 'active') {
        const startDate = addDays(new Date(), 1); // Start tomorrow
        const endDate = addDays(startDate, 29); // 30 days total
        updateData.startDate = startDate.toISOString();
        updateData.endDate = endDate.toISOString();
      }
      
      return await apiRequest("PATCH", `/api/challenges/${challenge.id}`, updateData);
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({
        title: status === 'active' ? "Challenge accepted" : "Challenge declined",
        description: status === 'active' 
          ? "You've joined the challenge. Good luck!" 
          : "You've declined the challenge invitation."
      });
      setResponding(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to respond to challenge",
        description: error.message,
        variant: "destructive"
      });
      setResponding(false);
    }
  });
  
  // Format start date (tomorrow or specific date)
  const formatStartDate = () => {
    const tomorrow = addDays(new Date(), 1);
    return format(tomorrow, "MMMM d, yyyy");
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <i className={`fas ${categoryIcon} text-blue-500 dark:text-blue-300 text-lg`}></i>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{challenge.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 my-1">
                  <span className="inline-flex items-center">
                    {t("challenges.invitation")} <span className="font-medium ml-1">{creator.displayName || creator.username}</span>
                  </span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 my-1">{challenge.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 my-1">
                  {t("challenges.starting", { date: formatStartDate() })}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => {
                  setResponding(true);
                  respondToChallengeInvitation.mutate('active');
                }}
                disabled={responding}
              >
                {t("challenges.accept")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResponding(true);
                  respondToChallengeInvitation.mutate('declined');
                }}
                disabled={responding}
              >
                {t("challenges.decline")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
