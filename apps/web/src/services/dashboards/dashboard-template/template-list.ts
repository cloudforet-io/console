import { adminBlankDashboard, blankDashboard } from '@/services/dashboards/dashboard-template/templates/blank';
import { adminCdnAndTrafficCostDashboard, cdnAndTrafficCostDashboard } from '@/services/dashboards/dashboard-template/templates/cdn-and-traffic-cost';
import { adminComplianceOverviewDashboard, complianceOverviewDashboard } from '@/services/dashboards/dashboard-template/templates/compliance-overview';
import { adminMonthlyCostSummaryDashboard, monthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/monthly-cost-summary';

export const DASHBOARD_TEMPLATES = {
    monthlyCostSummary: monthlyCostSummaryDashboard,
    cdnTrafficCost: cdnAndTrafficCostDashboard,
    complianceOverview: complianceOverviewDashboard,
    blank: blankDashboard,
};

export const ADMIN_DASHBOARD_TEMPLATES = {
    monthlyCostSummary: adminMonthlyCostSummaryDashboard,
    cdnTrafficCost: adminCdnAndTrafficCostDashboard,
    complianceOverview: adminComplianceOverviewDashboard,
    blank: adminBlankDashboard,
};
