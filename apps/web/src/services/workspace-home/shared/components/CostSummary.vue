<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';
import { isEmpty, sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDivider, PFieldTitle, PLink, PSpinner, PStatus, screens,
} from '@cloudforet/mirinae';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { UnifiedCostAnalyzeParameters } from '@/api-clients/cost-analysis/unified-cost/schema/api-verbs/analyze';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { RoleInfo } from '@/store/user/type';
import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { MENU_ID } from '@/lib/menu/config';

import ErrorHandler from '@/common/composables/error/errorHandler';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { CostXYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';
import type { UnifiedCostAnalyzeResult } from '@/services/cost-explorer/types/unified-cost-type';
import { costStateSummaryFormatter } from '@/services/workspace-home/composables/use-workspace-home';
import CostSummaryChart from '@/services/workspace-home/shared/components/CostSummaryChart.vue';
import EmptySummaryData from '@/services/workspace-home/shared/components/EmptySummaryData.vue';
import { useCostDataSourceQuery } from '@/services/workspace-home/shared/composables/use-cost-data-source-query';
import { useCostReportConfigQuery } from '@/services/workspace-home/shared/composables/use-cost-report-config-query';
import { COST_SUMMARY_STATE_TYPE } from '@/services/workspace-home/shared/constants/cost-summary-constant';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/shared/constants/summary-type-constant';
import type { EmptyData } from '@/services/workspace-home/shared/types/empty-data-type';
import type { WidgetStyleType } from '@/services/workspace-home/shared/types/widget-style-type';

const props = withDefaults(defineProps<{
    projectIds?: string[];
    styleType?: WidgetStyleType;
}>(), {
    projectIds: undefined,
    styleType: 'default',
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userStore = useUserStore();

const { width } = useWindowSize();



const { dataSource } = useCostDataSourceQuery();
const storeState = reactive({
    getCurrentRoleInfo: computed<RoleInfo|undefined>(() => userStore.state.currentRoleInfo),
    projects: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
    pageAccessPermissionMap: computed<PageAccessMap>(() => userStore.getters.pageAccessPermissionMap),
});

const isWorkspaceMember = computed(() => storeState.getCurrentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER);
const { costReportConfig } = useCostReportConfigQuery({
    enabled: computed(() => !isWorkspaceMember.value),
});
const state = reactive({
    loading: true,
    accessLink: computed<boolean>(() => !isEmpty(storeState.pageAccessPermissionMap[MENU_ID.COST_REPORT])),
    isDesktopSize: computed(() => width.value > screens.laptop.max),
    currency: computed<Currency|undefined>(() => costReportConfig.value?.currency || CURRENCY.USD),
    chartData: undefined as CostXYChartData[]|undefined,
    emptyData: computed<EmptyData>(() => {
        let result = {} as EmptyData;
        if (dataSource.value?.length === 0) {
            result = {
                to: { name: COST_EXPLORER_ROUTE.LANDING._NAME },
                title: i18n.t('HOME.ACTIVATION_REQUIRED'),
                desc: i18n.t('HOME.ACTIVATION_REQUIRED_DESC'),
                buttonText: i18n.t('HOME.LEARN_MORE'),
            };
        } else if (isWorkspaceMember.value && isEmpty(storeState.projects)) {
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
    recentMonthValue: computed<CostXYChartData|undefined>(() => state.chartData[state.chartData.length - 2]),
    currentMonthValue: computed<CostXYChartData|undefined>(() => state.chartData[state.chartData.length - 1]),
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
const fillMissingMonths = (dataList: CostXYChartData[]): CostXYChartData[] => {
    const result: CostXYChartData[] = [];
    const today = dayjs().utc();
    if (dataList.length === 0) return result;

    dataList.sort((a, b) => dayjs(a.date).utc().diff(dayjs(b.date).utc()));

    const startDate = dayjs(dataList[0]?.date).utc();
    let currentDate = startDate;

    while (currentDate.isBefore(today, 'month')) {
        const dateToCheck = currentDate.clone();
        const data = dataList.find((item) => dayjs(item.date).utc().isSame(dateToCheck, 'month'));
        result.push(
            data || { date: dateToCheck.add(1, 'month').format('YYYY-MM'), value: 0, is_confirmed: true },
        );
        currentDate = currentDate.add(1, 'month');
    }
    return result;
};


const analyzeCostReportData = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.unifiedCost.analyze<UnifiedCostAnalyzeParameters, AnalyzeResponse<UnifiedCostAnalyzeResult>>({
            query: {
                start: state.period.start,
                end: state.period.end,
                group_by: isWorkspaceMember.value ? ['project_id', 'is_confirmed'] : ['is_confirmed'],
                fields: {
                    value_sum: {
                        key: `cost.${state.currency}`,
                        operator: 'sum',
                    },
                },
                granularity: GRANULARITY.MONTHLY,
                field_group: ['date'],
                filter: isWorkspaceMember.value ? [
                    { k: 'project_id', v: state.selectedProjects[0], o: 'eq' },
                ] : undefined,
            },
        });
        if (!results) return;
        const _chartData = (results || []).flatMap((item) => ((item.value_sum ?? [])).map((valueSum) => ({
            ...valueSum,
            is_confirmed: item.is_confirmed,
        })));
        state.chartData = sortBy(fillMissingMonths(_chartData), 'date');
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
    if (!isWorkspaceMember.value) return;
    const project = Object.keys(projects)[0];
    state.selectedProjects = [project];
    await analyzeCostReportData();
}, { immediate: true });
watch(costReportConfig, async (data) => {
    if (!data) return;
    await analyzeCostReportData();
}, { immediate: true });
</script>

<template>
    <div class="cost-summary">
        <div class="heading-wrapper">
            <p-field-title :label="$t('HOME.COST_SUMMARY_TITLE')"
                           size="lg"
                           :font-weight="props.styleType === 'compact' ? 'regular' : 'bold'"
                           class="main-title"
            />
            <project-select-dropdown
                v-if="isWorkspaceMember && !isEmpty(storeState.projects)"
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
                                          :text="state.recentMonthValue?.is_confirmed ? $t('HOME.CONFIRM') : $t('HOME.ESTIMATED')"
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
                                          :text="$t('HOME.AGGREGATING')"
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
                <div v-if="!isWorkspaceMember && state.accessLink">
                    <p-divider class="divider" />
                    <div class="link-footer">
                        <p-link highlight
                                :to="{ name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME }"
                                action-icon="internal-link"
                                class="link"
                        >
                            {{ $t('HOME.COST_SUMMARY_GO_TO_COST_ANALYSIS') }}
                        </p-link>
                        <div class="vertical-divider">
                            <p-divider style="height: 14px;"
                                       vertical
                            />
                        </div>
                        <p-link highlight
                                :to="{ name: COST_EXPLORER_ROUTE.COST_REPORT._NAME }"
                                action-icon="internal-link"
                                class="link"
                        >
                            {{ $t('HOME.COST_SUMMARY_GO_TO_REPORT') }}
                        </p-link>
                    </div>
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
    .link-footer {
        @apply flex justify-center items-center gap-4;

        .vertical-divider {
            @apply flex items-center h-full;
        }
        .link {
            @apply inline-flex items-center justify-center text-label-md;
            padding-top: 0.625rem;
            padding-bottom: 0.75rem;
        }
    }
}
</style>
