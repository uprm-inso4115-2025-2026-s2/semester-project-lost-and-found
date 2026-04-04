import { supabase } from "../supabaseClient.ts";
import { Report } from "./Reports.ts";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  potentialMatches: PotentialMatch[];
}

export interface PotentialMatch {
  reportId: string;
  title: string;
  location: string;
  category: string;
  similarityScore: number;
}


 // Check if a new report might be a duplicate
 // Returns warning if similar ACTIVE reports exist

export async function checkForDuplicates(newReport: Report): Promise<DuplicateCheckResult> {
  // Get all ACTIVE reports of the same type (LOST or FOUND)
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'Active')
    .eq('type', newReport.getType());

  if (error || !data) {
    console.error('Error checking duplicates:', error);
    return { isDuplicate: false, potentialMatches: [] };
  }

  const matches: PotentialMatch[] = [];

  // Compare against each existing report
  for (const existingReport of data) {
    const score = calculateSimilarity(newReport, existingReport);
    
    // If similarity is 60% or higher, flag as potential duplicate
    if (score >= 0.6) {
      matches.push({
        reportId: existingReport.id,
        title: existingReport.title,
        location: existingReport.location,
        category: existingReport.category,
        similarityScore: score
      });
    }
  }

  // Sort by similarity highest first
  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  return {
    isDuplicate: matches.length > 0,
    potentialMatches: matches
  };
}

 // Calculate similarity (0 = completely different, 1 = identical)

function calculateSimilarity(newReport: Report, existingReport: any): number {
  let totalScore = 0;

  // 1. Compare titles: 40% of total score
  const titleScore = compareStrings(
    newReport.getTitle().toLowerCase(),
    existingReport.title.toLowerCase()
  );
  totalScore += titleScore * 0.4;

  // 2. Compare descriptions: 30% of total score
  const descScore = compareStrings(
    newReport.getDescription().toLowerCase(),
    existingReport.description.toLowerCase()
  );
  totalScore += descScore * 0.3;

  // 3. Compare locations: 20% of total score
  const locationScore = compareStrings(
    newReport.getLocation().toLowerCase(),
    existingReport.location.toLowerCase()
  );
  totalScore += locationScore * 0.2;

  // 4. Compare categories: 10% of total score
  if (newReport.getCategory() === existingReport.category) {
    totalScore += 0.1;
  }

  return totalScore;
}


 // Compare two strings and return similarity score
 
function compareStrings(str1: string, str2: string): number {
  // Exact match
  if (str1 === str2) return 1.0;

  // Empty strings
  if (!str1 || !str2) return 0;

  // Split into words
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);

  // Count matching words
  let matches = 0;
  for (const word1 of words1) {
    if (words2.includes(word1)) {
      matches++;
    }
  }

  // Calculate score based on matching words
  const totalWords = Math.max(words1.length, words2.length);
  return matches / totalWords;
}

// Example use: 
// import { storeReportWithDuplicateCheck } from './ReportDatabaseManagement';

// // When user submits a report
// async function submitReport(reportData) {
//   const newReport = Report.Create(reportData);
  
//   const result = await storeReportWithDuplicateCheck(newReport);
  
//   if (result.success) {
//     // Check if there were potential duplicates
//     if (result.duplicateWarning.isDuplicate) {
//       // Show warning to user (but report is already saved)
//       console.log('Warning: Similar reports found!');
//       result.duplicateWarning.potentialMatches.forEach(match => {
//         console.log(`- ${match.title} at ${match.location} (${Math.round(match.similarityScore * 100)}% similar)`);
//       });
//     }
    
//     return 'Report submitted successfully!';
//   } else {
//     return 'Error submitting report';
//   }
// }