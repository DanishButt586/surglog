import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-400 dark:hover:bg-teal-300 dark:text-slate-900 shadow-sm font-medium",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 font-medium",
      outline:
        "border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium",
      ghost:
        "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium",
      destructive:
        "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-500 font-medium shadow-sm",
      success:
        "bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-4 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-xl",
      icon: "h-9 w-9 p-2 rounded-lg flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
