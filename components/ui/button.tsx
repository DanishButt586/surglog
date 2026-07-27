import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-xs";
}

/**
 * Single source of truth for button geometry.
 *
 * Every button of a given variant renders identically app-wide: same height,
 * padding, radius (always rounded-lg) and font weight. Pages must never
 * override height or radius via className — pick the matching size instead.
 * Icon sizes are square counterparts of the text sizes so an icon button and a
 * text button sitting in the same row line up exactly.
 */
const buttonSizes = {
  xs: "h-8 px-2.5 text-xs rounded-lg",
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-6 text-base rounded-lg",
  icon: "h-10 w-10 rounded-lg",
  "icon-sm": "h-9 w-9 rounded-lg",
  "icon-xs": "h-8 w-8 rounded-lg",
} as const;

const buttonVariants = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-400 dark:text-slate-900 dark:hover:bg-teal-300 dark:active:bg-teal-200 shadow-sm",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:active:bg-slate-500",
  outline:
    "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:active:bg-slate-600",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:active:bg-slate-600",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 dark:active:bg-rose-400 shadow-sm",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-sm",
} as const;

// Shared base: identical typography, focus ring and disabled treatment for
// every button in the app. The focus ring carries an explicit offset color so
// the halo reads correctly in light *and* dark mode (a bare ring-offset-2
// defaults to white and punched a bright hole around focused dark-mode buttons).
const buttonBase = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium leading-none",
  "transition-colors duration-150 cursor-pointer select-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
  // pointer-events-none keeps hover colors from firing on a disabled control;
  // opacity + flattened shadow are the disabled affordance.
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  "[&_svg]:shrink-0 [&_svg]:pointer-events-none"
);

/**
 * Button styling as a class string, for elements that must not be a <button> —
 * chiefly next/link anchors. Using this instead of wrapping a <Button> in a
 * <Link> keeps the focus ring on the element that actually receives focus.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  return cn(buttonBase, buttonVariants[variant!], buttonSizes[size!], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
