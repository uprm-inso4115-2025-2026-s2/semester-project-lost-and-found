import { supabase } from "../supabaseClient";
import type { ReportStatus } from "../ReportManagement/Reports";
import { Report } from "../ReportManagement/Reports";

/**
 * Update report status with permission checks
 * @throws Error if user doesn't have permission
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  userId: string
) {
  console.log("Sending update to Supabase:", { reportId, status, userId });

  // Get the report to check permissions
  const { data: reportData, error: fetchError } = await supabase
    .from("reports")
    .select("createdBy, claimedBy, status")
    .eq("id", reportId)
    .single();

  if (fetchError || !reportData) {
    console.error("Failed to fetch report for permission check:", fetchError);
    throw new Error("Report not found");
  }

  // RESTRICTION CHECKS
  const isAuthor = reportData.createdBy === userId;
  const isClaimer = reportData.claimedBy === userId;
  const currentStatus = reportData.status;

  // Check 1: User cannot claim their own report
  if (status === "CLAIMED" && isAuthor) {
    throw new Error("You cannot claim your own report");
  }

  // Check 2: Only claimer can unclaim (change from CLAIMED back to ACTIVE)
  if (currentStatus === "CLAIMED" && status === "ACTIVE" && !isClaimer) {
    throw new Error("Only the person who claimed this report can unclaim it");
  }

  // Check 3: Only author can resolve/close a report
  if (status === "RESOLVED" && !isAuthor) {
    throw new Error("Only the report author can close this report");
  }

  // Check 4: Only author can reopen a resolved report
  if (currentStatus === "RESOLVED" && status === "ACTIVE" && !isAuthor) {
    throw new Error("Only the report author can reopen this report");
  }

  // All checks passed - update the status
  const { data, error } = await supabase
    .from("reports")
    .update({ status: status })
    .eq("id", reportId);

  if (error) {
    console.error("Supabase update error:", error);
    throw error;
  }

  console.log("Supabase update success:", data);
  return data;
}

/**
 * Change report status using Report object with permission checks
 * @throws Error if user doesn't have permission
 */
export async function changeReportStatus(
  report: Report,
  newStatus: ReportStatus,
  userId: string
) {
  const currentStatus = report.getRawStatus();
  const isAuthor = report.getCreatedBy() === userId;
  const isClaimer = report.getClaimedBy() === userId;

  // RESTRICTION CHECKS
  // Check 1: User cannot claim their own report
  if (newStatus === "CLAIMED" && isAuthor) {
    throw new Error("You cannot claim your own report");
  }

  // Check 2: Only claimer can unclaim
  if (currentStatus === "CLAIMED" && newStatus === "ACTIVE" && !isClaimer) {
    throw new Error("Only the person who claimed this report can unclaim it");
  }

  // Check 3: Only author can resolve
  if (newStatus === "RESOLVED" && !isAuthor) {
    throw new Error("Only the report author can close this report");
  }

  // Check 4: Only author can reopen
  if (currentStatus === "RESOLVED" && newStatus === "ACTIVE" && !isAuthor) {
    throw new Error("Only the report author can reopen this report");
  }

  // All checks passed - update in Report object and database
  report.setStatus(newStatus);

  const { data, error } = await supabase
    .from("reports")
    .update({ status: report.getRawStatus() })
    .eq("id", report.getID());

  if (error) {
    throw error;
  }

  return data;
}