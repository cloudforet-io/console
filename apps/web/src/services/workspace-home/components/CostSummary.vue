<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PDivider, PFieldTitle, PLink } from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { sum } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';
import type { CostReportDataAnalyzeParameters } from '@/schema/cost-analysis/cost-report-data/api-verbs/analyze';
import type { CostReportListParameters } from '@/schema/cost-analysis/cost-report/api-verbs/list';
import type { CostReportModel } from '@/schema/cost-analysis/cost-report/model';
import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';
import type { RoleInfo } from '@/store/modules/user/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { CostReportDataAnalyzeResult } from '@/services/cost-explorer/types/cost-report-data-type';
import CostSummaryChart from '@/services/workspace-home/components/CostSummaryChart.vue';
import EmptySummaryData from '@/services/workspace-home/components/EmptySummaryData.vue';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { EmptyData } from '@/services/workspace-home/types/workspace-home-type';

const { getProperRouteLocation } = useProperRouteLocation();
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;

const storeState = reactive({
    costReportConfig: computed<CostReportConfigModel|null|undefined>(() => workspaceHomePageState.costReportConfig),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
    dataSource: computed<CostDataSourceModel[]>(() => workspaceHomePageState.dataSource),
    getCurrentRoleInfo: computed<RoleInfo>(() => store.getters['user/getCurrentRoleInfo']),
});
const state = reactive({
    loading: false,
    currentDate: undefined as Dayjs | undefined,
    currency: computed<Currency|undefined>(() => storeState.costReportConfig?.currency),
    isWorkspaceMember: computed(() => storeState.getCurrentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    recentReportMonth: undefined as string|undefined,
    data: undefined as AnalyzeResponse<CostReportDataAnalyzeResult>|undefined,
    chartData: undefined as AnalyzeResponse<CostReportDataAnalyzeResult>|undefined,
    totalAmount: computed(() => sum(state.data?.results.map((d) => d.value_sum))),
    period: computed(() => {
        const start = dayjs.utc(state.recentReportMonth).subtract(5, 'month').format('YYYY-MM');
        const end = state.recentReportMonth;
        return { start, end };
    }),
    emptyData: computed<EmptyData>(() => {
        let result = {} as EmptyData;
        if (storeState.dataSource.length === 0) {
            result = {
                to: { name: COST_EXPLORER_ROUTE.LANDING._NAME },
                title: i18n.t('HOME.ACTIVATION_REQUIRED'),
                desc: i18n.t('HOME.ACTIVATION_REQUIRED_DESC'),
                buttonText: i18n.t('HOME.LEARN_MORE'),
            };
        } else {
            result = {
                to: { name: COST_EXPLORER_ROUTE.COST_REPORT._NAME },
                title: i18n.t('HOME.NO_COST_DATA'),
                desc: i18n.t('HOME.NO_COST_DATA_DESC'),
                buttonText: i18n.t('HOME.COST_SUMMARY_GO_TO_REPORT'),
            };
        }
        return result;
    }),
});

const analyzeCostReportData = async (isChart?: boolean) => {
    state.loading = true;
    try {
        const _period = {
            start: isChart ? state.period.start : state.currentDate?.format('YYYY-MM'),
            end: isChart ? state.period.end : state.currentDate?.format('YYYY-MM'),
        };
        const defaultQuery = {
            start: _period.start,
            end: _period.end,
            fields: {
                value_sum: {
                    key: `cost.${state.currency}`,
                    operator: 'sum',
                },
            },
        };
        const reportQuery = {
            group_by: [GROUP_BY.PROVIDER],
            sort: [{
                key: 'value_sum',
                desc: true,
            }],
        };
        const chartQuery = {
            granularity: GRANULARITY.MONTHLY,
            field_group: ['date'],
            sort: [{
                key: '_total_value_sum',
                desc: true,
            }],
        };
        const res = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters>({
            cost_report_config_id: storeState.costReportConfig?.cost_report_config_id,
            is_confirmed: true,
            query: isChart ? { ...defaultQuery, ...chartQuery } : { ...defaultQuery, ...reportQuery },
        });
        if (!isChart) {
            state.data = res;
        } else {
            state.chartData = res;
        }
    } catch (e) {
        if (!isChart) {
            state.data = {};
        } else {
            state.chartData = {};
        }
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const fetchRecentReportData = async (costReportConfigId?: string) => {
    if (!costReportConfigId) return;
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>({
            status: 'SUCCESS',
            query: {
                only: ['report_month', 'issue_date'],
                filter: [
                    { k: 'cost_report_config_id', v: costReportConfigId, o: 'eq' },
                ],
            },
        });
        const reportMonthList: string[] = results?.map((report) => report.report_month) ?? [];
        state.recentReportMonth = reportMonthList.sort((a, b) => (dayjs.utc(b).isSameOrAfter(dayjs.utc(a)) ? 1 : -1))[0];
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => storeState.costReportConfig, async () => {
    if (state.isWorkspaceMember) return;
    await fetchRecentReportData(storeState.costReportConfig?.cost_report_config_id);
    await analyzeCostReportData();
    await analyzeCostReportData(true);
}, { immediate: true });
watch(() => state.recentReportMonth, async (after) => {
    if (!after) return;
    state.currentDate = dayjs.utc(after);
}, { immediate: true });
</script>

<template>
    <div class="cost-summary">
        <p-field-title :label="$t('HOME.COST_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
        <div v-if="state.data?.results.length > 0">
            <div class="content-wrapper">
                <div class="price-wrapper">
                    <div>
                        <p>{{ $t('HOME.COST_SUMMARY_RECENT', { date: state.recentReportMonth }) }}</p>
                        <p class="price">
                            <span class="unit">{{ CURRENCY_SYMBOL?.[state.currency] }}</span>
                            <span>{{ currencyMoneyFormatter(state.totalAmount, { currency: state.currency, style: 'decimal' }) }}</span>
                        </p>
                    </div>
                </div>
                <cost-summary-chart :period="state.period"
                                    :loading="state.loading"
                                    :currency="state.currency"
                                    :data="state.chartData"
                />
            </div>
            <p-divider class="divider" />
            <p-link highlight
                    :to="getProperRouteLocation({ name: COST_EXPLORER_ROUTE.COST_REPORT._NAME })"
                    action-icon="internal-link"
                    class="link"
            >
                {{ $t('HOME.COST_SUMMARY_GO_TO_REPORT') }}
            </p-link>
        </div>
        <empty-summary-data v-else
                            :image-url="require('/images/home/img_workspace-home_cost-summary_empty-state-background-min.png')"
                            :empty-data="state.emptyData"
                            :type="SUMMARY_DATA_TYPE.COST"
        />
    </div>
</template>

<style scoped lang="postcss">
.cost-summary {
    .main-title {
        padding-left: 1rem;
    }
    .content-wrapper {
        @apply flex flex-col;
        padding: 1.375rem 1.5rem 2rem;
        gap: 2rem;
        .price-wrapper {
            @apply flex flex-col text-label-md;
            gap: 1rem;
            .price {
                @apply text-display-md;
                margin-top: 0.25rem;
                .unit {
                    @apply text-display-sm text-gray-600;
                }
            }
        }
    }
    .divider {
        @apply bg-gray-150;
    }
    .link {
        @apply flex items-center justify-center text-label-md;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
    .no-recent {
        @apply flex flex-col justify-center items-center;
        height: calc(100% - 1.375rem);
        background-repeat: no-repeat;
        background-position: left;
        gap: 0.75rem;
        .icon-wrapper {
            @apply flex justify-center items-center bg-peacock-100 rounded-full;
            width: 2.75rem;
            height: 2.75rem;
        }
        .title {
            @apply text-label-xl text-peacock-800 font-medium;
        }
        .desc {
            @apply text-gray-700;
        }
    }
}
</style>
