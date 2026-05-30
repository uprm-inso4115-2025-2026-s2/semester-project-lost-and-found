import { getReportByUser } from "./ReportDatabaseManagement";
import { Report } from "./Reports";

/*TESTING PURPOSES ONLY*/

async function testGetReportByUser() {
    const testUserID = "12345";
    const reports = await getReportByUser(testUserID);
    const dateFound = new Date('2026-02-26');

    const report = Report.Create({
         type: 'LOST',
         title: 'I Phone 6 Million',
         description: 'FUN EVENT',
         dateFound: dateFound,
         expiresAt: new Date(dateFound.getTime()+ 90*24*60*60*1000),
         location: 'Choliseo',
         category: "ELECTRONICS",
         tags: [],
         imageUrl: undefined,
         createdBy: '12345',
   });

    console.log('Reports for user ID: ' + testUserID);
    console.log(reports);
    console.log('Expected report:');
    console.log(report);
}

testGetReportByUser();