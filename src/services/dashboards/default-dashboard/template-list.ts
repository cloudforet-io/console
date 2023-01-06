import { blankDashboard } from '@/services/dashboards/default-dashboard/templates/blank';
import {
    cdnAndTrafficCostDashboard,
    cdnAndTrafficCostDashboardPreview,
} from '@/services/dashboards/default-dashboard/templates/cdn-and-traffic-cost';
import {
    monthlyCostSummaryDashboard,
    monthlyCostSummaryDashboardPreview,
} from '@/services/dashboards/default-dashboard/templates/monthly-cost-summary';

export const DASHBOARD_TEMPLATES = {
    monthlyCostSummary: monthlyCostSummaryDashboard,
    cdnTrafficCost: cdnAndTrafficCostDashboard,
    blank: blankDashboard,
};

export const DASHBOARD_TEMPLATE_PREVIEWS = [
    monthlyCostSummaryDashboardPreview,
    cdnAndTrafficCostDashboardPreview,
];
