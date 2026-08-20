"use client";

import React from "react";
import { SyncStatus } from "@/types/board";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface SyncStatusBadgeProps {
  status: SyncStatus;
  className?: string;
  onClick?: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  className,
  onClick,
}) => {
  const config = {
    CONNECTED: {
      icon: "cloud_done",
      label: "Changes synced",
      textColor: "text-outline",
      iconColor: "text-outline",
      dotColor: "bg-green-500",
    },
    SYNCED: {
      icon: "cloud_done",
      label: "Changes synced",
      textColor: "text-outline",
      iconColor: "text-outline",
      dotColor: "bg-green-500",
    },
    SYNCING: {
      icon: "sync",
      label: "Syncing...",
      textColor: "text-primary",
      iconColor: "text-primary animate-spin",
      dotColor: "bg-primary animate-pulse",
    },
    OFFLINE: {
      icon: "cloud_off",
      label: "Offline",
      textColor: "text-error",
      iconColor: "text-error",
      dotColor: "bg-error",
    },
    RECONNECTING: {
      icon: "autorenew",
      label: "Reconnecting...",
      textColor: "text-tertiary",
      iconColor: "text-tertiary animate-spin",
      dotColor: "bg-tertiary animate-pulse",
    },
  }[status] || {
    icon: "cloud_done",
    label: "Synced",
    textColor: "text-outline",
    iconColor: "text-outline",
    dotColor: "bg-green-500",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 font-label-md text-label-md select-none transition-colors px-1.5 py-0.5 rounded",
        config.textColor,
        onClick && "cursor-pointer hover:bg-surface-container-high",
        className
      )}
      title={`Status: ${config.label} (Click to toggle)`}
    >
      <Icon name={config.icon} size={16} className={config.iconColor} />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
};
