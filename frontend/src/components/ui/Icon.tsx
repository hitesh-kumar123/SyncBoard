import React from "react";
import { cn } from "@/lib/cn";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
  filled?: boolean;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  filled = false,
  className,
  ...props
}) => {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        fontVariationSettings: filled ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400",
      }}
      {...props}
    >
      {name}
    </span>
  );
};
