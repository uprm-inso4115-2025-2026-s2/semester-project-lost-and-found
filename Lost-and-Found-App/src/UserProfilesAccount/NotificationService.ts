import { supabase } from "../supabaseClient";

export type NotificationType = "WELCOME" | "REPORT_POSTED" | "ACCOUNT_UPDATE" | "ITEM_FOUND" | null;

export async function sendEmailNotification(
  email: string,
  subject: string,
  message: string
) {
  // This needs supabase Edge Function "send-email" configured.
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: JSON.stringify({ email, subject, message }),
    });

    if (error) {
      console.error("Failed to send email notification (function returned error)", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email notification (network/error)", err);
    return { success: false, error: err };
  }
}

function normalizeRow(row: any) {
  if (!row) return null;
  const id = row.id ?? null;
  const title = row.Title ?? "";
  const body = row.Body ?? "";
  const type = row.Type ?? null;
  const isReadRaw = row.IsRead ?? false;
  const isRead = isReadRaw === true || isReadRaw === "t" || isReadRaw === 1 || isReadRaw === "1";
  const created_at = row.created_at ?? null;

  return {
    id: id ? String(id) : "",
    title,
    body,
    type,
    isRead,
    created_at,
  };
}

// Create an in-app notification and optionally send an email as well.
export async function sendUserNotification(
  email: string,
  title: string,
  body: string,
  type: NotificationType = null,
  sendEmail = true
) {
  // Try PascalCase insert first (matches existing codebase patterns), then fall back to snake_case.
  const pascal = { Email: email, Title: title, Body: body, Type: type, IsRead: false } as any;
  try {
    const { data, error } = await supabase.from("Notifications").insert([pascal]);
    if (error) {
      // fallback to snake_case
      const snake = { email, title, body, type, is_read: false } as any;
      const { data: data2, error: error2 } = await supabase.from("Notifications").insert([snake]);
      if (error2) {
        console.error("Failed to create in-app notification (both casings)", error, error2);
        if (sendEmail) await sendEmailNotification(email, title, body);
        return { success: false, error: error2 };
      }
      if (sendEmail) await sendEmailNotification(email, title, body);
      return { success: true, data: data2 };
    }

    if (sendEmail) await sendEmailNotification(email, title, body);
    return { success: true, data };
  } catch (err) {
    console.error("Failed to create in-app notification (network/error)", err);
    try {
      const snake = { email, title, body, type, is_read: false } as any;
      const { data: data2, error: error2 } = await supabase.from("Notifications").insert([snake]);
      if (error2) {
        console.error("Fallback insert also failed", error2);
        if (sendEmail) await sendEmailNotification(email, title, body);
        return { success: false, error: error2 };
      }
      if (sendEmail) await sendEmailNotification(email, title, body);
      return { success: true, data: data2 };
    } catch (err2) {
      console.error("Failed fallback in-app notification (network)", err2);
      if (sendEmail) await sendEmailNotification(email, title, body);
      return { success: false, error: err2 };
    }
  }
}

export async function getUserNotifications(email: string) {
  // Try multiple column namings for the email predicate and ordering.
  const attempts = [
    { emailCol: "Email", orderCol: "created_at" },
    { emailCol: "email", orderCol: "created_at" },
    { emailCol: "Email", orderCol: "createdAt" },
    { emailCol: "email", orderCol: "createdAt" },
  ];

  let res: any = null;
  for (const a of attempts) {
    try {
      const q = supabase.from("Notifications").select("*").eq(a.emailCol, email);
      // attempt ordering when possible
      try {
        res = await q.order(a.orderCol, { ascending: false });
      } catch (e) {
        // Some drivers throw for unknown order column; fallback to no order
        res = await q;
      }
      if (!res.error) break;
    } catch (err) {
      // continue to next attempt
      res = { data: null, error: err } as any;
    }
  }

  if (!res || res.error) {
    console.error("Failed to fetch notifications", res?.error ?? "unknown");
    return { success: false, error: res?.error ?? "unknown" };
  }

  const normalized = (res.data || []).map(normalizeRow).filter(Boolean);
  return { success: true, data: normalized };
}

export async function markNotificationRead(notificationId: string) {
  // Try PascalCase update, then snake_case.
  try {
    let r = await supabase.from("Notifications").update({ IsRead: true }).eq("id", notificationId);
    if (r.error) {
      r = await supabase.from("Notifications").update({ is_read: true }).eq("id", notificationId);
      if (r.error) {
        // try alternate id column names
        r = await supabase.from("Notifications").update({ is_read: true }).eq("ID", notificationId);
        if (r.error) {
          console.error("Failed to mark notification read (all attempts)", r.error);
          return { success: false, error: r.error };
        }
      }
    }
    return { success: true, data: r.data };
  } catch (err) {
    console.error("Failed to mark notification read (network/error)", err);
    return { success: false, error: err };
  }
}

export async function sendWelcomeEmail(email: string, username: string) {
  const subject = "Welcome to UPRM Lost & Found";
  const message = `Hi ${username},\n\nThanks for creating an account! You can now report lost or found items and receive updates by email.\n\nBest,\nLost & Found team`;
  return sendUserNotification(email, subject, message, "WELCOME", true);
}

export async function sendReportCreatedEmail(email: string, reportTitle: string) {
  const subject = "Your report has been logged";
  const message = `Your report '${reportTitle}' has been created successfully.\n\nWe will notify you when there is any update.`;
  return sendUserNotification(email, subject, message, "REPORT_POSTED", true);
}
