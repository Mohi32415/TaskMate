import { useLanguage } from "@/hooks/use-language";
import { Link, useLocation } from "wouter";
import { Dumbbell, Trophy, Settings } from "lucide-react";

export function MobileNav() {
  const { t } = useLanguage();
  const [location] = useLocation();
  
  const routes = [
    {
      path: "/tasks",
      label: t("nav.tasks"),
      icon: Dumbbell
    },
    {
      path: "/challenges",
      label: t("nav.challenges"),
      icon: Trophy
    },
    {
      path: "/settings",
      label: t("nav.settings"),
      icon: Settings
    }
  ];
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
      <div className="flex justify-around p-3">
        {routes.map(route => (
          <Link key={route.path} href={route.path}>
            <a 
              className={`inline-flex flex-col items-center justify-center ${
                location === route.path 
                  ? "text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <route.icon className="text-xl mb-1" size={24} />
              <span className="text-xs">{route.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
