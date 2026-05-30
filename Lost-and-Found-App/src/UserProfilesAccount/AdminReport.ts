import { supabase } from "../supabaseClient";
import { requireAdmin } from "../UserProfilesAccount/AdminAccess";
import { sendUserNotification } from "../UserProfilesAccount/NotificationService";
import { recordAuditEntry } from "../UserProfilesAccount/AuditService";

/**
 * Allows adminins to edit reports.
 */
export async function adminEditReport(
    reportId: string,
    updatedFields: Record<string, unknown>,
    adminMessage?: string
): Promise<{ success: boolean; message: string }> {

    // Permission check
    const permission = await requireAdmin();

    if (!permission.allowed) {
        return {
            success: false,
            message: permission.message || "Unauthorized"
        };
    }

    // Get existing report
    const { data: report, error: fetchError } = await supabase
        .from("Reports")
        .select("*")
        .eq("id", reportId)
        .single();

    if (fetchError || !report) {
        return {
            success: false,
            message: "Report not found."
        };
    }

    // Update database
    const { error: updateError } = await supabase
        .from("Reports")
        .update(updatedFields)
        .eq("id", reportId);

    if (updateError) {
        return {
            success: false,
            message: updateError.message
        };
    }

    // Record audit entry for report update
    try {
        await recordAuditEntry("REPORT_UPDATE", "REPORT", reportId, { updatedFields, adminMessage });
    } catch (err) {
        console.error("Audit logging failed for report update", err);
    }

    // Notify user
    if (report.Email) {
        await sendUserNotification(
            report.Email,
            "Your report was updated by an administrator",
            `An administrator updated your report.\n\nReport ID: ${reportId}\n\n${adminMessage ? `Administrator message:\n${adminMessage}` : ""}`,
            "ACCOUNT_UPDATE",
            true
        );
    }

    return {
        success: true,
        message: "Report updated successfully."
    };
}

/**
 * Allows administrators to delete reports.
 */
export async function adminDeleteReport(
    reportId: string,
    reason?: string
): Promise<{ success: boolean; message: string }> {

    const permission = await requireAdmin();

    if (!permission.allowed) {
        return {
            success: false,
            message: permission.message || "Unauthorized"
        };
    }

    // Get report before deletion
    const { data: report, error: fetchError } = await supabase
        .from("Reports")
        .select("*")
        .eq("id", reportId)
        .single();

    if (fetchError || !report) {
        return {
            success: false,
            message: "Report not found."
        };
    }

    // Delete report
    const { error: deleteError } = await supabase
        .from("Reports")
        .delete()
        .eq("id", reportId);

    if (deleteError) {
        return {
            success: false,
            message: deleteError.message
        };
    }

    // Record audit entry for report deletion
    try {
        await recordAuditEntry("REPORT_DELETE", "REPORT", reportId, { reason });
    } catch (err) {
        console.error("Audit logging failed for report deletion", err);
    }

    // Notify user
    if (report.Email) {
        await sendUserNotification(
            report.Email,
            "Your report was deleted by an administrator",
            `Your report has been removed.\n\nReason:\n${reason || "Administrative action"}`,
            "ACCOUNT_UPDATE",
            true
        );
    }

    return {
        success: true,
        message: "Report deleted successfully."
    };
}