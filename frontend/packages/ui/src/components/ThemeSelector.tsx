import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Laptop, Check } from "@/lib/hero-icons-compat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  variant?: "dropdown" | "segmented" | "compact";
  className?: string;
}

export function ThemeSelector({ variant = "dropdown", className }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const { lang } = useLang();

  const labels = {
    fr: {
      light: "Clair",
      dark: "Sombre",
      system: "Système",
      selectTheme: "Choisir le thème",
    },
    en: {
      light: "Light",
      dark: "Dark",
      system: "System",
      selectTheme: "Select theme",
    },
  };

  const t = lang === "en" ? labels.en : labels.fr;

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 bg-muted/60 border border-border/80 rounded-xl text-xs font-medium gap-1",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
            theme === "light"
              ? "bg-card text-foreground font-semibold shadow-xs border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={t.light}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">{t.light}</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
            theme === "dark"
              ? "bg-card text-foreground font-semibold shadow-xs border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={t.dark}
        >
          <Moon className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">{t.dark}</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
            theme === "system"
              ? "bg-card text-foreground font-semibold shadow-xs border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={t.system}
        >
          <Laptop className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">{t.system}</span>
        </button>
      </div>
    );
  }

  // Dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 gap-2 px-3 border-border/80 rounded-xl text-xs font-medium", className)}
        >
          {theme === "light" && <Sun className="h-4 w-4 text-amber-500" />}
          {theme === "dark" && <Moon className="h-4 w-4 text-primary" />}
          {theme === "system" && <Laptop className="h-4 w-4 text-muted-foreground" />}
          <span className="capitalize">{t[theme]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px] rounded-xl">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between text-xs cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            {t.light}
          </span>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between text-xs cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-primary" />
            {t.dark}
          </span>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between text-xs cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
            {t.system}
          </span>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
