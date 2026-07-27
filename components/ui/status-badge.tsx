import * as React from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

/**
 * Canonical status → color mapping. Imported by the Dashboard, Case List and
 * Admin Panel so the same status never renders in two different colors, sizes
 * or with two different icons.
 */

type Role = "Observed" | "Assisted" | "Performed";
type Complexity = "Low" | "Medium" | "High";
type ApprovalStatus = "pending" | "approved" | "needs_review";

const roleVariants: Record<Role, BadgeVariant> = {
  Performed: "teal",
  Assisted: "success",
  Observed: "warning",
};

const complexityVariants: Record<Complexity, BadgeVariant> = {
  Low: "default",
  Medium: "warning",
  High: "destructive",
};

const approvalConfig: Record<
  ApprovalStatus,
  { variant: BadgeVariant; label: string; Icon: typeof CheckCircle2 }
> = {
  approved: { variant: "success", label: "Approved", Icon: CheckCircle2 },
  needs_review: { variant: "destructive", label: "Needs Review", Icon: AlertTriangle },
  pending: { variant: "warning", label: "Pending Review", Icon: Clock },
};

export function RoleBadge({ role, className }: { role?: string; className?: string }) {
  const variant = roleVariants[role as Role] ?? "default";
  return (
    <Badge variant={variant} className={className}>
      {role || "Unknown"}
    </Badge>
  );
}

export function ComplexityBadge({
  complexity,
  className,
}: {
  complexity?: string;
  className?: string;
}) {
  const variant = complexityVariants[complexity as Complexity] ?? "default";
  return (
    <Badge variant={variant} className={className}>
      {complexity || "Medium"} Complexity
    </Badge>
  );
}

export function ApprovalBadge({ status, className }: { status?: string; className?: string }) {
  const { variant, label, Icon } = approvalConfig[status as ApprovalStatus] ?? approvalConfig.pending;
  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
