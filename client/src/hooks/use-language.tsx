
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";

const translations = {
  english: {
    "nav.dashboard": "Dashboard",
    "nav.tasks": "Tasks",
    "nav.challenges": "Challenges",
    "nav.settings": "Settings",
    
    // Settings translations
    "settings.language": "Language",
    "settings.language.description": "Select your preferred language",
    "settings.rtl": "Text Direction",
    "settings.rtl.description": "Enable right-to-left text direction for Arabic",
    "settings.notifications": "Notifications",
    "settings.notifications.challenges": "Challenge Updates",
    "settings.notifications.challenges.description": "Get notified about challenge progress",
    "settings.account": "Account Settings",
    "settings.account.displayName": "Display Name",
    "settings.account.currentPassword": "Current Password",
    "settings.account.newPassword": "New Password",
    "settings.account.confirmPassword": "Confirm Password",
    "settings.about": "About TasksMate",
    "settings.about.version": "Version 1.0.0",
    "settings.about.description": "TasksMate helps you build good habits through daily tasks and challenges",
    
    // Common actions
    "action.save": "Save Changes",
    "action.logout": "Logout",
  },
  arabic: {
    "nav.dashboard": "لوحة القيادة",
    "nav.tasks": "المهام",
    "nav.challenges": "التحديات",
    "nav.settings": "الإعدادات",
    
    // Settings translations
    "settings.language": "اللغة",
    "settings.language.description": "اختر لغتك المفضلة",
    "settings.rtl": "اتجاه النص",
    "settings.rtl.description": "تمكين اتجاه النص من اليمين إلى اليسار للعربية",
    "settings.notifications": "الإشعارات",
    "settings.notifications.challenges": "تحديثات التحدي",
    "settings.notifications.challenges.description": "تلقي إشعارات عن تقدم التحدي",
    "settings.account": "إعدادات الحساب",
    "settings.account.displayName": "اسم العرض",
    "settings.account.currentPassword": "كلمة المرور الحالية",
    "settings.account.newPassword": "كلمة المرور الجديدة",
    "settings.account.confirmPassword": "تأكيد كلمة المرور",
    "settings.about": "عن TasksMate",
    "settings.about.version": "الإصدار 1.0.0",
    "settings.about.description": "يساعدك TasksMate على بناء عادات جيدة من خلال المهام اليومية والتحديات",
    
    // Common actions
    "action.save": "حفظ التغييرات",
    "action.logout": "تسجيل الخروج",
  }
};

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  rtl: boolean;
  setRtl: (isRtl: boolean) => void;
  translations: Record<string, string>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorage<string>("app-language", "english");
  const [rtl, setRtl] = useLocalStorage<boolean>("app-rtl", false);
  
  useEffect(() => {
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", rtl);
  }, [rtl]);
  
  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations] || translations.english;
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };
  
  const value = {
    language,
    setLanguage,
    rtl,
    setRtl,
    translations: translations[language as keyof typeof translations] || translations.english,
    t,
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
