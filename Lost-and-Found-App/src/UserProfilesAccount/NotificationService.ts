import { supabase } from "../supabaseClient";

export type NotificationType = "WELCOME" | "REPORT_POSTED" | "ACCOUNT_UPDATE";

export async function sendEmailNotification(
  email: string,
  subject: string,
  message: string
) {
  // This needs supa function "send-email".
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: JSON.stringify({ email, subject, message }),
  });

  if (error) {
    console.error("Failed to send email notification", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function sendWelcomeEmail(email: string, username: string) {
  const subject = "Welcome to UPRM Lost & Found";
  const message = `Hi ${username},\n\nThanks for creating an account! You can now report lost or found items and receive updates by email.\n\nBest,\nLost & Found team`;
  return sendEmailNotification(email, subject, message);
}

export async function sendReportCreatedEmail(email: string, reportTitle: string) {
  const subject = "Your report has been logged";
  const message = `Your report '${reportTitle}' has been created successfully.\n\nWe will notify you when there is any update.`;
  return sendEmailNotification(email, subject, message);
}
