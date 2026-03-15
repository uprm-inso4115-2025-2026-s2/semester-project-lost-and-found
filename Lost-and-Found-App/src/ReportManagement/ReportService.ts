import { supabase } from "../supabaseClient";
import type { ReportStatus } from "../ReportManagement/Reports";

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
) {

  const { data, error } = await supabase
    .from("reports")
    .update({ status: status })
    .eq("id", reportId);

  if (error) {
    throw error;
  }

  return data;
}
import { Report } from "../ReportManagement/Reports";

export async function changeReportStatus(
  report: Report,
  newStatus: ReportStatus
) {

  report.setStatus(newStatus);

  const { data, error } = await supabase
    .from("reports")
    .update({ status: report.getStatus() })
    .eq("id", report.getID());

  if (error) {
    throw error;
  }

  return data;
}