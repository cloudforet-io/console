<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';
import { isEmpty, sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDivider, PFieldTitle, PLink, PSpinner, PStatus, screens,
} from '@cloudforet/mirinae';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';
import type { CostReportDataAnalyzeParameters } from '@/schema/cost-analysis/cost-report-data/api-verbs/analyze';
import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';
import type { RoleInfo } from '@/store/modules/user/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';
import type { CostReportDataAnalyzeResult } from '@/services/cost-explorer/types/cost-report-data-type';
import CostSummaryChart from '@/services/workspace-home/components/CostSummaryChart.vue';
import EmptySummaryData from '@/services/workspace-home/components/EmptySummaryData.vue';
import { costStateSummaryFormatter } from '@/services/workspace-home/composables/use-workspace-home';
import { COST_SUMMARY_STATE_TYPE, SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { EmptyData } from '@/services/workspace-home/types/workspace-home-type';

const { getProperRouteLocation } = useProperRouteLocation();
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const { width } = useWindowSize();

const storeState = reactive({
    costReportConfig: computed<CostReportConfigModel|null|undefined>(() => workspaceHomePageState.costReportConfig),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
    dataSource: computed<CostDataSourceModel[]>(() => workspaceHomePageState.dataSource),
    getCurrentRoleInfo: computed<RoleInfo>(() => store.getters['user/getCurrentRoleInfo']),
    projects: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
});
const state = reactive({
    loading: true,
    isDesktopSize: computed(() => width.value > screens.laptop.max),
    currency: computed<Currency|undefined>(() => storeState.costReportConfig?.currency || CURRENCY.USD),
    isWorkspaceMember: computed(() => storeState.getCurrentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    chartData: undefined as XYChartData[]|undefined,
    emptyData: computed<EmptyData>(() => {
        let result = {} as EmptyData;
        if (storeState.dataSource.length === 0) {
            result = {
                to: { name: COST_EXPLORER_ROUTE.LANDING._NAME },
                title: i18n.t('HOME.ACTIVATION_REQUIRED'),
                desc: i18n.t('HOME.ACTIVATION_REQUIRED_DESC'),
                buttonText: i18n.t('HOME.LEARN_MORE'),
            };
        } else if (state.isWorkspaceMember && isEmpty(storeState.projects)) {
            result = {
                title: i18n.t('HOME.PROJECT_REQUIRED'),
                desc: i18n.t('HOME.PROJECT_REQUIRED_DESC'),
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
    selectedProjects: [] as Array<string>,

    period: computed(() => {
        const reportMonth = dayjs().utc();
        const reportMonthPeriod = state.isDesktopSize ? 12 : 6;
        const start = dayjs(reportMonth).utc().subtract(reportMonthPeriod, 'month').format('YYYY-MM');
        const end = reportMonth.format('YYYY-MM');
        return { start, end };
    }),
    recentMonthValue: computed<XYChartData|undefined>(() => state.chartData[state.chartData.length - 2]),
    currentMonthValue: computed<XYChartData|undefined>(() => state.chartData[state.chartData.length - 1]),
    recentDateRangeText: computed<string>(() => {
        const lastMonth = dayjs().utc().subtract(1, 'month');
        return `${lastMonth.startOf('month').format('YYYY-MM-DD')} ~ ${lastMonth.endOf('month').format('YYYY-MM-DD')}`;
    }),
    currentDateRangeText: computed<string>(() => {
        const currentMonth = dayjs().utc();
        return `${currentMonth.startOf('month').format('YYYY-MM-DD')} ~ ${currentMonth.format('YYYY-MM-DD')}`;
    }),
});

const handleSelectedProject = async (selectedProject: string[]) => {
    state.selectedProjects = selectedProject;
    await analyzeCostReportData();
};

const analyzeCostReportData = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeResponse<CostReportDataAnalyzeResult>>({
            cost_report_config_id: storeState.costReportConfig?.cost_report_config_id,
            query: {
                start: state.period.start,
                end: state.period.end,
                group_by: state.isWorkspaceMember ? ['project_id', 'is_confirmed'] : ['is_confirmed'],
                fields: {
                    value_sum: {
                        key: `cost.${state.currency}`,
                        operator: 'sum',
                    },
                },
                granularity: GRANULARITY.MONTHLY,
                field_group: ['date'],
                filter: state.isWorkspaceMember ? [
                    { k: 'project_id', v: state.selectedProjects[0], o: 'eq' },
                ] : undefined,
            },
        });
        const _chartData = (results || []).flatMap((item) => item?.value_sum?.map((valueSum) => ({
            ...valueSum,
            is_confirmed: item.is_confirmed,
        })));
        state.chartData = sortBy(_chartData, 'date');
    } catch (e) {
        state.chartData = undefined;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

watch(() => state.isDesktopSize, async () => {
    await analyzeCostReportData();
});
watch(() => storeState.projects, async (projects) => {
    if (!state.isWorkspaceMember) return;
    const project = Object.keys(projects)[0];
    state.selectedProjects = [project];
    await analyzeCostReportData();
}, { immediate: true });
watch(() => storeState.costReportConfig, async (costReportConfig) => {
    if (!costReportConfig) return;
    await analyzeCostReportData();
}, { immediate: true });
</script>

<template>
    <div class="cost-summary">
        <div class="heading-wrapper">
            <p-field-title :label="$t('HOME.COST_SUMMARY_TITLE')"
                           size="lg"
                           class="main-title"
            />
            <project-select-dropdown
                v-if="state.isWorkspaceMember && !isEmpty(storeState.projects)"
                class="project-select-dropdown"
                :selected-project-ids="state.selectedProjects"
                :use-fixed-menu-style="false"
                project-selectable
                position="right"
                hide-create-button
                :selection-label="$t('HOME.COST_SUMMARY_BY_PROJECT')"
                :project-group-selectable="false"
                @update:selected-project-ids="handleSelectedProject"
            />
        </div>
        <div v-if="state.loading"
             class="loading"
        >
            <p-spinner size="lg" />
        </div>
        <div v-else>
            <div v-if="state.chartData?.length > 0">
                <div class="content-wrapper">
                    <div class="price-wrapper">
                        <div class="price-view">
                            <p>{{ $t('HOME.COST_SUMMARY_LAST_MONT_TOTAL_COST') }}</p>
                            <p class="price">
                                <span class="unit">{{ CURRENCY_SYMBOL?.[state.currency] }}</span>
                                <span>{{ currencyMoneyFormatter(state.recentMonthValue?.value, { currency: state.currency, style: 'decimal' }) }}</span>
                                <p-status v-bind="costStateSummaryFormatter(state.recentMonthValue?.is_confirmed ? COST_SUMMARY_STATE_TYPE.CONFIRM : COST_SUMMARY_STATE_TYPE.ESTIMATED)"
                                          class="capitalize state"
                                />
                            </p>
                            <p class="date">
                                {{ state.recentDateRangeText }}
                            </p>
                        </div>
                        <p-divider class="divider"
                                   vertical
                        />
                        <div class="price-view">
                            <p>{{ $t('HOME.COST_SUMMARY_CURRENT_TOTAL_COST') }}</p>
                            <p class="price">
                                <span class="unit">{{ CURRENCY_SYMBOL?.[state.currency] }}</span>
                                <span>{{ currencyMoneyFormatter(state.currentMonthValue?.value, { currency: state.currency, style: 'decimal' }) }}</span>
                                <p-status v-bind="costStateSummaryFormatter(COST_SUMMARY_STATE_TYPE.AGGREGATING)"
                                          class="capitalize state"
                                />
                            </p>
                            <p class="date">
                                {{ state.currentDateRangeText }}
                            </p>
                        </div>
                    </div>
                    <span class="chart-description">{{ $t('HOME.COST_SUMMARY_DESC') }}</span>
                    <cost-summary-chart :period="state.period"
                                        :currency="state.currency"
                                        :data="state.chartData"
                    />
                </div>
                <div v-if="!state.isWorkspaceMember">
                    <p-divider class="divider" />
                    <p-link highlight
                            :to="getProperRouteLocation({ name: COST_EXPLORER_ROUTE.COST_REPORT._NAME })"
                            action-icon="internal-link"
                            class="link"
                    >
                        {{ $t('HOME.COST_SUMMARY_GO_TO_REPORT') }}
                    </p-link>
                </div>
            </div>
            <empty-summary-data v-else
                                :image-url="require('/images/home/img_workspace-home_cost-summary_empty-state-background-min.png')"
                                :empty-data="state.emptyData"
                                :type="SUMMARY_DATA_TYPE.COST"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.cost-summary {
    min-height: 30.5rem;
    .heading-wrapper {
        @apply flex;
        .project-select-dropdown {
            margin-right: 1rem;
            margin-left: auto;
        }
    }
    .loading {
        @apply flex items-center justify-center;
        min-height: 27.5rem;
    }
    .main-title {
        padding-left: 1rem;
    }
    .content-wrapper {
        @apply flex flex-col;
        padding: 1.375rem 1.5rem 2rem;
        .price-wrapper {
            @apply flex text-label-md border border-gray-200;
            padding-top: 1rem;
            padding-bottom: 1rem;
            border-radius: 0.375rem;
            .price-view {
                @apply flex flex-col;
                flex: 1;
                padding-right: 1rem;
                padding-left: 1rem;
                .price {
                    @apply flex items-center text-display-md;
                    margin-top: 0.25rem;
                    .unit {
                        @apply text-display-sm text-gray-600;
                    }
                    .state {
                        @apply text-label-sm;
                        margin-left: 0.5rem;
                    }
                }
                .date {
                    @apply text-label-sm text-gray-500;
                    margin-top: 0.5rem;
                }
            }
        }
        .chart-description {
            @apply text-paragraph-sm text-gray-700;
            margin-top: 0.5rem;
            margin-bottom: 1rem;
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
}
</style>
