import { supabase } from "../supabaseClient";
import { requireAdmin } from "../UserProfilesAccount/AdminAccess";
import { sendEmailNotification } from "../UserProfilesAccount/NotificationService";

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

    // Notify user
    if (report.Email) {
        await sendEmailNotification(
            report.Email,
            "Your report was updated by an administrator",
            `
An administrator updated your report.

Report ID: ${reportId}

${adminMessage ? `Administrator message:\n${adminMessage}` : ""}
            `
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

    // Notify user
    if (report.Email) {
        await sendEmailNotification(
            report.Email,
            "Your report was deleted by an administrator",
            `
Your report has been removed.

Reason:
${reason || "Administrative action"}
            `
        );
    }

    return {
        success: true,
        message: "Report deleted successfully."
    };
}