import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Label } from "@zira/ui";
import { useLang } from "@zira/shared";

interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ProfileFormData;
  saving: boolean;
  onSave: (data: ProfileFormData) => Promise<void | boolean> | void;
}

/**
 * Modal d'édition des informations générales du profil (Nom, Titre, Bio).
 */
export function ProfileEditDialog({
  open,
  onOpenChange,
  initialData,
  saving,
  onSave,
}: ProfileEditDialogProps) {
  const { t } = useLang();
  const [form, setForm] = useState<ProfileFormData>(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.porteurProfileEditTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t.porteurProfileFullName}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.porteurProfileTitleField}</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.porteurProfileBio}</Label>
            <Textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={async () => { const result = await onSave(form); if (result !== false) onOpenChange(false); }} disabled={saving}>
            {saving ? "..." : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
