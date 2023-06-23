import { blankDashboard } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/templates/blank';
import { cdnAndTrafficCostDashboard } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/templates/cdn-and-traffic-cost';
import { complianceOverviewDashboard } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/templates/compliance-overview';
import { monthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/templates/monthly-cost-summary';

export const DASHBOARD_TEMPLATES = {
    monthlyCostSummary: monthlyCostSummaryDashboard,
    cdnTrafficCost: cdnAndTrafficCostDashboard,
    complianceOverview: complianceOverviewDashboard,
    blank: blankDashboard,
};
