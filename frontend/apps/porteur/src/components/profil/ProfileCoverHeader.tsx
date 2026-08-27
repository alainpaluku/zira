import React from "react";
import { Button } from "@zira/ui";
import { Edit, MapPin, Camera } from "@/lib/hero-icons-compat";

interface ProfileCoverHeaderProps {
  displayName: string;
  username?: string;
  title: string;
  address: string;
  bio?: string;
  photo?: string;
  onEditClick: () => void;
  onPhotoUpload: (file: File | null) => void;
}

/**
 * En-tête avec image de couverture, avatar éditable, nom et localisation.
 */
export function ProfileCoverHeader({
  displayName,
  username,
  title,
  address,
  bio,
  photo,
  onEditClick,
  onPhotoUpload,
}: ProfileCoverHeaderProps) {
  return (
    <>
      <div className="w-full h-36 md:h-44 overflow-hidden">
        <div
          role="img"
          aria-label="Bannière du profil"
          className="w-full h-full bg-gradient-to-r from-primary/80 via-primary/50 to-slate-900"
        />
      </div>

      <div className="px-4 md:px-6">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <label className="relative w-20 h-20 rounded-xl overflow-hidden border-4 border-background bg-muted shrink-0 cursor-pointer group">
            {photo ? (
              <img
                src={photo}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {(displayName || "?").slice(0, 1)}
              </div>
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onPhotoUpload(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onEditClick}>
            <Edit className="w-4 h-4" /> Modifier
          </Button>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            {username && (
              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                @{username}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{title || "—"}</p>
          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" /> {address || "Adresse non renseignée"}
          </p>
          {bio && <p className="text-sm mt-2 text-muted-foreground">{bio}</p>}
        </div>
      </div>
    </>
  );
}
