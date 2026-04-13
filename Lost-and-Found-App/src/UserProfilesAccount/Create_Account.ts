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
    // Inserts into UserAccounts table with the new user's ID and stuff
    const rawPhone = phonenumber ?? "";
    const digits = rawPhone.replace(/\D/g, "");
    const phoneNumeric = digits.length ? Number(digits) : null;

    const { data: insertData, error: insertError } = await supabase
        .from("UserAccounts")
        .insert([
            {
                Username: username,
                Password: password,
                Email: email,
                Phonenumber: phoneNumeric
            }
        ])
        .select();

    if (insertError) {
        console.error("Error inserting into UserAccounts table:", insertError);
        return null;
    }

    if (!insertData) {
        console.warn("Insert succeeded but returned no data (insertData is null)");
    }

    // Welcome email temporarily disabled because of some error I had.
    // To re-enable, uncomment the code below.
    /*
    try {
        const notification = await sendWelcomeEmail(email, username);
        if (!notification.success) {
            console.warn("Welcome email dispatch failed:", notification.error);
        }
    } catch (err) {
        console.error("Unexpected error sending welcome email:", err);
    }
    */

    console.log("Account created and inserted into UserAccounts:", insertData);
    return insertData;
}

export default createAccount;