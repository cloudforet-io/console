<template>
    <cost-dashboard-card-widget-layout title="Project-wise Budget Usage Summary"
                                       class="project-wise-budget-usage-summary"
                                       :widget-link="widgetLink"
                                       :no-data="!items.length"
                                       :data-range="20"
    >
        <p-data-table :items="items"
                      :loading="loading"
                      :fields="fields"
                      table-style-type="simple"
        >
            <template #col-project-format="{ value }">
                <div class="col-project">
                    <p-i :name="value.projectId ? 'ic_project' : 'ic_tree_project-group'" width="1rem" height="1rem"
                         class="project-icon"
                    />
                    <p-anchor :href="getProjectLink(value.projectId || value.projectGroupId, !!value.projectId)">
                        {{ value.projectId ? projectNameFormatter(value.projectId) : projectGroupNameFormatter(value.projectGroupId) }}
                    </p-anchor>
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
                    <p-progress-bar :percentage="value" :color="getColor(value)" />
                    <span class="usage-text" :style="{ color: getColor(value) }">{{ value.toFixed(1) }}%</span>
                </div>
            </template>
        </p-data-table>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PDataTable, PI, PProgressBar, PAnchor,
} from '@spaceone/design-system';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { getConvertedBudgetFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { SpaceRouter } from '@/router';
import { CURRENCY } from '@/store/modules/display/config';
import { store } from '@/store';
import { yellow, red, gray } from '@/styles/colors';
import { BILLING_ROUTE } from '@/services/billing/routes';

interface BudgetItem {
    project: {projectId: string; projectGroupId: string};
    amountSpent: number;
    totalBudget: number;
    usage: number;
    shortageForecast?: string;
}

export default {
    name: 'ProjectWiseBudgetUsageSummary',
    components: {
        CostDashboardCardWidgetLayout,
        PDataTable,
        PI,
        PProgressBar,
        PAnchor,
    },
    props: {
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: WidgetProps) {
        const budgetQueryHelper = new QueryHelper();

        const state = reactive({
            loading: false,
            fields: computed<DataTableField[]>(() => ([
                { name: 'project', label: 'Target' },
                { name: 'amountSpent', label: 'Amount Spent', textAlign: 'right' },
                { name: 'totalBudget', label: 'Total Budget', textAlign: 'right' },
                { name: 'usage', label: ' ', textAlign: 'right' },
                { name: 'shortageForecast', label: 'Shortage Forecast', textAlign: 'center' },
            ])),
            items: [] as BudgetItem[],
            projectGroups: computed(() => store.state.resource.projectGroup.items),
            projects: computed(() => store.state.resource.project.items),
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                params: {},
                query: {
                    filters: budgetQueryHelper.setFilters(getConvertedBudgetFilter(props.filters)).rawQueryStrings,
                },
            })),
        });

        /* util */
        const getProjectLink = (value: string, isProject: boolean) => {
            if (isProject) {
                const link = SpaceRouter.router.resolve(referenceRouter(
                    value, {
                        resource_type: 'identity.Project',
                    },
                ));
                return link.href;
            }
            const link = SpaceRouter.router.resolve(referenceRouter(
                value, {
                    resource_type: 'identity.ProjectGroup',
                },
            ));
            return link.href;
        };
        const getColor = (value) => {
            if (value >= 100) return red[400];
            if (value > 90) return yellow[500];
            return gray[400];
        };
        const projectNameFormatter = projectId => state.projects[projectId]?.label || projectId;
        const projectGroupNameFormatter = projectGroupId => state.projectGroups[projectGroupId]?.label || projectGroupId;

        /* api */
        const getBudgetUsageData = async (period, filters) => {
            budgetQueryHelper.setFilters(getConvertedBudgetFilter(filters));
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze({
                    include_budget_count: false,
                    include_project_info: true,
                    group_by: ['budget_id'],
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
                state.items = results.map(d => ({
                    project: { projectId: d.project_id, projectGroupId: d.project_group_id },
                    amountSpent: d.usd_cost,
                    totalBudget: d.limit,
                    progress: d.usage,
                    usage: d.usage,
                    // shortageForecast: d.
                }));
            } catch (e) {
                state.items = [];
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        watch([() => props.period, () => props.filters], ([period, filters]) => {
            getBudgetUsageData(period, filters);
        }, { immediate: true });

        return {
            ...toRefs(state),
            currencyMoneyFormatter,
            getProjectLink,
            getColor,
            projectNameFormatter,
            projectGroupNameFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-wise-budget-usage-summary {
    .p-data-table {
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
            gap: 1rem;
            .progress-bar {
                width: 7.5rem;
            }
            .usage-text {
                width: 3rem;
                text-align: right;
            }
        }
    }
}
</style>
