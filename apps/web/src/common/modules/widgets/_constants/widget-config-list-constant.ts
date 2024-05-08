/* eslint-disable import/order */
// base widgets
import baseCountOfFindings from '@/common/modules/widgets/_base-widgets/base-count-of-findings/widget-config';
import basePie from '@/common/modules/widgets/_base-widgets/base-pie/widget-config';
import baseTrend from '@/common/modules/widgets/_base-widgets/base-trend/widget-config';

// console widgets
import complianceStatus from '@/common/modules/widgets/asset-widgets/compliance-status/widget-config';
import countOfFailFindings from '@/common/modules/widgets/asset-widgets/count-of-fail-findings/widget-config';
import countOfPassAndFailFindings from '@/common/modules/widgets/asset-widgets/count-of-pass-and-fail-findings/widget-config';
import severityStatusByService from '@/common/modules/widgets/asset-widgets/severity-status-by-service/widget-config';
import totalFailFindingsHistory from '@/common/modules/widgets/asset-widgets/total-fail-findings-history/widget-config';
import totalFailFindingsStatus from '@/common/modules/widgets/asset-widgets/total-fail-findings-status/widget-config';
import trendOfPassAndFailFindings from '@/common/modules/widgets/asset-widgets/trend-of-pass-and-fail-findings/widget-config';
import budgetStatus from '@/common/modules/widgets/cost-widgets/budget-status/widget-config';
import budgetUsageByTarget from '@/common/modules/widgets/cost-widgets/budget-usage-by-target/widget-config';
import budgetUsageSummary from '@/common/modules/widgets/cost-widgets/budget-usage-summary/widget-config';
import costByRegionMultiFields from '@/common/modules/widgets/cost-widgets/cost-by-region-multi-fields/widget-config';
import costByRegion from '@/common/modules/widgets/cost-widgets/cost-by-region/widget-config';
import costDonut from '@/common/modules/widgets/cost-widgets/cost-donut/widget-config';
import costMap from '@/common/modules/widgets/cost-widgets/cost-map/widget-config';
import costPie from '@/common/modules/widgets/cost-widgets/cost-pie/widget-config';
import costSummaryMultiFields from '@/common/modules/widgets/cost-widgets/cost-summary-multi-fields/widget-config';
import costTrendStacked from '@/common/modules/widgets/cost-widgets/cost-trend-stacked/widget-config';
import costTrend from '@/common/modules/widgets/cost-widgets/cost-trend/widget-config';
import monthlyCost from '@/common/modules/widgets/cost-widgets/monthly-cost/widget-config';

import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';
import type { BaseWidgetConfigKey, WidgetConfigKey } from '@/common/modules/widgets/_types/widget-list-type';

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
