import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Flame } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  const handleSignUpSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-center justify-center space-y-6 p-6 bg-primary/10 rounded-2xl">
          <div className="flex items-center justify-center p-4">
            <Flame className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center">TasksMate</h1>
          <p className="text-center text-muted-foreground">
            Track your daily tasks, build habits, and achieve your goals with our powerful and intuitive task management app.
          </p>
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="bg-background rounded-lg p-4 text-center">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary">✓</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium">Track Progress</p>
            </div>
            <div className="bg-background rounded-lg p-4 text-center">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary">👥</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium">Challenge Friends</p>
            </div>
            <div className="bg-background rounded-lg p-4 text-center">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary">🌐</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium">Multilingual</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="md:hidden flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                <Flame className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">TasksMate</h1>
              </div>
            </div>

            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm
                  onLoginSuccess={handleLoginSuccess}
                  switchToSignUp={() => setActiveTab("signup")}
                />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm
                  onSignUpSuccess={handleSignUpSuccess}
                  switchToLogin={() => setActiveTab("login")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}