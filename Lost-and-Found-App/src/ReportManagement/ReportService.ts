import { supabase } from "../supabaseClient";
import type { ReportStatus } from "../ReportManagement/Reports";

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
) {

    // Test log
  console.log("Sending update to Supabase:", { reportId, status });
  
  

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
import { Report } from "../ReportManagement/Reports";

export async function changeReportStatus(
  report: Report,
  newStatus: ReportStatus
  
) {
  
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