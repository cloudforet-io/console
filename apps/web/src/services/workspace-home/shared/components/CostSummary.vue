<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, onMounted, onUnmounted, ref, toRef, watch,
} from 'vue';

import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PDivider, PFieldTitle, PLink, PSpinner, PStatus, screens,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useProjectReferenceStore, type ProjectReferenceMap } from '@/store/reference/project-reference-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { MENU_ID } from '@/lib/menu/config';
import { objectToQueryString } from '@/lib/router-query-string';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';
import { costStateSummaryFormatter } from '@/services/workspace-home/composables/use-workspace-home';
import CostSummaryChart from '@/services/workspace-home/shared/components/CostSummaryChart.vue';
import EmptySummaryData from '@/services/workspace-home/shared/components/EmptySummaryData.vue';
import type { CostChartData } from '@/services/workspace-home/shared/composables/use-cost-chart-data';
import { useCostChartData } from '@/services/workspace-home/shared/composables/use-cost-chart-data';
import { useCostDataSourceQuery } from '@/services/workspace-home/shared/composables/use-cost-data-source-query';
import { useCostReportConfigQuery } from '@/services/workspace-home/shared/composables/use-cost-report-config-query';
import { COST_SUMMARY_STATE_TYPE } from '@/services/workspace-home/shared/constants/cost-summary-constant';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/shared/constants/summary-type-constant';
import type { EmptyData } from '@/services/workspace-home/shared/types/empty-data-type';
import type { WidgetMode } from '@/services/workspace-home/shared/types/widget-mode-type';

const props = withDefaults(defineProps<{
    projectIds?: string[];
    mode?: WidgetMode;
}>(), {
    projectIds: undefined,
    mode: 'workspace',
});


/* period */
const { width } = useWindowSize();
const isDesktopSize = computed(() => width.value > screens.laptop.max);
const period = computed<Period>(() => {
    const reportMonth = dayjs().utc();
    const reportMonthPeriod = isDesktopSize.value ? 12 : 6;
    const start = dayjs(reportMonth).utc().subtract(reportMonthPeriod, 'month').format('YYYY-MM');
    const end = reportMonth.format('YYYY-MM');
    return { start, end };
});

/* permission */
const authorizationStore = useAuthorizationStore();
const isWorkspaceMember = computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER);
const pageAccessPermissionMap = computed<PageAccessMap>(() => authorizationStore.getters.pageAccessPermissionMap);

/* project select dropdown */
const showProjectSelectDropdown = computed(() => {
    if (props.mode === 'workspace') return isWorkspaceMember.value;
    return false;
});
const selectedProjects = ref<string[]>([]);
const projectReferenceStore = useProjectReferenceStore();
const projects = computed<ProjectReferenceMap>(() => projectReferenceStore.getters.projectItems);
const handleSelectedProject = (selectedProject: string[]) => {
    selectedProjects.value = selectedProject;
};
watch(projects, (prjs) => {
    if (!showProjectSelectDropdown.value) return;
    const project = Object.keys(prjs)[0];
    selectedProjects.value = [project];
}, { immediate: true });

/* data source */
const { dataSource } = useCostDataSourceQuery();

/* access link */
const accessLink = computed<boolean>(() => !isEmpty(pageAccessPermissionMap.value[MENU_ID.COST_REPORT]));

/* project filter for cost analysis page */
const consoleFilters = computed<ConsoleFilter[]>(() => {
    if (props.mode === 'workspace') {
        if (isWorkspaceMember.value) {
            return [
                { k: 'project_id', v: selectedProjects.value, o: '=' },
            ];
        }
        return [];
    }
    if (props.projectIds?.length) {
        return [
            { k: 'project_id', v: props.projectIds, o: '=' },
        ];
    }
    return [];
});
const consoleFiltersQueryString = computed(() => objectToQueryString(consoleFilters.value));

/* cost report config */
const costReportEnabled = computed(() => {
    if (props.mode === 'workspace') return !isWorkspaceMember.value;
    return false;
});
const { costReportConfig } = useCostReportConfigQuery({
    enabled: costReportEnabled,
});

/* currency */
const currency = computed<Currency>(() => costReportConfig.value?.currency || CURRENCY.USD);

/* chart data */
const mounted = ref(false);
onMounted(() => {
    mounted.value = true;
});
onUnmounted(() => {
    mounted.value = false;
});
const { chartData, isLoading } = useCostChartData({
    mode: toRef(props, 'mode'),
    enabled: computed(() => {
        if (props.mode === 'workspace') {
            if (!isWorkspaceMember.value) {
                return !!costReportConfig.value && mounted.value;
            }
            return mounted.value;
        }
        // project mode
        return !!props.projectIds && props.projectIds.length > 0 && mounted.value;
    }),
    period,
    currency,
    projectIds: computed(() => {
        if (props.mode === 'workspace') {
            if (isWorkspaceMember.value) {
                return selectedProjects.value;
            }
            return undefined;
        }
        return props.projectIds;
    }),
});

