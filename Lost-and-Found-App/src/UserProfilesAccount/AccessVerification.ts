import { supabase } from "../supabaseClient";


//acces lvl for users with upr.edu or uprm.edu email domains, view only for all other users

export type AccessLevel = "full_access" | "view_only";

// Function to determine access level based on email domain

export function getAccessLevelFromEmail(email: string): AccessLevel {
    const domain = email.trim().toLowerCase().split("@")[1] ?? "";

    if (
        domain === "upr.edu" ||
        domain === "uprm.edu" ||
        domain.endsWith(".upr.edu") ||
        domain.endsWith(".uprm.edu")
    ) {
        return "full_access";
    }

    return "view_only";
}


// Function to get the current user's access level

export async function getCurrentUserAccessLevel(): Promise<AccessLevel | null> {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user?.email) {
        return null;
    }

    return getAccessLevelFromEmail(authData.user.email);
}


// Helper functions to check access levels

export async function hasFullAccess(): Promise<boolean> {
    const accessLevel = await getCurrentUserAccessLevel();
    return accessLevel === "full_access";
}

export async function hasViewOnlyAccess(): Promise<boolean> {
    const accessLevel = await getCurrentUserAccessLevel();
    return accessLevel === "view_only";
}

export async function requireFullAccess(): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel | null;
    message?: string;
}> {
    const accessLevel = await getCurrentUserAccessLevel();

    if (accessLevel !== "full_access") {
        return {
            allowed: false,
            accessLevel,
            message: "You do not have permission to perform this action."
        };
    }

    return {
        allowed: true,
        accessLevel
    };
}