<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PDivider, PFieldTitle, PLink, PSpinner,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { isEmpty, sum } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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
import type { CostReportDataAnalyzeResult } from '@/services/cost-explorer/types/cost-report-data-type';
import CostSummaryChart from '@/services/workspace-home/components/CostSummaryChart.vue';
import EmptySummaryData from '@/services/workspace-home/components/EmptySummaryData.vue';
import { SUMMARY_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { EmptyData } from '@/services/workspace-home/types/workspace-home-type';

const { getProperRouteLocation } = useProperRouteLocation();
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    costReportConfig: computed<CostReportConfigModel|null|undefined>(() => workspaceHomePageState.costReportConfig),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
    dataSource: computed<CostDataSourceModel[]>(() => workspaceHomePageState.dataSource),
    getCurrentRoleInfo: computed<RoleInfo>(() => store.getters['user/getCurrentRoleInfo']),
    projects: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
});
const state = reactive({
    loading: true,
    currency: computed<Currency|undefined>(() => storeState.costReportConfig?.currency || CURRENCY.USD),
    isWorkspaceMember: computed(() => storeState.getCurrentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    chartData: undefined as AnalyzeResponse<CostReportDataAnalyzeResult>|undefined,
    totalAmount: computed(() => sum(state.chartData?.results[0]?.value_sum.map((d) => d.value))),
    recentReportMonth: computed(() => dayjs().utc().subtract(1, 'month')),
    period: computed(() => {
        const start = dayjs(state.recentReportMonth).utc().subtract(5, 'month').format('YYYY-MM');
        const end = state.recentReportMonth.format('YYYY-MM');
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
});

const handleSelectedProject = async (selectedProject: string[]) => {
    state.selectedProjects = selectedProject;
    await analyzeCostReportData();
};

const analyzeCostReportData = async () => {
    state.loading = true;
    try {
        state.chartData = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters>({
            cost_report_config_id: storeState.costReportConfig?.cost_report_config_id,
            is_confirmed: true,
            query: {
                start: state.period.start,
                end: state.period.end,
                group_by: state.isWorkspaceMember ? ['project_id'] : undefined,
                fields: {
                    value_sum: {
                        key: `cost.${state.currency}`,
                        operator: 'sum',
                    },
                },
                granularity: GRANULARITY.MONTHLY,
                field_group: ['date'],
                sort: [{
                    key: '_total_value_sum',
                    desc: true,
                }],
                filter: state.isWorkspaceMember ? [
                    { k: 'project_id', v: state.selectedProjects[0], o: 'eq' },
                ] : undefined,
            },
        });
    } catch (e) {
        state.chartData = undefined;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.projects, async (projects) => {
    if (!state.isWorkspaceMember) return;
    const project = Object.keys(projects)[0];
    state.selectedProjects = [project];
    await analyzeCostReportData();
});
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
            <div v-if="state.chartData?.results.length > 0">
                <div class="content-wrapper">
                    <div class="price-wrapper">
                        <div>
                            <p>{{ $t('HOME.COST_SUMMARY_RECENT', { date: state.recentReportMonth.format('YYYY-MM') }) }}</p>
                            <p class="price">
                                <span class="unit">{{ CURRENCY_SYMBOL?.[state.currency] }}</span>
                                <span>{{ currencyMoneyFormatter(state.totalAmount, { currency: state.currency, style: 'decimal' }) }}</span>
                            </p>
                        </div>
                    </div>
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
        min-height: calc(100% - 2.625rem);
    }
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
}
</style>
