/* eslint-disable import/order */
// base widgets
import baseCountOfFindings from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_base-widgets/base-count-of-findings/widget-config';
import basePie from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_base-widgets/base-pie/widget-config';
import baseTrend from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_base-widgets/base-trend/widget-config';

// console widgets
import complianceStatus from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/compliance-status/widget-config';
import countOfFailFindings from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/count-of-fail-findings/widget-config';
import countOfPassAndFailFindings from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/count-of-pass-and-fail-findings/widget-config';
import severityStatusByService from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/severity-status-by-service/widget-config';
import totalFailFindingsHistory from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/total-fail-findings-history/widget-config';
import totalFailFindingsStatus from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/total-fail-findings-status/widget-config';
import trendOfPassAndFailFindings from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/asset-widgets/trend-of-pass-and-fail-findings/widget-config';
import budgetStatus from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/budget-status/widget-config';
import budgetUsageByTarget from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/budget-usage-by-target/widget-config';
import budgetUsageSummary from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/budget-usage-summary/widget-config';
import costByRegionMultiFields from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-by-region-multi-fields/widget-config';
import costByRegion from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-by-region/widget-config';
import costDonut from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-donut/widget-config';
import costMap from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-map/widget-config';
import costPie from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-pie/widget-config';
import costSummaryMultiFields from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-summary-multi-fields/widget-config';
import costTrendStacked from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-trend-stacked/widget-config';
import costTrend from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/cost-trend/widget-config';
import monthlyCost from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/cost-widgets/monthly-cost/widget-config';

import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';
import type { BaseWidgetConfigKey, WidgetConfigKey } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-list-type';

export const BASE_WIDGET_CONFIG_KEYS = [
    'baseTrend',
    'basePie',
    'baseCountOfFindings',
] as const;
export const CONSOLE_WIDGET_CONFIG_KEYS = [
    'monthlyCost',
    'budgetUsageSummary',
    'costMap',
    'costTrend',
    'costTrendStacked',
    'costSummaryMultiFields',
    'costPie',
    'costDonut',
    'costByRegion',
    'costByRegionMultiFields',
    'budgetStatus',
    'budgetUsageByTarget',
    'severityStatusByService',
    'countOfFailFindings',
    'countOfPassAndFailFindings',
    'trendOfPassAndFailFindings',
    'totalFailFindingsStatus',
    'totalFailFindingsHistory',
    'complianceStatus',
] as const;


export const CONSOLE_WIDGET_CONFIGS: Record<WidgetConfigKey, Partial<WidgetConfig>> = {
    // Cost Widgets
    monthlyCost,
    budgetUsageSummary,
    costMap,
    costTrend,
    costTrendStacked,
    costSummaryMultiFields,
    costPie,
    costDonut,
    costByRegion,
    costByRegionMultiFields,
    budgetStatus,
    budgetUsageByTarget,
    // Asset Widgets
    severityStatusByService,
    countOfFailFindings,
    countOfPassAndFailFindings,
    trendOfPassAndFailFindings,
    totalFailFindingsStatus,
    totalFailFindingsHistory,
    complianceStatus,
};

export const BASE_WIDGET_CONFIGS: Record<BaseWidgetConfigKey, Partial<WidgetConfig>> = {
    baseTrend,
    basePie,
    baseCountOfFindings,
};
