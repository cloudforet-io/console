import {
    monthlyCostSummaryDashboard,
    monthlyCostSummaryDashboardPreview,
} from '@/services/dashboards/default-dashboard/templates/monthly-cost-summary';

export const DASHBOARD_TEMPLATES = {
    monthlyCostSummary: monthlyCostSummaryDashboard,
};

export const DASHBOARD_TEMPLATE_PREVIEWS = [
    monthlyCostSummaryDashboardPreview,
];
