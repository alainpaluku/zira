import { useLocation } from "wouter";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ShieldAlert, Clock } from "@/lib/hero-icons-compat";
import { useAuth, type Universe } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/data-context";
import { useLang } from "@/lib/i18n";
import { useTheme } from "./ThemeProvider";
import { UserAvatar } from "./UserAvatar";
import { getProfileExtras } from "@/lib/profile-completion";
import { cn } from "@/lib/utils";

interface UserProfileMenuProps {
  universe: Universe;
  className?: string;
  showNameOnDesktop?: boolean;
}

export function UserProfileMenu({
  universe,
  className,
  showNameOnDesktop = true,
}: UserProfileMenuProps) {
  const { profile, logout } = useAuth();
  const { getUser, currentPorteurId, currentInvestorId, currentModeratorId } = useAppData();
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();

  const activeUserId =
    profile?.id ||
    (universe === "porteur"
      ? currentPorteurId
      : universe === "investisseur"
      ? currentInvestorId
      : currentModeratorId);

  const rawUser = getUser(activeUserId) ?? profile;
  const userName = rawUser?.name || profile?.name || (universe === "moderation" ? "Modérateur ZIRA" : "Utilisateur");
  const userEmail = rawUser?.email || profile?.email || "compte@zira-invest.com";
  const userPhoto = rawUser?.photo || profile?.photo;
  const userRole = rawUser?.role || profile?.role || (universe === "moderation" ? "moderateur" : universe);

  const profileExtras = getProfileExtras(activeUserId);
  const kycStatus = rawUser?.kycStatus;
  const isKycApproved = profileExtras.idVerified || kycStatus === "approved";
  const isKycPending = !isKycApproved && (Boolean(profileExtras.idDocumentUrl) || kycStatus === "pending" || kycStatus === "in_progress" || kycStatus === "requires_action");

  const roleLabel =
    universe === "porteur"
      ? "Porteur de Projet"
      : universe === "investisseur"
      ? "Investisseur"
      : "Modérateur & Admin";

  const profilePath =
    universe === "moderation"
      ? "/moderateur/profil"
      : universe === "investisseur"
      ? "/investisseur/profil"
      : "/porteur/profil";

  function handleGoToProfile() {
    navigate(profilePath);
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center gap-2 p-1 pl-1.5 pr-2 h-9 rounded-full hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all",
        className
      )}
      id="btn-header-profile"
      aria-label="Ouvrir le profil"
      onClick={handleGoToProfile}
    >
      <div className="relative">
        <UserAvatar
          name={userName}
          photo={userPhoto}
          size="sm"
          className="h-7 w-7 ring-2 ring-background"
        />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background",
            isKycApproved ? "bg-emerald-500" : isKycPending ? "bg-amber-500" : "bg-muted-foreground"
          )}
        />
      </div>

      {showNameOnDesktop && (
        <div className="hidden lg:flex flex-col text-left text-xs leading-tight max-w-[110px]">
          <span className="font-semibold text-foreground truncate">{userName}</span>
          <span className="text-[10px] text-muted-foreground truncate capitalize">{userRole}</span>
        </div>
      )}
    </Button>
  );
}
