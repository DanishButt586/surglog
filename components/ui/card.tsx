import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * One card treatment for the whole app: rounded-xl, 1px border, subtle shadow
 * in light mode, and p-5 (mobile) / p-6 (sm+) internal padding on every slot.
 * Pages must not re-declare radius, border, shadow or padding.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition-colors",
        "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:shadow-none",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/** Standard card padding — kept in one place so every slot stays in step. */
export const cardPadding = "p-5 sm:p-6";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5", cardPadding, className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-tight tracking-tight text-slate-900 dark:text-white",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm leading-relaxed text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardPadding, "pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", cardPadding, "pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
