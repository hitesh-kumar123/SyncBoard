"use client";

import React, { useState } from "react";
import { Collaborator } from "@/types/board";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  onShareClick?: () => void;
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  collaborators,
  onShareClick,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const visibleList = collaborators.slice(0, 2);
  const remaining = Math.max(0, collaborators.length - 2);

  return (
    <div className="relative flex items-center">
      <div className="flex items-center -space-x-2">
        {visibleList.map((collab, index) => (
          <div
            key={collab.id || index}
            className="relative transition-transform hover:scale-110 hover:z-30 cursor-pointer"
            style={{ zIndex: 10 - index }}
            title={`${collab.name} (${collab.role})`}
          >
            <Avatar
              name={collab.name}
              src={collab.avatarUrl}
              size="sm"
              color={collab.color}
              className="border-2 border-surface shadow-sm"
              showOnlineStatus
              isOnline={collab.isOnline ?? true}
            />
          </div>
        ))}

        {remaining > 0 && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center font-label-md text-label-md text-on-surface-variant relative z-0 hover:bg-surface-container-high transition-colors cursor-pointer"
            title={`${remaining} more collaborators`}
          >
            +{remaining}
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-deep p-sm z-50 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center px-sm py-1 border-b border-outline-variant mb-1">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Active Collaborators
            </span>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-outline hover:text-on-surface p-0.5 rounded"
            >
              <Icon name="close" size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-1.5 hover:bg-surface-container rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    name={collab.name}
                    src={collab.avatarUrl}
                    size="xs"
                    color={collab.color}
                    showOnlineStatus
                    isOnline={collab.isOnline ?? true}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-xs font-medium text-on-surface truncate">
                      {collab.name}
                    </span>
                    <span className="font-label-md text-[10px] text-on-surface-variant truncate">
                      {collab.email}
                    </span>
                  </div>
                </div>
                <span className="font-mono-label text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                  {collab.role}
                </span>
              </div>
            ))}
          </div>

          {onShareClick && (
            <button
              onClick={() => {
                setShowDropdown(false);
                onShareClick();
              }}
              className="w-full mt-2 py-1.5 px-2 bg-primary text-on-primary font-label-md text-xs rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Icon name="person_add" size={14} />
              Manage Access
            </button>
          )}
        </div>
      )}
    </div>
  );
};
