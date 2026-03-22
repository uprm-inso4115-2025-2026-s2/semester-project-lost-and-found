import { supabase } from "../supabaseClient";
import { deleteReportsByUser } from "../ReportManagement/ReportDatabaseManagement";

/**
 * =============================================================================
 * ISSUE #259 BACKEND: User Account Deletion with Report Cleanup
 * =============================================================================
 * 
 * 
## Backend contract for account deletion (issue #259)
- New helper file: `src/UserProfilesAccount/UserAccountManagement.ts`
- Exports:
  - `deleteUserAndReports(userId)`
  - `deleteReportsByUserId(userId)`
  - `deleteUserAccount(userId)`
  - `signOut()`
- UI should call `deleteUserAndReports` after user confirms delete, then call `supabase.auth.signOut()` and redirect.
 * 
 * This module handles the backend logic for safely deleting a user account
 * and all associated reports. It was created to support issue #259.
 * 
 * For UI implementation (issue #266), the main function to call is:
 *   -> deleteUserAndReports(userId)
 * 
 * =============================================================================
 */

/**
 * Deletes a user account row from the UserAccounts table.
 * 
 * @param userId - The user ID (supports both 'id' and 'UserId' column names)
 * @returns Promise<boolean> - true if deletion succeeded, false on error
 * 
 * @example
 * const success = await deleteUserAccount(userId);
 * if (!success) alert("Failed to delete account");

*/
export async function deleteUserAccount(userId: string): Promise<boolean> {
    // Try to delete by primary id, fallback to a UserId field if present.
    const maybeDelete = await supabase
        .from("UserAccounts")
        .delete()
        .or(`id.eq.${userId},UserId.eq.${userId}`);

    if (maybeDelete.error) {
        console.error("Error deleting user account", userId, maybeDelete.error);
        return false;
    }

    // If no rows were deleted, log but still continue (idempotent behaviour).
    const deletedRows = (maybeDelete.data as unknown) as object[];
    if (Array.isArray(deletedRows) && deletedRows.length === 0) {
        console.warn("No UserAccounts row deleted for", userId);
    }

    return true;
}

/**
 * Deletes all reports created by a given user.
 * Wrapper around ReportDatabaseManagement.deleteReportsByUser().
 * 
 * @param userId - The user ID whose reports should be deleted
 * @returns Promise<boolean> - true if deletion succeeded, false on error
 */
export async function deleteReportsByUserId(userId: string): Promise<boolean> {
    return deleteReportsByUser(userId);
}

/**
 * ============================================================================
 * MAIN FUNCTION FOR UI INTEGRATION (Issue #266)
 * ============================================================================
 * 
 * This is the HIGH-LEVEL function the UI should call when the user
 * clicks "Delete Account" and confirms the action.
 * 
 * @param userId - The ID of the user account to delete
 * @returns Promise<{success: boolean, message?: string}>
 * 
 * @example
 * // In your Delete Account button handler:
 * const result = await deleteUserAndReports(currentUserId);
 * if (!result.success) {
 *   alert(result.message); // Show error to user
 *   return;
 * }
 * // Success! Clean up UI and redirect
 * await signOut();
 * navigate('/login');
 * 
 * FLOW:
 * 1. Deletes all reports created by the user
 * 2. Deletes the user account row from UserAccounts table
 * 3. Returns { success: true } if both succeeded
 * 4. Returns { success: false, message: "..." } if either step failed
 */
export async function deleteUserAndReports(userId: string): Promise<{ success: boolean; message?: string }> {
    // Step 1: Delete all reports created by this user
    const reportResult = await deleteReportsByUser(userId);
    if (!reportResult) {
        return {
            success: false,
            message: `Failed to delete reports for user ${userId}`,
        };
    }

    // Step 2: Delete the user account row
    const accountResult = await deleteUserAccount(userId);
    if (!accountResult) {
        return {
            success: false,
            message: `Failed to delete UserAccounts row for user ${userId}`,
        };
    }

    return { success: true };
}

/**
 * Optional helper: Signs out the current Supabase auth session.
 * Use this after deleteUserAndReports() succeeds to clean up the user session.
 * 
 * @returns Promise<boolean> - true if sign out succeeded, false on error
 * 
 * @example
 * // After deleteUserAndReports succeeds:
 * await signOut();
 * navigate('/login');
 */
export async function signOut(): Promise<boolean> {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out", error);
        return false;
    }
    return true;
}
