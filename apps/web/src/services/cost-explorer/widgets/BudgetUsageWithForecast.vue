<script lang="ts" setup>

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PI, PProgressBar,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import {
    computed, nextTick, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { yellow, red, gray } from '@/styles/colors';

import { getConvertedBudgetFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

interface BudgetItem {
    project: {projectId: string; projectGroupId: string};
    amountSpent: number;
    totalBudget: number;
    usage: number;
    shortageForecast?: string;
}
type I18nDataTableField = DataTableField | {
    label: string;
};

const props = withDefaults(defineProps<WidgetProps>(), {
    options: () => ({}),
    period: () => ({}),
    filters: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const emit = defineEmits<{(e: 'rendered'): void}>();
const { t } = useI18n();
const store = useStore();

const budgetQueryHelper = new QueryHelper();

const state = reactive({
    loading: false,
    fields: computed<I18nDataTableField[]>(() => ([
        { name: 'project', label: t('BILLING.COST_MANAGEMENT.DASHBOARD.FIELD_LABEL.TARGET') },
        { name: 'amountSpent', label: t('BILLING.COST_MANAGEMENT.DASHBOARD.FIELD_LABEL.AMOUNT_SPENT'), textAlign: 'right' },
        { name: 'totalBudget', label: t('BILLING.COST_MANAGEMENT.DASHBOARD.FIELD_LABEL.TOTAL_BUDGET'), textAlign: 'right' },
        {
            name: 'usage', label: ' ', textAlign: 'right', width: '16rem',
        },
        {
            name: 'shortageForecast', label: t('BILLING.COST_MANAGEMENT.DASHBOARD.FIELD_LABEL.SHORTAGE_FORECAST'), textAlign: 'center', width: '9rem',
        },
    ])),
    items: [] as BudgetItem[],
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    widgetLink: computed(() => {
        if (props.printMode) return undefined;
        return {
            name: COST_EXPLORER_ROUTE.BUDGET._NAME,
            params: {},
            query: {
                filters: budgetQueryHelper.setFilters(getConvertedBudgetFilter(props.filters)).rawQueryStrings,
            },
        };
    }),
});

/* util */
const getColor = (value) => {
    if (value >= 100) return red[400];
    if (value > 90) return yellow[500];
    return gray[400];
};
const projectNameFormatter = (projectId: string, projects: ProjectReferenceMap) => projects[projectId]?.label || projectId;
const projectGroupNameFormatter = (projectGroupId) => state.projectGroups[projectGroupId]?.label || projectGroupId;

/* api */
const getBudgetUsageData = async (period, filters) => {
    budgetQueryHelper.setFilters(getConvertedBudgetFilter(filters));
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze({
            include_budget_count: false,
            include_budget_info: false,
            group_by: ['project_id', 'project_group_id'],
            start: dayjs.utc(period.start).format('YYYY-MM'),
            end: dayjs.utc(period.end).format('YYYY-MM'),
            sort: {
                key: 'usd_cost',
                desc: true,
            },
            page: {
                limit: 20,
            },
            ...budgetQueryHelper.apiQuery,
        });
        state.items = results.map((d) => ({
            project: { projectId: d.project_id, projectGroupId: d.project_group_id },
            amountSpent: d.usd_cost,
            totalBudget: d.limit,
            progress: d.usage ?? 0,
            usage: d.usage ?? 0,
            // shortageForecast: d.
        }));
    } catch (e) {
        state.items = [];
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

watch([() => props.period, () => props.filters], async ([period, filters]) => {
    await getBudgetUsageData(period, filters);
    await nextTick();
    emit('rendered');
}, { immediate: true });

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/projectGroup/load'),
        store.dispatch('reference/project/load'),
    ]);
})();

</script>

<template>
    <cost-dashboard-card-widget-layout :title="name ? name : t('BILLING.COST_MANAGEMENT.DASHBOARD.PROJECT_WISE_BUDGET_USAGE_SUMMARY')"
                                       class="project-wise-budget-usage-summary"
                                       :widget-link="state.widgetLink"
                                       :no-data="!state.loading && !state.items.length"
                                       :data-range="20"
                                       :print-mode="printMode"
    >
        <p-data-table v-if="state.items.length"
                      :items="state.items"
                      :loading="state.loading"
                      :fields="state.fields"
                      table-style-type="simple"
        >
            <template #col-project-format="{ value }">
                <div class="col-project">
                    <p-i :name="value.projectId ? 'ic_service_project' : 'ic_folder-filled'"
                         width="1rem"
                         height="1rem"
                         class="project-icon"
                    />
                    {{ value.projectId ? projectNameFormatter(value.projectId, state.projects) : projectGroupNameFormatter(value.projectGroupId) }}
                </div>
            </template>
            <template #col-amountSpent-format="{ value }">
                <b>{{ currencyMoneyFormatter(value, currency, currencyRates, false, 1000000000) }}</b>
            </template>
            <template #col-totalBudget-format="{ value }">
                <b>{{ currencyMoneyFormatter(value, currency, currencyRates, false, 1000000000) }}</b>
            </template>
            <template #col-usage-format="{ value }">
                <div class="col-usage">
                    <p-progress-bar :percentage="value"
                                    :disable-animation="printMode"
                                    :color="getColor(value)"
                    />
                    <span class="usage-text"
                          :style="{ color: getColor(value) }"
                    >{{ value.toFixed(1) }}%</span>
                </div>
            </template>
        </p-data-table>
    </cost-dashboard-card-widget-layout>
</template>

<style lang="postcss" scoped>
.project-wise-budget-usage-summary {
    /* custom cost-dashboard-card-widget-layout */

    /* custom design-system component - p-card */
    &.p-card:deep(.body, .no-data) {
        min-height: 10rem;
    }

    .col-project {
        display: flex;
        align-items: center;
        .project-icon {
            margin-right: 0.25rem;
        }
    }
    .col-usage {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 14rem;
        .progress-bar {
            width: 7.5rem;
        }
        .usage-text {
            flex-shrink: 0;
            min-width: 3.375rem;
            margin-left: 1rem;
            text-align: right;
        }
    }
}
</style>
