import type { AsyncComponent } from 'vue';

import type { BaseWidgetConfigKey, WidgetConfigKey } from '@/services/dashboards/widgets/_types/widget-list-type';

const BASE_WIDGET_COMPONENTS: Record<BaseWidgetConfigKey, AsyncComponent> = {
    baseTrend: () => ({
        component: import('@/services/dashboards/widgets/_base-widgets/base-trend/BaseTrendWidget.vue'),
    }),
    basePie: () => ({
        component: import('@/services/dashboards/widgets/_base-widgets/base-pie/BasePieWidget.vue'),
    }),
    baseCountOfFindings: () => ({
        component: import('@/services/dashboards/widgets/_base-widgets/base-count-of-findings/BaseCountOfFindingsWidget.vue'),
    }),
};

export const WIDGET_COMPONENTS: Record<WidgetConfigKey, AsyncComponent> = {
    monthlyCost: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/monthly-cost/MonthlyCostWidget.vue'),
    }),
    budgetUsageSummary: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/budget-usage-summary/BudgetUsageSummaryWidget.vue'),
    }),
    costMap: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/cost-map/CostMapWidget.vue'),
    }),
    costTrend: BASE_WIDGET_COMPONENTS.baseTrend,
    costTrendStacked: BASE_WIDGET_COMPONENTS.baseTrend,
    costSummaryMultiFields: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/cost-summary-multi-fields/CostSummaryMultiFieldsWidget.vue'),
    }),
    costPie: BASE_WIDGET_COMPONENTS.basePie,
    costDonut: BASE_WIDGET_COMPONENTS.basePie,
    costByRegion: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/cost-by-region/CostByRegionWidget.vue'),
    }),
    costByRegionMultiFields: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/cost-by-region-multi-fields/CostByRegionMultiFieldsWidget.vue'),
    }),
    budgetStatus: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/budget-status/BudgetStatusWidget.vue'),
    }),
    budgetUsageByTarget: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/budget-usage-by-target/BudgetUsageByTargetWidget.vue'),
    }),
    severityStatusByService: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/severity-status-by-service/SeverityStatusByServiceWidget.vue'),
    }),
    countOfFailFindings: BASE_WIDGET_COMPONENTS.baseCountOfFindings,
    countOfPassAndFailFindings: BASE_WIDGET_COMPONENTS.baseCountOfFindings,
    trendOfPassAndFailFindings: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/trend-of-pass-and-fail-findings/TrendOfPassAndFailFindingsWidget.vue'),
    }),
    totalFailFindingsStatus: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/total-fail-findings-status/TotalFailFindingsStatusWidget.vue'),
    }),
    totalFailFindingsHistory: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/total-fail-findings-history/TotalFailFindingsHistoryWidget.vue'),
    }),
    complianceStatus: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/compliance-status/ComplianceStatusWidget.vue'),
    }),
};