/* empty data */
const emptyData = computed<EmptyData>(() => {
    let result = {} as EmptyData;
    if (dataSource.value?.length === 0) {
        result = {
            to: { name: COST_EXPLORER_ROUTE.LANDING._NAME },
            title: i18n.t('HOME.ACTIVATION_REQUIRED'),
            desc: i18n.t('HOME.ACTIVATION_REQUIRED_DESC'),
            buttonText: i18n.t('HOME.LEARN_MORE'),
        };
    } else if (isWorkspaceMember.value && isEmpty(projects.value)) {
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
});

/* monthly cost */
const recentMonthValue = computed<CostChartData|undefined>(() => chartData.value?.[chartData.value.length - 2]);
const currentMonthValue = computed<CostChartData|undefined>(() => chartData.value?.[chartData.value.length - 1]);

/* date range */
const recentDateRangeText = computed<string>(() => {
    const lastMonth = dayjs().utc().subtract(1, 'month');
    return `${lastMonth.startOf('month').format('YYYY-MM-DD')} ~ ${lastMonth.endOf('month').format('YYYY-MM-DD')}`;
});
const currentDateRangeText = computed<string>(() => {
    const currentMonth = dayjs().utc();
    return `${currentMonth.startOf('month').format('YYYY-MM-DD')} ~ ${currentMonth.format('YYYY-MM-DD')}`;
});

</script>

<template>
    <div class="cost-summary">
        <div class="heading-wrapper">
            <p-field-title :label="$t('HOME.COST_SUMMARY_TITLE')"
                           size="lg"
                           class="main-title"
            />
            <project-select-dropdown v-if="showProjectSelectDropdown && !isEmpty(projects)"
                                     class="project-select-dropdown"
                                     :selected-project-ids="selectedProjects"
                                     :use-fixed-menu-style="false"
                                     project-selectable
                                     position="right"
                                     hide-create-button
                                     :selection-label="$t('HOME.COST_SUMMARY_BY_PROJECT')"
                                     :project-group-selectable="false"
                                     @update:selected-project-ids="handleSelectedProject"
            />
        </div>
        <div v-if="isLoading"
             class="loading"
        >
            <p-spinner size="lg" />
        </div>
        <div v-else>
            <div v-if="chartData && chartData.length > 0">
                <div class="content-wrapper">
                    <div class="price-wrapper">
                        <div class="price-view">
                            <p>{{ $t('HOME.COST_SUMMARY_LAST_MONT_TOTAL_COST') }}</p>
                            <p class="price">
                                <span class="unit">{{ CURRENCY_SYMBOL?.[currency] }}</span>
                                <span>{{ currencyMoneyFormatter(recentMonthValue?.value, { currency, style: 'decimal' }) }}</span>
                                <p-status v-bind="costStateSummaryFormatter(recentMonthValue?.is_confirmed ? COST_SUMMARY_STATE_TYPE.CONFIRM : COST_SUMMARY_STATE_TYPE.ESTIMATED)"
                                          :text="recentMonthValue?.is_confirmed ? $t('HOME.CONFIRM') : $t('HOME.ESTIMATED')"
                                          class="capitalize state"
                                />
                            </p>
                            <p class="date">
                                {{ recentDateRangeText }}
                            </p>
                        </div>
                        <p-divider class="divider"
                                   vertical
                        />
                        <div class="price-view">
                            <p>{{ $t('HOME.COST_SUMMARY_CURRENT_TOTAL_COST') }}</p>
                            <p class="price">
                                <span class="unit">{{ CURRENCY_SYMBOL?.[currency] }}</span>
                                <span>{{ currencyMoneyFormatter(currentMonthValue?.value, { currency, style: 'decimal' }) }}</span>
                                <p-status v-bind="costStateSummaryFormatter(COST_SUMMARY_STATE_TYPE.AGGREGATING)"
                                          :text="$t('HOME.AGGREGATING')"
                                          class="capitalize state"
                                />
                            </p>
                            <p class="date">
                                {{ currentDateRangeText }}
                            </p>
                        </div>
                    </div>
                    <span class="chart-description">{{ $t('HOME.COST_SUMMARY_DESC') }}</span>
                    <cost-summary-chart :currency="currency"
                                        :data="chartData"
                    />
                </div>
                <div v-if="!isWorkspaceMember && accessLink">
                    <p-divider class="divider" />
                    <div class="link-footer">
                        <p-link highlight
                                :to="consoleFiltersQueryString ? {
                                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                                    params: {
                                        dataSourceId: UNIFIED_COST_KEY,
                                        costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
                                    },
                                    query: {
                                        filters: consoleFiltersQueryString
                                    }
                                } : {
                                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                                }"
                                action-icon="internal-link"
                                class="link"
                        >
                            {{ $t('HOME.COST_SUMMARY_GO_TO_COST_ANALYSIS') }}
                        </p-link>
                        <div v-if="costReportEnabled"
                             class="vertical-divider"
                        >
                            <p-divider style="height: 14px;"
                                       vertical
                            />
                        </div>
                        <p-link v-if="costReportEnabled"
                                highlight
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
                                :empty-data="emptyData"
                                :type="SUMMARY_DATA_TYPE.COST"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.cost-summary {
    @apply rounded-lg bg-white;
    min-height: 30.5rem;
    .heading-wrapper {
        @apply flex;
        .project-select-dropdown {
            @apply mt-6 mr-6;
            margin-left: auto;
        }
    }
    .loading {
        @apply flex items-center justify-center;
        min-height: 27.5rem;
    }
    .main-title {
        @apply pt-6 px-6;
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
