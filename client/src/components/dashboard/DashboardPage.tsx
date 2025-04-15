import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { auth, logoutUser } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Flame, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
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

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">TasksMate</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">
                {user.displayName || user.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid gap-6">
          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user.displayName || "User"}!</h2>
            <p className="text-muted-foreground">
              You've successfully signed in with Firebase Authentication. This is your dashboard where you'll be able to manage your tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xl">0</span>
                </div>
              </div>
              <h3 className="font-medium">Today's Tasks</h3>
              <p className="text-sm text-muted-foreground mt-1">No tasks for today</p>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xl">0</span>
                </div>
              </div>
              <h3 className="font-medium">Completed Tasks</h3>
              <p className="text-sm text-muted-foreground mt-1">No completed tasks</p>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xl">0</span>
                </div>
              </div>
              <h3 className="font-medium">Active Challenges</h3>
              <p className="text-sm text-muted-foreground mt-1">No active challenges</p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h3 className="text-xl font-bold mb-2">Getting Started</h3>
            <p className="text-muted-foreground mb-4">
              Here are some things you can do to get started with TasksMate:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Create your first task by clicking on "Create Task" (coming soon)</li>
              <li>Set up a recurring schedule for your habits</li>
              <li>Challenge a friend to a 30-day habit challenge</li>
              <li>Customize your profile and preferences</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}