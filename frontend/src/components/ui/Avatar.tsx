import React, { useState } from "react";
import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  color?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  className,
  showOnlineStatus = false,
  isOnline = false,
  color = "#0058be",
}) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div className="relative inline-block shrink-0">
      {src && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={cn(
            "rounded-full object-cover border border-outline-variant",
            sizeClasses[size],
            className
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-label-md font-medium text-white border border-outline-variant shadow-sm",
            sizeClasses[size],
            className
          )}
          style={{ backgroundColor: color }}
        >
          {initials || "U"}
        </div>
      )}

      {showOnlineStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-surface",
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
};
