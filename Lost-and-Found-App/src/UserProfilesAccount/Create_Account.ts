import { supabase } from "../supabaseClient";

async function createAccount(username: string, password: string, email: string, phonenumber: string) {
    // Auth user creation (For some reason)
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
                UserId: userId,
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

    console.log("Account created and inserted into UserAccounts:", insertData);
    return insertData;
}

export default createAccount;