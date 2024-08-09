import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { awsCdnAndTrafficDashboard } from '@/services/dashboards/dashboard-template/templates/aws-cdn-and-traffic';
import { awsMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/aws-monthly-cost-summary';
import { azureMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/azure-monthly-cost-summary';
import { dCloComplianceOverviewDashboard } from '@/services/dashboards/dashboard-template/templates/d-clo-compliance-overview';
import { googleMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/google-monthly-cost-summary';
import { prowlerComplianceOverviewDashboard } from '@/services/dashboards/dashboard-template/templates/prowler-compliance-overview';


export const DASHBOARD_TEMPLATES: Record<string, DashboardTemplate> = {
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

export const generateDashboardTemplateList = async (): Promise<DashboardTemplate[]> => {
    try {
        const templateMap: Record<string, DashboardTemplate> = {
            // aws
            awsMonthlyCostSummary: {
                ...DASHBOARD_TEMPLATES.awsMonthlyCostSummary,
            },
            awsCdnAndTraffic: {
                ...DASHBOARD_TEMPLATES.awsCdnAndTraffic,
            },
            // azure
            azureMonthlyCostSummary: {
                ...DASHBOARD_TEMPLATES.azureMonthlyCostSummary,
            },
            // google
            googleMonthlyCostSummary: {
                ...DASHBOARD_TEMPLATES.googleMonthlyCostSummary,
            },
            // etc
            prowlerComplianceOverview: {
                ...DASHBOARD_TEMPLATES.prowlerComplianceOverview,
            },
            dCloComplianceOverview: {
                ...DASHBOARD_TEMPLATES.dCloComplianceOverview,
            },
        };
        return Object.values(templateMap);
    } catch (e) {
        console.error(e);
        return [];
    }
};
