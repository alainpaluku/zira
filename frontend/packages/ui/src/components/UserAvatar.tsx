import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { cn } from "../lib/utils";

interface UserAvatarProps {
  name: string;
  photo?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  colorScheme?: "primary" | "accent";
}

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const FONT_CLASSES = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
};

export function UserAvatar({ name, photo, size = "md", className, colorScheme = "primary" }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      {photo ? <AvatarImage src={photo} alt={name} /> : null}
      <AvatarFallback
        className={cn(
          FONT_CLASSES[size],
          "font-bold",
          colorScheme === "accent"
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
