// base widgets
import baseCountOfFindings from '@/services/dashboards/widgets/_base/base-count-of-findings/widget-config';
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
import countOfFailFindings from '@/services/dashboards/widgets/count-of-fail-findings/widget-config';
import countOfPassAndFailFindings from '@/services/dashboards/widgets/count-of-pass-and-fail-findings/widget-config';
import monthlyCost from '@/services/dashboards/widgets/monthly-cost/widget-config';
import severityStatusByService from '@/services/dashboards/widgets/severity-status-by-service/widget-config';
import trendOfPassAndFailFindings from '@/services/dashboards/widgets/trend-of-pass-and-fail-findings/widget-config';
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
    'severityStatusByService',
    'countOfFailFindings',
    'countOfPassAndFailFindings',
    'trendOfPassAndFailFindings',
] as const;

export type WidgetKey = typeof CONSOLE_WIDGET_LIST[number];

export const CONSOLE_WIDGET_CONFIGS: Record<WidgetKey, Partial<WidgetConfig>> = {
    // Cost Widgets
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
    // Asset Widgets
    severityStatusByService,
    countOfFailFindings,
    countOfPassAndFailFindings,
    trendOfPassAndFailFindings,
};

export const BASE_WIDGET_CONFIGS: Record<string, Partial<WidgetConfig>> = {
    baseTrend,
    basePie,
    baseCountOfFindings,
};
