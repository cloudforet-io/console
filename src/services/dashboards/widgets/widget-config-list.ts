// base widgets
import basePie from '@/services/dashboards/widgets/_base/base-pie/widget-config';
import baseRegion from '@/services/dashboards/widgets/_base/base-region/widget-config';
import baseTrend from '@/services/dashboards/widgets/_base/base-trend/widget-config';
// console widgets
import awsCloudFrontCost from '@/services/dashboards/widgets/aws-cloud-front-cost/widget-config';
import awsDataTransferByRegion from '@/services/dashboards/widgets/aws-data-transfer-by-region/widget-config';
import awsDataTransferCostTrend from '@/services/dashboards/widgets/aws-data-transfer-cost-trend/widget-config';
import budgetStatus from '@/services/dashboards/widgets/budget-status/widget-config';
import budgetUsageSummary from '@/services/dashboards/widgets/budget-usage-summary/widget-config';
import budgetUsageWithForecast from '@/services/dashboards/widgets/budget-usage-with-forecast/widget-config';
import costAnalysisQuery from '@/services/dashboards/widgets/cost-analysis-query/widget-config';
import costByRegion from '@/services/dashboards/widgets/cost-by-region/widget-config';
import costDonut from '@/services/dashboards/widgets/cost-donut/widget-config';
import costMap from '@/services/dashboards/widgets/cost-map/widget-config';
import costPie from '@/services/dashboards/widgets/cost-pie/widget-config';
import costTrendStacked from '@/services/dashboards/widgets/cost-trend-stacked/widget-config';
import costTrend from '@/services/dashboards/widgets/cost-trend/widget-config';
import monthlyCost from '@/services/dashboards/widgets/monthly-cost/widget-config';
// type
// eslint-disable-next-line import/order
import type { WidgetConfig } from '@/services/dashboards/widgets/config';

export const CONSOLE_WIDGET_ORDER = [
    'monthlyCost',
    'budgetUsageSummary',
    'costMap',
    'costTrend',
    'awsDataTransferCostTrend',
    'costTrendStacked',
    'awsCloudFrontCost',
    'costDonut',
    'costByRegion',
    'awsDataTransferByRegion',
    'budgetStatus',
    'budgetUsageWithForecast',
    'costPie',
];

export const CONSOLE_WIDGET_CONFIGS: Record<string, Partial<WidgetConfig>> = {
    monthlyCost,
    budgetUsageSummary,
    costMap,
    costTrend,
    awsDataTransferCostTrend,
    costTrendStacked,
    awsCloudFrontCost,
    costDonut,
    costByRegion,
    awsDataTransferByRegion,
    budgetStatus,
    budgetUsageWithForecast,
    costPie,
    costAnalysisQuery,
};

export const BASE_WIDGET_CONFIGS: Record<string, Partial<WidgetConfig>> = {
    baseTrend,
    baseRegion,
    basePie,
};
