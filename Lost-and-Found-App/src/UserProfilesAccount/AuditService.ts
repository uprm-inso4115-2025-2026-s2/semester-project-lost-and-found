import { supabase } from "../supabaseClient";
import { requireAdmin } from "./AdminAccess";

export type AuditActionType =
  | "REPORT_REVIEW"
  | "REPORT_UPDATE"
  | "REPORT_DELETE"
  | "OWNERSHIP_VERIFICATION"
  | "FLAG_REVIEW"
  | "NOTIFICATION_SENT"
  | "ACCOUNT_DELETE"
  | "ACCOUNT_UPDATE";

export interface AuditEntry {
  id?: string;
  action_type: AuditActionType;
  affected_type: string;
  affected_id?: string | null;
  admin_id?: string | null;
  admin_email?: string | null;
  metadata?: any;
  created_at?: string;
}

/**
 * Record an administrative action to the `AdminAuditLogs` table.
 * This is resilient: failures are logged to console but don't block the caller.
 */
export async function recordAuditEntry(
  actionType: AuditActionType,
  affectedType: string,
  affectedId?: string | null,
  metadata?: any
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const admin = userData?.user ?? null;

    const payload = {
      action_type: actionType,
      affected_type: affectedType,
      affected_id: affectedId ?? null,
      admin_id: admin?.id ?? null,
      admin_email: admin?.email ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    } as any;

    const { error } = await supabase.from("AdminAuditLogs").insert([payload]);
    if (error) {
      console.error("Failed to record audit entry", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to record audit entry (unexpected)", err);
    return { success: false, error: err };
  }
}

/**
 * Returns audit log entries (admin-only).
 */
export async function getAuditLogs(): Promise<{ success: boolean; data?: AuditEntry[]; message?: string }> {
  const permission = await requireAdmin();
  if (!permission.allowed) {
    return { success: false, message: permission.message || "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("AdminAuditLogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch audit logs", error);
    return { success: false, message: error.message };
  }

  return { success: true, data: data as AuditEntry[] };
}

export default {
  recordAuditEntry,
  getAuditLogs,
};
