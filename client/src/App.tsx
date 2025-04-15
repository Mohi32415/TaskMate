import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/components/auth/AuthPage";
import HomePage from "@/pages/home-page";
import TasksPage from "@/pages/tasks-page";
import ChallengesPage from "@/pages/challenges-page";
import SettingsPage from "@/pages/settings-page";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [, navigate] = useLocation();
  const [location] = useLocation();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      
      // Navigate based on auth status
      if (user && location === "/auth") {
        navigate("/dashboard");
      } else if (!user && location !== "/auth" && location !== "/") {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [location, navigate]);

  // Initial redirect to auth page from root
  useEffect(() => {
    if (location === "/" && authenticated !== null) {
      navigate(authenticated ? "/dashboard" : "/auth");
    }
  }, [authenticated, location, navigate]);

  // Loading state
  if (authenticated === null && location !== "/auth") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <LanguageProvider>
          <AuthProvider>
            <Switch>
              <Route path="/auth" component={AuthPage} />
              <Route path="/dashboard" component={HomePage} />
              <Route path="/tasks" component={TasksPage} />
              <Route path="/challenges" component={ChallengesPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/" component={() => null} /> {/* Handled by redirect effect */}
              <Route component={NotFound} />
            </Switch>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
