// src/components/LanguageSwitcher.tsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LANGS: { code: string; label: string; localName?: string; flag?: string }[] = [
  { code: "en", label: "English", localName: "English", flag: "🇺🇸" },
  { code: "ko", label: "Korean", localName: "한국어", flag: "🇰🇷" },
  { code: "zh-TW", label: "Traditional Chinese", localName: "繁體中文", flag: "🇹🇼" },
  { code: "zh-CN", label: "Simplified Chinese", localName: "简体中文", flag: "🇨🇳" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // normalize codes for comparisons
  const normalize = (lng?: string) => (lng || "").toLowerCase().replace("_", "-");
  const current = normalize(
    i18n.resolvedLanguage || i18n.language || localStorage.getItem("i18nextLng") || "en"
  );

  useEffect(() => {
    const docLang =
      i18n.resolvedLanguage || i18n.language || localStorage.getItem("i18nextLng") || "en";
    document.documentElement.lang = docLang;
  }, [i18n.resolvedLanguage, i18n.language]);

  const isActive = (code: string) => {
    const nCode = normalize(code);
    return current === nCode; // require exact match, avoids zh-CN & zh-TW both checked
  };

  const change = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      localStorage.setItem("i18nextLng", lng);
      document.documentElement.lang = lng;
    } catch (err) {
      console.error("Failed to change language:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => change(l.code)}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden>{l.flag}</span>
              <div className="flex flex-col text-sm">
                <span>{l.label}</span>
                <span className="text-xs text-muted-foreground">{l.localName}</span>
              </div>
            </div>
            {isActive(l.code) ? <span className="text-xs">✓</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
