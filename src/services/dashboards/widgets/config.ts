import type { WidgetConfig } from '@/services/dashboards/widgets/type';

// base widgets
import baseHorizontal from './_base/base-horizontal/widget-config';
import baseMap from './_base/base-map/widget-config';
import basePie from './_base/base-pie/widget-config';
import baseRegion from './_base/base-region/widget-config';
import baseTrend from './_base/base-trend/widget-config';
// console widgets
import awsCloudFrontCost from './aws-cloud-front-cost/widget-config';
import awsDataTransferByRegion from './aws-data-transfer-by-region/widget-config';
import awsDataTransferCostTrend from './aws-data-transfer-cost-trend/widget-config';
import budgetStatus from './budget-status/widget-config';
import budgetUsageSummary from './budget-usage-summary/widget-config';
import budgetUsageWithForecast from './budget-usage-with-forecast/widget-config';
import costByRegion from './cost-by-region/widget-config';
import costDonut from './cost-donut/widget-config';
import costMap from './cost-map/widget-config';
import costPie from './cost-pie/widget-config';
import costTrendStacked from './cost-trend-stacked/widget-config';
import costTrend from './cost-trend/widget-config';
import monthlyCost from './monthly-cost/widget-config';

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

export const CONSOLE_WIDGET_CONFIGS: Record<string, WidgetConfig> = {
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
};

export const BASE_WIDGET_CONFIGS: Record<string, WidgetConfig> = {
    baseTrend,
    baseRegion,
    baseHorizontal,
    basePie,
    baseMap,
};

export const WIDGET_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
} as const;

export const GRANULARITY = {
    ACCUMULATED: 'ACCUMULATED',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
} as const;

export const GROUP_BY = {
    PROJECT_GROUP: 'project_group_id',
    PROJECT: 'project_id',
    PROVIDER: 'provider',
    SERVICE_ACCOUNT: 'service_account_id',
    CATEGORY: 'category',
    RESOURCE_GROUP: 'resource_group',
    PRODUCT: 'product',
    REGION: 'region_code',
    TYPE: 'usage_type',
    ACCOUNT: 'account',
} as const;
