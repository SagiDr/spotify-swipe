"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";
type Language = "english" | "hebrew";

interface SettingsContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  theme: "dark",
  language: "english",
  setTheme: () => {},
  setLanguage: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export default function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [language, setLanguageState] = useState<Language>("english");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedTheme) setThemeState(savedTheme);
    if (savedLang) setLanguageState(savedLang);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, mounted]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("language", l);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-spotify-darkgray" />;
  }

  return (
    <SettingsContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
}
