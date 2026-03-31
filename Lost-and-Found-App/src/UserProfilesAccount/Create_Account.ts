import { supabase } from "../supabaseClient";
import { sendWelcomeEmail } from "./NotificationService";

async function createAccount(username: string, password: string, email: string, phonenumber: string) {
    // Auth user creation
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (signUpError) {
        console.error("Error creating auth user:", signUpError);
        return null;
    }

    // Inserts into UserAccounts table with the new user's ID and stuff
    const userId = signUpData?.user?.id;
    if (!userId) {
        console.error("No user ID returned from signup");
        return null;
    }

    const { data: insertData, error: insertError } = await supabase
        .from("UserAccounts")
        .insert([
            {
                Username: username,
                Password: password,
                Email: email,
                Phonenumber: phonenumber
            }
        ]);

    if (insertError) {
        console.error("Error inserting into UserAccounts table:", insertError);
        return null;
    }

    // Send a welcome email
    try {
        const notification = await sendWelcomeEmail(email, username);
        if (!notification.success) {
            console.warn("Welcome email dispatch failed:", notification.error);
        }
    } catch (err) {
        console.error("Unexpected error sending welcome email:", err);
    }

    console.log("Account created and inserted into UserAccounts:", insertData);
    return insertData;
}

export default createAccount;