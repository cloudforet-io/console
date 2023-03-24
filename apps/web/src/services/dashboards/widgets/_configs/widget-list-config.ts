// base widgets
import basePie from '@/services/dashboards/widgets/_base/base-pie/widget-config';
import baseTrend from '@/services/dashboards/widgets/_base/base-trend/widget-config';
// console widgets
import awsCloudFrontCost from '@/services/dashboards/widgets/aws-cloud-front-cost/widget-config';
import awsDataTransferByRegion from '@/services/dashboards/widgets/aws-data-transfer-by-region/widget-config';
import awsDataTransferCostTrend from '@/services/dashboards/widgets/aws-data-transfer-cost-trend/widget-config';
import budgetStatus from '@/services/dashboards/widgets/budget-status/widget-config';
import budgetUsageByTarget from '@/services/dashboards/widgets/budget-usage-by-target/widget-config';
import budgetUsageSummary from '@/services/dashboards/widgets/budget-usage-summary/widget-config';
import costByRegion from '@/services/dashboards/widgets/cost-by-region/widget-config';
import costDonut from '@/services/dashboards/widgets/cost-donut/widget-config';
import costMap from '@/services/dashboards/widgets/cost-map/widget-config';
import costPie from '@/services/dashboards/widgets/cost-pie/widget-config';
import costTrendStacked from '@/services/dashboards/widgets/cost-trend-stacked/widget-config';
import costTrend from '@/services/dashboards/widgets/cost-trend/widget-config';
import monthlyCost from '@/services/dashboards/widgets/monthly-cost/widget-config';
// assets widget configs
// import awsPersonalHealthDashboard from '@/services/dashboards/widgets/aws-personal-health-dashboard/widget-config';
// import assetSummaryByRegions from '@/services/dashboards/widgets/asset-summary-by-regions/widget-config';
// import awsTrustedAdvisorProject from '@/services/dashboards/widgets/aws-trusted-advisor/project-scope/widget-config';
// import awsTrustedAdvisorWorkspace from '@/services/dashboards/widgets/aws-trusted-advisor/workspace-scope/widget-config';
// import cloudAssetSummary from '@/services/dashboards/widgets/cloud-asset-summary/widget-config';
// import dailyUpdates from '@/services/dashboards/widgets/daily-updates/widget-config';
// import topResourceManagingProjects from '@/services/dashboards/widgets/top-resource-managing-projects/widget-config';
// type
// eslint-disable-next-line import/order
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';

export const CONSOLE_WIDGET_LIST = [
    'monthlyCost',
    'budgetUsageSummary',
    'costMap',
    'costTrend',
    'awsDataTransferCostTrend',
    'costTrendStacked',
    'awsCloudFrontCost',
    'costPie',
    'costDonut',
    'costByRegion',
    'awsDataTransferByRegion',
    'budgetStatus',
    'budgetUsageByTarget',
] as const;

export type WidgetKey = typeof CONSOLE_WIDGET_LIST[number];

export const CONSOLE_WIDGET_CONFIGS: Record<WidgetKey, Partial<WidgetConfig>> = {
    monthlyCost,
    budgetUsageSummary,
    costMap,
    costTrend,
    awsDataTransferCostTrend,
    costTrendStacked,
    awsCloudFrontCost,
    costPie,
    costDonut,
    costByRegion,
    awsDataTransferByRegion,
    budgetStatus,
    budgetUsageByTarget,
    // awsPersonalHealthDashboard,
    // assetSummaryByRegions,
    // awsTrustedAdvisorProject,
    // awsTrustedAdvisorWorkspace,
    // cloudAssetSummary,
    // dailyUpdates,
    // topResourceManagingProjects,
    // costAnalysisQuery,
};

export const BASE_WIDGET_CONFIGS: Record<string, Partial<WidgetConfig>> = {
    baseTrend,
    basePie,
};
