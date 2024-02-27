import { awsCdnAndTrafficDashboard } from '@/services/dashboards/dashboard-template/templates/aws-cdn-and-traffic';
import { awsMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/aws-monthly-cost-summary';
import { azureMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/azure-monthly-cost-summary';
import { dCloComplianceOverviewDashboard } from '@/services/dashboards/dashboard-template/templates/d-clo-compliance-overview';
import { googleMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/google-monthly-cost-summary';
import { prowlerComplianceOverviewDashboard } from '@/services/dashboards/dashboard-template/templates/prowler-compliance-overview';


export const DASHBOARD_TEMPLATES = {
    // aws
    awsMonthlyCostSummary: awsMonthlyCostSummaryDashboard,
    awsCdnAndTraffic: awsCdnAndTrafficDashboard,
    // azure
    azureMonthlyCostSummary: azureMonthlyCostSummaryDashboard,
    // google
    googleMonthlyCostSummary: googleMonthlyCostSummaryDashboard,
    // etc
    prowlerComplianceOverview: prowlerComplianceOverviewDashboard,
    dCloComplianceOverview: dCloComplianceOverviewDashboard,
};
