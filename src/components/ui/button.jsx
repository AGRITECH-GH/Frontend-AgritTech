import React from "react";
import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]";

const variants = {
  default:
    "bg-primary text-white shadow-soft hover:bg-emerald-500 hover:shadow-soft-lg",
  outline:
    "border border-emerald-200/70 bg-white/5 text-foreground hover:bg-emerald-50/60",
  ghost:
    "bg-transparent text-muted hover:bg-emerald-50/80 hover:text-foreground",
  secondary:
    "bg-primary-dark text-emerald-100 hover:bg-emerald-900 hover:text-white",
};

const sizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-10 px-5",
  lg: "h-11 px-6 text-sm md:px-7",
};

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

