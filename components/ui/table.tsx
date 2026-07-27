import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared table shell used by both the Case List and the Admin Panel so header
 * background, row height, cell padding and hover state are byte-identical.
 *
 * `minWidth` keeps columns from collapsing on narrow viewports; the wrapper
 * scrolls horizontally instead of squashing the layout. Pages pair this with a
 * card list under `md` so phones never have to scroll sideways.
 */
export function TableWrapper({
  className,
  minWidth = "min-w-[900px]",
  children,
}: {
  className?: string;
  minWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full overflow-x-auto overscroll-x-contain", className)}>
      <table className={cn("w-full border-collapse text-left text-sm", minWidth)}>{children}</table>
    </div>
  );
}

export const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500",
      "dark:bg-slate-900/60 dark:text-slate-400",
      "[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-700",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-100 dark:divide-slate-700/60", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

/** Header cell. `align` mirrors the body cell so headers sit over their data. */
export const TH = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }
>(({ className, align = "left", ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(
      "px-4 py-3 font-semibold first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6",
      align === "right" && "text-right",
      align === "center" && "text-center",
      className
    )}
    {...props}
  />
));
TH.displayName = "TH";

/** Body cell — same horizontal rhythm as TH so columns line up exactly. */
export const TD = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }
>(({ className, align = "left", ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-4 align-top first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6",
      align === "right" && "text-right",
      align === "center" && "text-center",
      className
    )}
    {...props}
  />
));
TD.displayName = "TD";
