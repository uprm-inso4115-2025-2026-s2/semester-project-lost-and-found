import { requireAdmin } from "../UserProfilesAccount/AdminAccess";
import { deleteUserAndReports } from "../UserProfilesAccount/UserAccountManagement";
import { supabase } from "../supabaseClient";
import { sendUserNotification } from "../UserProfilesAccount/NotificationService";
import { recordAuditEntry } from "../UserProfilesAccount/AuditService";

/**
 * Allows admins to delete user accounts.
 */
export async function adminDeleteAccount(
    userId: string,
    reason?: string
): Promise<{ success: boolean; message: string }> {

    const permission = await requireAdmin();

    if (!permission.allowed) {
        return {
            success: false,
            message: permission.message || "Unauthorized"
        };
    }

    // Get user information before deletion
    const { data: userData, error: fetchError } = await supabase
        .from("UserAccounts")
        .select("*")
        .or(`id.eq.${userId},UserId.eq.${userId}`)
        .single();

    if (fetchError || !userData) {
        return {
            success: false,
            message: "User account not found."
        };
    }

    // Delete account + reports
    const deleteResult = await deleteUserAndReports(userId);

    if (!deleteResult.success) {
        return {
            success: false,
            message: deleteResult.message || "Failed to delete account."
        };
    }

    // Notify user if email exists
    if (userData.Email) {
        const subject = "Your account was removed by an administrator";

        const message = `Hello ${userData.Username || ""},\n\nYour account has been removed by an administrator.\n\n${reason ? `Reason: ${reason}` : ""}\n\nIf you believe this action was taken in error, please contact support.`;

        await sendUserNotification(
            userData.Email,
            subject,
            message,
            "ACCOUNT_UPDATE",
            true
        );
    }

    // Record audit entry for account deletion
    try {
        await recordAuditEntry("ACCOUNT_DELETE", "ACCOUNT", userId, { reason, deletedAccountEmail: userData.Email });
    } catch (err) {
        console.error("Audit logging failed for account deletion", err);
    }

    return {
        success: true,
        message: "Account deleted successfully."
    };
}