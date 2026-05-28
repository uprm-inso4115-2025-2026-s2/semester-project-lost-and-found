import { supabase } from "../supabaseClient";

/** Returns true if the email belongs to an official UPR domain. */
export function isUPREmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return (
    domain === "upr.edu" ||
    domain === "uprm.edu" ||
    domain.endsWith(".upr.edu") ||
    domain.endsWith(".uprm.edu")
  );
}

async function createAccount(
  username: string,
  password: string,
  email: string,
  phonenumber: string
): Promise<{ data: any[] | null; error: string | null }> {
  if (!isUPREmail(email)) {
    return {
      data: null,
      error:
        "Only @upr.edu email addresses can create an account. " +
        "If you don't have a UPR account you can browse as a Guest.",
    };
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error("Error creating auth user:", signUpError);
    return { data: null, error: signUpError.message };
  }

  const rawPhone = phonenumber ?? "";
  const digits = rawPhone.replace(/\D/g, "");
  const phoneNumeric = digits.length ? Number(digits) : null;

  const { data: insertData, error: insertError } = await supabase
    .from("UserAccounts")
    .insert([
      {
        Username: username,
        Email: email,
        Phonenumber: phoneNumeric,
      },
    ])
    .select();

  if (insertError) {
    console.error("Error inserting into UserAccounts table:", insertError);
    return { data: null, error: insertError.message };
  }

  console.log("Account created:", insertData);
  return { data: insertData, error: null };
}

export default createAccount;