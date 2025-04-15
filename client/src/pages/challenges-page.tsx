import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Plus,
  Award,
  Check,
  X,
  Users,
  MessageCircle,
  CalendarDays,
  Copy,
  ChevronRight,
  Send,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Form schema
const challengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  days: z.string().min(1, "Please specify the number of days"),
  task: z.string().min(3, "Please specify the task"),
  invitee: z.string().email("Please enter a valid email"),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

// Message schema
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

// Mock types for demonstration
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Challenge {
  id: string;
  title: string;
  days: number;
  task: string;
  creator: User;
  invitee: User;
  status: "pending" | "active" | "completed" | "declined";
  progress: {
    creator: number;
    invitee: number;
  };
  createdAt: Date;
}

interface Message {
  id: string;
  challengeId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  // Mock current user
  const currentUser: User = {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
  };

  // Mock other users
  const users: User[] = [
    {
      id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "",
    },
    {
      id: "user3",
      name: "Bob Johnson",
      email: "bob@example.com",
      avatar: "",
    },
  ];

  // Mock challenges
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "challenge1",
      title: "30-Day Pushup Challenge",
      days: 30,
      task: "20 pushups per day",
      creator: currentUser,
      invitee: users[0],
      status: "active",
      progress: {
        creator: 10,
        invitee: 8,
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: "challenge2",
      title: "Book Reading Challenge",
      days: 14,
      task: "Read 30 pages per day",
      creator: users[1],
      invitee: currentUser,
      status: "active",
      progress: {
        creator: 5,
        invitee: 6,
      },
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      id: "challenge3",
      title: "Water Drinking Challenge",
      days: 10,
      task: "Drink 8 glasses of water",
      creator: currentUser,
      invitee: users[0],
      status: "pending",
      progress: {
        creator: 0,
        invitee: 0,
      },
      createdAt: new Date(),
    },
  ]);

  // Mock messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg1",
      challengeId: "challenge1",
      senderId: "user1",
      content: "How are you doing with the pushups? I'm finding it easier each day!",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "msg2",
      challengeId: "challenge1",
      senderId: "user2",
      content: "It's tough, but I'm keeping up! My arms are getting stronger.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "msg3",
      challengeId: "challenge1",
      senderId: "user1",
      content: "That's great! Let's keep pushing each other. 💪",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ]);

  const challengeForm = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      days: "",
      task: "",
      invitee: "",
    },
  });

  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onChallengeSubmit = (data: ChallengeFormValues) => {
    // In a real app, we would add this to the database
    const newChallenge: Challenge = {
      id: `challenge${challenges.length + 1}`,
      title: data.title,
      days: parseInt(data.days),
      task: data.task,
      creator: currentUser,
      invitee: {
        id: `user${users.length + 1}`,
        name: data.invitee.split("@")[0],
        email: data.invitee,
      },
      status: "pending",
      progress: {
        creator: 0,
        invitee: 0,
      },
      createdAt: new Date(),
    };

    setChallenges([...challenges, newChallenge]);
    challengeForm.reset();
    setChallengeDialogOpen(false);
  };

  const onMessageSubmit = (data: MessageFormValues) => {
    if (!currentChallenge) return;

    const newMessage: Message = {
      id: `msg${messages.length + 1}`,
      challengeId: currentChallenge.id,
      senderId: currentUser.id,
      content: data.content,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    messageForm.reset();
  };

  const openChatDialog = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setChatDialogOpen(true);
  };

  const acceptChallenge = (challengeId: string) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, status: "active" }
          : challenge
      )
    );
  };

  const declineChallenge = (challengeId: string) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, status: "declined" }
          : challenge
      )
    );
  };

  const updateProgress = (challengeId: string, isCreator: boolean) => {
    setChallenges(
      challenges.map((challenge) => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            progress: isCreator
              ? { ...challenge.progress, creator: challenge.progress.creator + 1 }
              : { ...challenge.progress, invitee: challenge.progress.invitee + 1 },
          };
        }
        return challenge;
      })
    );
  };

  const isUserCreator = (challenge: Challenge) => challenge.creator.id === currentUser.id;

  const getPartnerName = (challenge: Challenge) => {
    return isUserCreator(challenge) ? challenge.invitee.name : challenge.creator.name;
  };

  const getUserProgress = (challenge: Challenge) => {
    return isUserCreator(challenge) ? challenge.progress.creator : challenge.progress.invitee;
  };

  const getPartnerProgress = (challenge: Challenge) => {
    return isUserCreator(challenge) ? challenge.progress.invitee : challenge.progress.creator;
  };

  const getProgressPercentage = (progress: number, total: number) => {
    return Math.min((progress / total) * 100, 100);
  };

  const getChallengeMessages = (challengeId: string) => {
    return messages.filter((message) => message.id === challengeId);
  };

  const getMessageUser = (senderId: string) => {
    if (senderId === currentUser.id) return currentUser;
    return users.find((user) => user.id === senderId) || currentUser;
  };

  const isMessageFromCurrentUser = (senderId: string) => senderId === currentUser.id;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const activeOrCompletedChallenges = challenges.filter(
    (challenge) => challenge.status === "active" || challenge.status === "completed"
  );

  const pendingChallenges = challenges.filter(
    (challenge) => challenge.status === "pending" && challenge.invitee.id === currentUser.id
  );

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
              <DialogDescription>
                Invite a friend to join you in a challenge and track progress together.
              </DialogDescription>
            </DialogHeader>
            <Form {...challengeForm}>
              <form
                onSubmit={challengeForm.handleSubmit(onChallengeSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={challengeForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge Title</FormLabel>
                      <FormControl>
                        <Input placeholder="30-Day Pushup Challenge" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={challengeForm.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Days</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormDescription>
                        How many days will this challenge last?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={challengeForm.control}
                  name="task"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Task</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="20 pushups per day"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        What task needs to be completed each day?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={challengeForm.control}
                  name="invitee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Friend (Email)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="friend@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create & Send Invitation</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="invites">
            Invitations
            {pendingChallenges.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingChallenges.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrCompletedChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Active Challenges</h3>
              <p className="text-muted-foreground">
                Create a challenge and invite friends to get started!
              </p>
              <Button
                onClick={() => setChallengeDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Challenge
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeOrCompletedChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Award className="h-5 w-5 mr-2 text-primary" />
                          {challenge.title}
                        </CardTitle>
                        <CardDescription>
                          {challenge.task} for {challenge.days} days
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openChatDialog(challenge)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>
                              {currentUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{currentUser.name} (You)</p>
                            <p className="text-xs text-muted-foreground">
                              Day {getUserProgress(challenge)}/{challenge.days}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateProgress(challenge.id, isUserCreator(challenge))
                          }
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Complete Today
                        </Button>
                      </div>

                      <Progress
                        value={getProgressPercentage(
                          getUserProgress(challenge),
                          challenge.days
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                isUserCreator(challenge)
                                  ? challenge.invitee.avatar
                                  : challenge.creator.avatar
                              }
                            />
                            <AvatarFallback>
                              {getPartnerName(challenge).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {getPartnerName(challenge)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Day {getPartnerProgress(challenge)}/{challenge.days}
                            </p>
                          </div>
                        </div>
                        {getPartnerProgress(challenge) > 0 && (
                          <Badge variant="outline" className="text-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Updated Today
                          </Badge>
                        )}
                      </div>

                      <Progress
                        value={getProgressPercentage(
                          getPartnerProgress(challenge),
                          challenge.days
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      Started on {formatDate(challenge.createdAt)}
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {pendingChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Pending Invitations</h3>
              <p className="text-muted-foreground">
                You don't have any challenge invitations right now.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>
                      {challenge.creator.name} has invited you to a {challenge.days}-day challenge
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-primary" />
                        <p className="text-sm">{challenge.task}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {challenge.days} days challenge
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => acceptChallenge(challenge.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => declineChallenge(challenge.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {currentChallenge?.title}
              <Badge className="ml-2" variant="outline">
                Day {currentChallenge ? getUserProgress(currentChallenge) : 0}/
                {currentChallenge?.days}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Chat with {currentChallenge ? getPartnerName(currentChallenge) : ""} about
              your progress
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 h-[300px] pr-4">
            <div className="space-y-4">
              {messages
                .filter((msg) => currentChallenge && msg.challengeId === currentChallenge.id)
                .map((message) => {
                  const isCurrentUser = isMessageFromCurrentUser(message.senderId);
                  const user = getMessageUser(message.senderId);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex ${
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        } items-start gap-2 max-w-[80%]`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>

          <Separator className="my-4" />

          <Form {...messageForm}>
            <form
              onSubmit={messageForm.handleSubmit(onMessageSubmit)}
              className="flex gap-2"
            >
              <FormField
                control={messageForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Type your message..."
                        {...field}
                        className="flex-1"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}