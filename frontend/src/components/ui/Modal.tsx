import React, { useEffect } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-[500px]",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full bg-white dark:bg-[#0f172a] border border-[#c2c6d6] dark:border-[#1e293b] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transform transition-all",
          maxWidthClass
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#c2c6d6] dark:border-[#1e293b]">
          <h2 className="text-xl font-bold text-[#151c27] dark:text-[#f8fafc] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#424754] dark:text-[#94a3b8] hover:text-[#151c27] dark:hover:text-[#f8fafc] transition-colors p-1.5 rounded-full hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#c2c6d6] dark:border-[#1e293b] flex justify-end gap-3 items-center bg-white dark:bg-[#0f172a]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
