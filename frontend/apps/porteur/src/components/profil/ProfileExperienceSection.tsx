import React from "react";
import { Briefcase, GraduationCap } from "@/lib/hero-icons-compat";
import { useLang, type EducationEntry, type WorkExperience } from "@zira/shared";

interface ProfileExperienceSectionProps {
  experience?: WorkExperience[];
  education?: EducationEntry[];
}

/**
 * Section affichant les expériences professionnelles et le parcours académique du porteur.
 */
export function ProfileExperienceSection({
  experience = [],
  education = [],
}: ProfileExperienceSectionProps) {
  const { t } = useLang();

  return (
    <div className="space-y-6 px-4 md:px-6">
      {experience.length > 0 && (
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-primary" />
            {t.porteurProfileExperience}
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="pl-3 border-l-2 border-primary/40">
                <div className="font-semibold text-sm">{exp.role}</div>
                <div className="text-sm text-muted-foreground">
                  {exp.company} · {exp.period}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-primary" />
            {t.porteurProfileEducation}
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="pl-3 border-l-2 border-primary/40">
                <div className="font-semibold text-sm">{edu.degree}</div>
                <div className="text-sm text-muted-foreground">
                  {edu.institution} · {edu.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
