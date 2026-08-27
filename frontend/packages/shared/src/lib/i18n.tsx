import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fr, TranslationKey } from "../locales/fr";
import { en } from "../locales/en";

export type Language = "fr" | "en";

export type TFunction = ((key: string | TranslationKey, defaultText?: string) => string) &
  Record<string, string>;

const dictionaries: Record<Language, Record<string, string>> = {
  fr,
  en,
};

function getPersistedLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  try {
    const saved = localStorage.getItem("zira_language") as Language;
    if (saved === "fr" || saved === "en") return saved;
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

function createTProxy(
  lang: Language,
  rawTranslate: (key: string, defaultText?: string) => string
): TFunction {
  const proxy = new Proxy(rawTranslate, {
    apply(_target, _thisArg, args) {
      return rawTranslate(args[0], args[1]);
    },
    get(_target, prop) {
      if (typeof prop === "string" && prop !== "then" && prop !== "toJSON") {
        return rawTranslate(prop, prop);
      }
      return undefined;
    },
  });
  return proxy as TFunction;
}

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TFunction;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
}

const defaultContext: I18nContextValue = {
  language: "fr",
  setLanguage: () => {},
  t: createTProxy("fr", (k, d) => dictionaries.fr[k] || d || k),
  formatCurrency: (amount: number) => `$${amount.toLocaleString("fr-FR")}`,
  formatDate: (date) => new Date(date).toLocaleDateString("fr-FR"),
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getPersistedLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("zira_language", lang);
      } catch {
        // ignore
      }
    }
  };

  const rawTranslate = (key: string, defaultText?: string): string => {
    const dict = dictionaries[language] || dictionaries.fr;
    if (dict[key]) return dict[key];
    const fallbackDict = dictionaries.fr;
    if (fallbackDict[key]) return fallbackDict[key];
    return defaultText || key;
  };

  const t = createTProxy(language, rawTranslate);

  const formatCurrency = (amount: number, currency: string = "USD"): string => {
    const locale = language === "en" ? "en-US" : "fr-FR";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      const locale = language === "en" ? "en-US" : "fr-FR";
      const defaultOpts: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      return new Intl.DateTimeFormat(locale, options || defaultOpts).format(d);
    } catch {
      return String(date);
    }
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLang() {
  const { language, setLanguage, t, formatCurrency, formatDate } = useI18n();
  return {
    lang: language,
    setLang: setLanguage,
    t,
    formatCurrency,
    formatDate,
  };
}

export { fr, en };
