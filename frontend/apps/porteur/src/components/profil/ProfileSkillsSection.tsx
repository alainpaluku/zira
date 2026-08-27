import React, { useState } from "react";
import { Button, Input } from "@zira/ui";
import { Plus, X } from "@/lib/hero-icons-compat";
import { useLang } from "@zira/shared";

interface ProfileSkillsSectionProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

/**
 * Section de gestion des compétences techniques et managériales du porteur.
 */
export function ProfileSkillsSection({
  skills,
  onAddSkill,
  onRemoveSkill,
}: ProfileSkillsSectionProps) {
  const { t } = useLang();
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = () => {
    if (newSkill.trim()) {
      onAddSkill(newSkill.trim());
      setNewSkill("");
    }
  };

  return (
    <div className="mb-6 px-4 md:px-6">
      <h2 className="text-base font-semibold mb-3">{t.porteurProfileSkills}</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((skill) => (
          <div
            key={skill}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm"
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className="ml-1 text-primary/60 hover:text-primary"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Nouvelle compétence..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 text-sm"
        />
        <Button size="sm" variant="outline" type="button" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
