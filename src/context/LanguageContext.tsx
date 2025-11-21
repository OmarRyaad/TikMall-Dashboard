import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  t: typeof en; // same shape as en.json
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: en,
  toggleLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang") as Language;
    if (storedLang) setLang(storedLang);
    document.documentElement.dir = storedLang === "ar" ? "rtl" : "ltr";
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => {
      const newLang = prev === "en" ? "ar" : "en";
      localStorage.setItem("lang", newLang);
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      return newLang;
    });
  };

  const t = lang === "en" ? en : ar;

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
