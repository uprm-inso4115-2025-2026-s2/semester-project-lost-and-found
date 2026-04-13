import { supabase } from "../supabaseClient";


// Checks which fields (email, username, phone) are duplicated
async function checkDuplicateDetails(email: string, username: string, phonenumber: string) {
    const { data, error } = await supabase
        .from("UserAccounts")
        .select("Email, Username, Phonenumber")
        .or(`Email.eq.${email},Username.eq.${username},Phonenumber.eq.${phonenumber}`);

    if (error) {
        console.error("Error checking for duplicate details:", error);
        return { error: true };
    }


    let duplicate = {
        email: false,
        username: false,
        phone: false
    };

    if (data && data.length > 0) {
        for (const row of data) {
            if (row.Email === email) duplicate.email = true;
            if (row.Username === username) duplicate.username = true;
            if (row.Phonenumber === phonenumber) duplicate.phone = true;
        }
    }

    return duplicate;
}

export default checkDuplicateDetails;