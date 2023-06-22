import { blankDashboard } from '@/services/dashboards/default-dashboard/templates/blank';
import { cdnAndTrafficCostDashboard } from '@/services/dashboards/default-dashboard/templates/cdn-and-traffic-cost';
import { complianceOverviewDashboard } from '@/services/dashboards/default-dashboard/templates/compliance-overview';
import { monthlyCostSummaryDashboard } from '@/services/dashboards/default-dashboard/templates/monthly-cost-summary';

export const DASHBOARD_TEMPLATES = {
    monthlyCostSummary: monthlyCostSummaryDashboard,
    cdnTrafficCost: cdnAndTrafficCostDashboard,
    complianceOverview: complianceOverviewDashboard,
    blank: blankDashboard,
};
