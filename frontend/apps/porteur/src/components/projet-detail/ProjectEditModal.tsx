import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea } from "@zira/ui";
import { useLang } from "@zira/shared";

interface ProjectEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    name: string;
    shortDescription: string;
    targetMarket: string;
  };
  onSave: (data: { name: string; shortDescription: string; targetMarket: string }) => Promise<void>;
}

/**
 * Modal d'édition rapide des informations d'un projet existant.
 */
export function ProjectEditModal({
  open,
  onOpenChange,
  initialData,
  onSave,
}: ProjectEditModalProps) {
  const { t } = useLang();
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.porteurModify}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t.porteurFormName}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.porteurFormDesc}</Label>
            <Textarea
              rows={3}
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.porteurFormMarket}</Label>
            <Input
              value={form.targetMarket}
              onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "..." : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
