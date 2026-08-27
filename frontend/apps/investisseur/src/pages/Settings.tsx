import React, { useState, useEffect } from "react";
import { useTheme } from "@zira/ui";
import { fetchProfileExtras, saveProfileExtras } from "@zira/shared/lib/api-client";
import { useLang } from "@/lib/i18n";
import { Switch, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@zira/ui";
// Button import removed: replaced by Select components

export default function InvestisseurSettings() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    void fetchProfileExtras().then((extras) => setNotificationsEnabled(extras.notificationsEnabled !== false));
  }, []);

  const updateNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    void saveProfileExtras({ notificationsEnabled: enabled }).catch(() => setNotificationsEnabled(!enabled));
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("settings.title", "Paramètres")}</h1>

      <div className="bg-card border rounded-2xl p-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">{t("settings.theme", "Thème")}</Label>
          <div className="mt-2">
            <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
              <SelectTrigger className="w-48 h-9 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm">
                <SelectValue placeholder={t("settings.theme", "Choisir le thème")} />
              </SelectTrigger>
              <SelectContent className="min-w-[12rem] rounded-xl border border-border bg-popover p-1">
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold">{t("settings.lang", "Langue")}</Label>
          <div className="mt-2">
            <Select value={lang} onValueChange={(v) => setLang(v as any)}>
              <SelectTrigger className="w-48 h-9 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm">
                <SelectValue placeholder={t("settings.lang", "Choisir la langue")} />
              </SelectTrigger>
              <SelectContent className="min-w-[12rem] rounded-xl border border-border bg-popover p-1">
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold">{t("settings.notifications", "Notifications")}</Label>
          <div className="mt-2 flex items-center gap-3">
            <Switch checked={notificationsEnabled} onCheckedChange={(v) => updateNotifications(Boolean(v))} />
            <div className="text-sm text-muted-foreground">{t("settings.enableNotifications", "Activer les notifications")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
