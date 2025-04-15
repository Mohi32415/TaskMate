import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/lib/websocket";
import { useSync } from "@/hooks/use-sync";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plane } from "lucide-react";
import { format } from "date-fns";

interface ChatSectionProps {
  challengeId: number;
  partner?: User | null;
}

export function ChatSection({ challengeId, partner }: ChatSectionProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { sendMessage, addMessageListener } = useWebSocket();
  const { isOnline, addOfflineData } = useSync();
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages } = useQuery({
    queryKey: ["/api/challenges", challengeId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/challenges/${challengeId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  // Listen for new messages via WebSocket
  useEffect(() => {
    const removeListener = addMessageListener((message) => {
      if (message.type === 'chat_message' && message.payload.challengeId === challengeId) {
        // Update cache
        queryClient.setQueryData(
          ["/api/challenges", challengeId, "messages"],
          (oldData: Message[] | undefined) => {
            if (!oldData) return [message.payload];
            return [...oldData, message.payload];
          }
        );
      }
    });

    return () => removeListener();
  }, [addMessageListener, challengeId, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, localMessages]);

  // Combine server and local messages
  const allMessages = [...(messages || []), ...localMessages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Send message
  const handleSendMessage = () => {
    if (!messageText.trim() || !user) return;

    const newMessage: Partial<Message> = {
      challengeId,
      userId: user.id,
      content: messageText,
      createdAt: new Date(),
      synced: isOnline
    };

    if (isOnline) {
      // Send through WebSocket
      sendMessage({
        type: 'chat_message',
        challengeId,
        content: messageText
      });
    } else {
      // Store locally and for later sync
      setLocalMessages(prev => [...prev, newMessage as Message]);
      addOfflineData({
        type: 'chat_message',
        challengeId,
        content: messageText
      });
    }

    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  allMessages.forEach(message => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  // Format date heading
  const formatDateHeading = (dateStr: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    
    if (dateStr === today) return t("chat.today");
    if (dateStr === yesterday) return "Yesterday";
    return format(new Date(dateStr), 'MMMM d, yyyy');
  };

  return (
    <>
      <ScrollArea ref={scrollAreaRef} className="px-4 py-3 bg-gray-50 dark:bg-gray-750 max-h-80">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
              {formatDateHeading(date)}
            </div>
            
            {dateMessages.map((message, index) => {
              const isOwnMessage = message.userId === user?.id;
              return (
                <div 
                  key={message.id || `local-${index}`} 
                  className={`flex mb-3 items-end ${isOwnMessage ? 'justify-end' : ''}`}
                >
                  {!isOwnMessage && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {partner ? (partner.displayName?.[0] || partner.username[0]).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={`${isOwnMessage ? 'mr-2 bg-primary text-white' : 'ml-2 bg-white dark:bg-gray-800'} rounded-lg py-2 px-3 max-w-xs shadow-sm`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs ${isOwnMessage ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} mt-1`}>
                      {format(new Date(message.createdAt), 'h:mm a')}
                    </p>
                  </div>
                  
                  {isOwnMessage && (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {user.displayName?.[0] || user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {allMessages.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex">
          <Input 
            type="text" 
            placeholder={t("chat.placeholder")}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 rounded-l-lg"
          />
          <Button 
            type="button" 
            className="px-4 py-2 rounded-r-lg"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Plane className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
