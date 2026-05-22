import { supabase } from "../supabaseClient";

export type UserRole = "admin" | "user";

/**
 * Gets current authenticated user's role.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user?.email) {
        return null;
    }

    const { data, error } = await supabase
        .from("UserAccounts")
        .select("Role")
        .eq("Email", authData.user.email)
        .single();

    if (error || !data) {
        return null;
    }

    return data.Role as UserRole;
}

/**
 * Returns true if user is admin.
 */
export async function isAdmin(): Promise<boolean> {
    const role = await getCurrentUserRole();
    return role === "admin";
}

/**
 * Protects admin-only operations.
 */
export async function requireAdmin(): Promise<{
    allowed: boolean;
    message?: string;
}> {

    const admin = await isAdmin();

    if (!admin) {
        return {
            allowed: false,
            message: "Administrator access required."
        };
    }

    return {
        allowed: true
    };
}