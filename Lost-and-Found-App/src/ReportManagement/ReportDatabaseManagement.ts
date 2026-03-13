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

export async function getReport(id: string): Promise<Report> {
    const { data, error } = await supabase
        .from('reports')
        .select()
        .eq('id', id)
        .single();

    if (error) {
        console.error(error);
        return Report.CreateDefault();
    }

    let category: Category = 'OTHER';
    if (data.category === "Electronics") { category = 'ELECTRONICS'; }
    else if (data.category === "Personal") { category = 'PERSONAL'; }
    else if (data.category === "Office Supplies") { category = 'OFFICE SUPPLIES'; }

    let status: ReportStatus = 'ACTIVE';
    if (data.status === "Resolved") { status = 'RESOLVED'; }
    else if (data.status === "Claimed") { status = 'CLAIMED'; }

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
        if (data[i].status === "Resolved") { status = 'RESOLVED'; }
        else if (data[i].status === "Claimed") { status = 'CLAIMED'; }

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
