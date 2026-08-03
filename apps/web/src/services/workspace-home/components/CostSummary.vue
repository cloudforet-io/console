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

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import type { Currency } from '@/store/modules/display/type';
import type { RoleInfo } from '@/store/modules/user/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { MENU_ID } from '@/lib/menu/config';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getCurrentMonth, getLatestMonth } from '@/services/cost-explorer/helpers/cost-report-month-helper';
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
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
});
const state = reactive({
    loading: true,
    accessLink: computed<boolean>(() => !isEmpty(storeState.pageAccessPermissionMap[MENU_ID.COST_REPORT])),
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

    latestMonth: computed<string>(() => getLatestMonth()),
    currentMonth: computed<string>(() => getCurrentMonth()),
    // 차트는 '최신 월'(저번 달)에서 끝낸다. 진행 중인 달은 부분 집계라 추이선에 섞으면 급감한 것처럼 읽힌다.
    chartPeriod: computed(() => {
        const monthCount = state.isDesktopSize ? 12 : 6;
        return {
            start: dayjs.utc(state.latestMonth).subtract(monthCount - 1, 'month').format('YYYY-MM'),
            end: state.latestMonth,
        };
    }),
    // 조회 범위는 차트보다 한 달 넓다. 진행 중인 달은 is_confirmed: false 로 존재하므로 같은 호출로 받아온다.
    period: computed(() => ({ start: state.chartPeriod.start, end: state.currentMonth })),
    // 값과 날짜 라벨이 어긋나지 않도록, 배열 위치가 아니라 월(날짜 키)로 조회한다.
    recentMonthValue: computed<XYChartData|undefined>(() => state.chartData?.find((d) => d.date === state.latestMonth)),
    currentMonthValue: computed<XYChartData|undefined>(() => state.chartData?.find((d) => d.date === state.currentMonth)),
    recentDateRangeText: computed<string>(() => {
        const latestMonth = dayjs.utc(state.latestMonth);
        return `${latestMonth.startOf('month').format('YYYY-MM-DD')} ~ ${latestMonth.endOf('month').format('YYYY-MM-DD')}`;
    }),
    currentDateRangeText: computed<string>(() => {
        // 진행 중인 달이므로 오늘까지의 누적 구간을 표시한다.
        const currentMonth = dayjs.utc(state.currentMonth);
        return `${currentMonth.startOf('month').format('YYYY-MM-DD')} ~ ${dayjs.utc().format('YYYY-MM-DD')}`;
    }),
});

/**
 * analyze 응답은 is_confirmed(멤버는 project_id 까지)로 그룹핑되어 있어 한 달이 여러 엔트리로 흩어진다.
 * 월 단위로 합치지 않으면 날짜 키 조회가 중복 중 하나만 집어가 값이 누락된다.
 * 확정 여부는 실제 값이 잡힌 그룹의 것을 그 달의 상태로 삼는다.
 */
const getMergedChartData = (results?: CostReportDataAnalyzeResult[]): XYChartData[] => {
    const mergedByDate = new Map<string, XYChartData>();
    (results ?? []).forEach((item) => {
        item?.value_sum?.forEach((valueSum) => {
            const prev = mergedByDate.get(valueSum.date);
            mergedByDate.set(valueSum.date, {
                date: valueSum.date,
                value: (prev?.value ?? 0) + (valueSum.value ?? 0),
                is_confirmed: valueSum.value ? item.is_confirmed : prev?.is_confirmed,
            });
        });
    });
    return sortBy(Array.from(mergedByDate.values()), 'date');
};

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
                // is_confirmed 는 필터가 아니라 group_by 로 둔다.
                // 진행 중인 달은 is_confirmed: false 로만 존재하므로, 필터로 걸면 이번 달 카드가 영구히 비게 된다.
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
        state.chartData = getMergedChartData(results);
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
                                <template v-if="state.recentMonthValue">
                                    <span class="unit">{{ CURRENCY_SYMBOL?.[state.currency] }}</span>
                                    <span>{{ currencyMoneyFormatter(state.recentMonthValue.value, { currency: state.currency, style: 'decimal' }) }}</span>
                                    <p-status v-bind="costStateSummaryFormatter(state.recentMonthValue.is_confirmed ? COST_SUMMARY_STATE_TYPE.CONFIRM : COST_SUMMARY_STATE_TYPE.ESTIMATED)"
                                              :text="state.recentMonthValue.is_confirmed ? $t('HOME.CONFIRM') : $t('HOME.ESTIMATED')"
                                              class="capitalize state"
                                    />
                                </template>
                                <span v-else>-</span>
                            </p>
                            <p class="date">
                                {{ state.recentDateRangeText }}
                            </p>
                            <p v-if="!state.recentMonthValue"
                               class="no-data-text"
                            >
                                {{ $t('HOME.COST_SUMMARY_NO_DATA_FOR_MONTH') }}
                            </p>
                        </div>
                        <p-divider class="divider"
                                   vertical
                        />
                        <div class="price-view">
                            <p>{{ $t('HOME.COST_SUMMARY_CURRENT_TOTAL_COST') }}</p>
                            <p class="price">
                                <template v-if="state.currentMonthValue">
                                    <span class="unit">{{ CURRENCY_SYMBOL?.[state.currency] }}</span>
                                    <span>{{ currencyMoneyFormatter(state.currentMonthValue.value, { currency: state.currency, style: 'decimal' }) }}</span>
                                    <p-status v-bind="costStateSummaryFormatter(COST_SUMMARY_STATE_TYPE.AGGREGATING)"
                                              :text="$t('HOME.AGGREGATING')"
                                              class="capitalize state"
                                    />
                                </template>
                                <span v-else>-</span>
                            </p>
                            <p class="date">
                                {{ state.currentDateRangeText }}
                            </p>
                            <p v-if="!state.currentMonthValue"
                               class="no-data-text"
                            >
                                {{ $t('HOME.COST_SUMMARY_NO_DATA_FOR_MONTH') }}
                            </p>
                        </div>
                    </div>
                    <span class="chart-description">{{ $t('HOME.COST_SUMMARY_DESC') }}</span>
                    <cost-summary-chart :period="state.chartPeriod"
                                        :currency="state.currency"
                                        :data="state.chartData"
                    />
                </div>
                <div v-if="!state.isWorkspaceMember && state.accessLink">
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
                .no-data-text {
                    @apply text-label-sm text-gray-500;
                    margin-top: 0.25rem;
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
