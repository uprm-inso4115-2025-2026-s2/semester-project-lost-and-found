import { supabase } from "../supabaseClient.ts";
import { Report, type Category, type ReportStatus, type ReportType } from "./Reports.ts";

export async function storeReport(report: Report): Promise<boolean> {
    const { error } = await supabase
        .from('reports')
        .insert([report.toSupabase()]);

    if (error) {
        console.error(error);
        return false;
    }

    return true;
}

export async function editReport(id: string, replacement: Report): Promise<boolean> {
    const { error } = await supabase
        .from('reports')
        .update(replacement.toSupabase())
        .eq('id', id);

    if (error) {
        console.error(error);
        return false;
    }
    return true;
}

export async function deleteReport(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        return false;
    }

    return true;
}

export async function deleteReportsByUser(userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('reports')
        .delete()
        .eq('createdBy', userId);

    if (error) {
        console.error("Error deleting reports for user", userId, error);
        return false;
    }

    return true;
}

export async function getReport(id: string): Promise<Report | null> {
    const { data, error } = await supabase
        .from('reports')
        .select()
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error("Report not found or error:", error);
        return null; // Return null for missing/deleted reports
    }

    let category: Category = 'OTHER';
    if (data.category === "Electronics") { category = 'ELECTRONICS'; }
    else if (data.category === "Personal") { category = 'PERSONAL'; }
    else if (data.category === "Office Supplies") { category = 'OFFICE SUPPLIES'; }

    let status: ReportStatus = 'ACTIVE';
    if (data.status === "Resolved" || data.status === "RESOLVED") {
        status = 'RESOLVED';
    } else if (data.status === "Claimed" || data.status === "CLAIMED") {
        status = 'CLAIMED';
    }

    let type: ReportType = 'LOST';
    if (data.type === "Found") { type = 'FOUND'; }

    const prop = {
        title: data.title,
        description: data.description,
        dateFound: new Date(data.dateFound),
        location: data.location,
        category: category,
        tags: data.tags,
        imageUrl: data.imageURL,
        createdBy: data.createdBy,
        type: type
    }

   return Report.fromSupabase(data.id, prop, status);
}

    export async function getAllReports(): Promise<Report[]> {
        const { data, error } = await supabase
            .from('reports')
            .select()

        if (!data || error) {
            console.error(error);
            return [];
        }

    let reports: Report[] = [];

    for (let i = 0; i < data.length; i++) {
        let category: Category = 'OTHER';
        if (data[i].category === "Electronics") { category = 'ELECTRONICS'; }
        else if (data[i].category === "Personal") { category = 'PERSONAL'; }
        else if (data[i].category === "Office Supplies") { category = 'OFFICE SUPPLIES'; }

        let status: ReportStatus = 'ACTIVE';
        if (data[i].status === "Resolved" || data[i].status === "RESOLVED") {
            status = 'RESOLVED';
        } else if (data[i].status === "Claimed" || data[i].status === "CLAIMED") {
            status = 'CLAIMED';
        }

        let type: ReportType = 'LOST';
        if (data[i].type === "Found") { type = 'FOUND'; }

        const prop = {
            title: data[i].title,
            description: data[i].description,
            dateFound: new Date(data[i].dateFound),
            location: data[i].location,
            category: category,
            tags: data[i].tags,
            imageUrl: data[i].imageURL,
            createdBy: data[i].createdBy,
            type: type
        }

        reports.push(Report.fromSupabase(data[i].id, prop, status));
    }
    
    return reports;
}

import { checkForDuplicates, type DuplicateCheckResult } from "./DuplicateVerification.ts";


 // Store a report after checking for duplicates
 // Returns duplicate warning if similar reports found (but doesn't block storage)
 
export async function storeReportWithDuplicateCheck(report: Report): Promise<{
  success: boolean;
  duplicateWarning: DuplicateCheckResult;
}> {
  // Check for potential duplicates
  const duplicateWarning = await checkForDuplicates(report);

  // Always store the report
  const success = await storeReport(report);

  return {
    success: success,
    duplicateWarning: duplicateWarning
  };
}