import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dumbbell, Trophy, Settings, User } from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();
  
  const routes = [
    { 
      path: "/tasks", 
      label: t("nav.tasks"), 
      icon: <Dumbbell className="w-5 h-5 mr-3" /> 
    },
    { 
      path: "/challenges", 
      label: t("nav.challenges"), 
      icon: <Trophy className="w-5 h-5 mr-3" /> 
    },
    { 
      path: "/settings", 
      label: t("nav.settings"), 
      icon: <Settings className="w-5 h-5 mr-3" /> 
    }
  ];
  
  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary dark:text-indigo-400">
          {t("app.name")}
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {routes.map(route => (
          <Link key={route.path} href={route.path}>
            <Button
              variant={location === route.path ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              {route.icon}
              <span>{route.label}</span>
            </Button>
          </Link>
        ))}
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="font-medium">
                {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : user.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{user.displayName || user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.username}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
