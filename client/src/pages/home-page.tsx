import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle, Calendar, Award, BarChart4, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

// Mock data for demonstration
const mockTasksStats = {
  totalTasks: 8,
  completedTasks: 5,
  upcomingTasks: 3,
};

const mockChallengeStats = {
  activeChallenges: 2,
  pendingInvitations: 1,
};

const mockRecentActivities = [
  {
    id: 1,
    type: "task",
    action: "completed",
    title: "Morning Pushups",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    type: "challenge",
    action: "invited",
    title: "Book Reading Challenge",
    user: "Bob",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 3,
    type: "task",
    action: "updated",
    title: "Drink Water",
    progress: 6,
    goal: 8,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

export default function HomePage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="relative">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName || "User"}!
            </h1>
            <p className="text-muted-foreground mb-4">
              Here's an overview of your tasks and challenges
            </p>
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="bg-card shadow rounded-md px-5 py-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round((mockTasksStats.completedTasks / mockTasksStats.totalTasks) * 100)}%
                  </p>
                </div>
              </div>
              <div className="bg-card shadow rounded-md px-5 py-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Active Tasks</p>
                  <p className="text-2xl font-bold">{mockTasksStats.totalTasks}</p>
                </div>
              </div>
              <div className="bg-card shadow rounded-md px-5 py-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Challenges</p>
                  <p className="text-2xl font-bold">{mockChallengeStats.activeChallenges}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tasks Overview */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Tasks Overview</CardTitle>
              <CardDescription>
                Your task completion summary for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Tasks Completed Today
                    </span>
                    <span className="text-sm font-medium">
                      {mockTasksStats.completedTasks}/{mockTasksStats.totalTasks}
                    </span>
                  </div>
                  <Progress
                    value={
                      (mockTasksStats.completedTasks / mockTasksStats.totalTasks) * 100
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <h3 className="text-muted-foreground text-sm">
                      Completed Tasks
                    </h3>
                    <p className="text-3xl font-bold mt-1">
                      {mockTasksStats.completedTasks}
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-center">
                    <h3 className="text-muted-foreground text-sm">
                      Upcoming Tasks
                    </h3>
                    <p className="text-3xl font-bold mt-1">
                      {mockTasksStats.upcomingTasks}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/tasks")}
                >
                  View All Tasks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Challenges</CardTitle>
              <CardDescription>
                Your active challenges and invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Active Challenges</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {mockChallengeStats.activeChallenges}
                  </p>
                </div>

                {mockChallengeStats.pendingInvitations > 0 && (
                  <div className="bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      You have {mockChallengeStats.pendingInvitations} pending
                      invitation{mockChallengeStats.pendingInvitations > 1 && "s"}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/challenges")}
                >
                  View Challenges
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="divide-y">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === "task"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}
                  >
                    {activity.type === "task" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Award className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <p className="font-medium">{activity.title}</p>
                      <time className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.action === "completed" && "You completed this task"}
                      {activity.action === "invited" &&
                        `${activity.user} invited you to this challenge`}
                      {activity.action === "updated" &&
                        `Updated progress: ${activity.progress}/${activity.goal}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}