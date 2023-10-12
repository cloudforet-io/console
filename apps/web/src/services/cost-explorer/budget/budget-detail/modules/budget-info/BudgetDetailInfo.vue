<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PPaneLayout, PLink, PI, PTextButton, PPopover,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { gray } from '@/styles/colors';

import AmountPlanningTypePopover
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-info/AmountPlanningTypePopover.vue';
import type { BudgetModel } from '@/services/cost-explorer/budget/model';
import {
    BUDGET_TIME_UNIT,
} from '@/services/cost-explorer/budget/model';
import type { BudgetTargetLabel } from '@/services/cost-explorer/budget/type';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/store/budget-detail-page-store';

const changeToLabelList = (providerList: string[]): string => providerList.map((provider) => state.providers[provider]?.label ?? '').join(', ') || 'All';

const allReferenceStore = useAllReferenceStore();

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const costTypeWrapperRef = ref<HTMLElement|null>(null);
const costTypeRef = ref<HTMLElement|null>(null);

const state = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
    processedProviderValue: computed<string>(() => {
        if (!budgetPageState.budgetData) return '';
        const providerFilter = budgetPageState.budgetData?.provider_filter;
        if (providerFilter?.state === 'DISABLED') return 'All';
        return changeToLabelList(providerFilter?.providers ?? []);
    }),
    isTextTruncate: undefined as boolean|undefined,
    popoverVisible: false,
});

const getTargetLabel = (projects: ProjectReferenceMap): BudgetTargetLabel => {
    let project;
    if (budgetPageState.budgetData?.project_id) {
        project = projects[budgetPageState.budgetData.project_id];
        return {
            group: project.data.groupInfo?.name ?? '',
            name: project?.name ?? '',
        };
    }
    if (budgetPageState.budgetData?.project_group_id) {
        project = state.projectGroups[budgetPageState.budgetData.project_group_id];
        return {
            name: project?.name ?? '',
        };
    }
    return {
        name: 'No Item',
    };
};


/* Watcher */
watch(() => costTypeRef.value, (costType) => {
    if (costTypeWrapperRef.value && costType) {
        const costTypeWrapperWidth = costTypeWrapperRef.value.offsetWidth;
        const costTypeWidth = costType.offsetWidth;
        state.isTextTruncate = costTypeWrapperWidth <= (costTypeWidth + 60);
    }
});

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        allReferenceStore.load('project'),
        allReferenceStore.load('projectGroup'),
        allReferenceStore.load('plugin'),
    ]);
})();
</script>

<template>
    <section class="budget-detail-summary">
        <p-pane-layout class="summary-card">
            <span v-if="!budgetPageState.loading"
                  class="summary-title"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.AMOUNT_PLANNING_TYPE') }} <span class="font-normal">({{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.PERIOD') }})</span>
            </span>
            <div v-if="!budgetPageState.loading"
                 class="flex justify-between"
            >
                <p v-if="state.budgetData?.time_unit === BUDGET_TIME_UNIT.TOTAL"
                   class="summary-content"
                >
                    <b>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.TOTAL_AMOUNT') }}</b> ({{ state.budgetData?.start }} ~ {{ state.budgetData?.end }})
                </p>
                <p v-else
                   class="summary-content"
                >
                    <b>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MONTHLY_PLANNING') }}</b> ({{ state.budgetData?.start }} ~ {{ state.budgetData?.end }})
                </p>
                <amount-planning-type-popover class="summary-content"
                                              :budget-data="state.budgetData"
                >
                    <span class="view-all">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.DETAILS') }}</span>
                </amount-planning-type-popover>
            </div>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.TARGET') }}</span>
            <p v-if="!budgetPageState.loading"
               class="summary-content target"
            >
                <span v-if="budgetPageState.budgetData?.project_id"
                      class="target-project-group"
                >
                    <span>
                        {{ getTargetLabel(state.projects).group }}
                    </span>
                    <p-i name="ic_chevron-right-thin"
                         width="0.75rem"
                         height="0.75rem"
                         :color="gray[400]"
                    />
                </span>
                <p-link v-if="state.budgetData?.project_group_id || state.budgetData?.project_id"
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        highlight
                        :to="referenceRouter(
                            (state.budgetData?.project_id || state.budgetData?.project_group_id) ?? '',
                            { resource_type: state.budgetData?.project_id ? 'identity.Project' : 'identity.ProjectGroup' })"
                >
                    {{ getTargetLabel(state.projects).name }}
                </p-link>
            </p>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.PROVIDER') }}</span>
            <div v-if="!budgetPageState.loading"
                 ref="costTypeWrapperRef"
                 class="cost-type-wrapper"
            >
                <span ref="costTypeRef"
                      class="summary-content cost-type"
                >
                    <span class="cost-type-content">{{ state.processedProviderValue }}</span>
                </span>
                <p-popover :is-visible="state.popoverVisible">
                    <p-text-button v-if="state.isTextTruncate"
                                   style-type="highlight"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.VIEW_ALL') }}
                    </p-text-button>
                    <template #content>
                        <div class="content-wrapper">
                            {{ state.processedProviderValue }}
                        </div>
                    </template>
                </p-popover>
            </div>
        </p-pane-layout>
    </section>
</template>

<style lang="postcss" scoped>
.budget-detail-summary {
    @apply flex;
    column-gap: 1rem;
    .summary-card {
        @apply flex flex-col justify-between;
        width: 33%;
        min-height: 4.875rem;
        padding: 1rem 1rem;
    }
    .summary-title {
        @apply text-gray-500 font-bold;
        font-size: 0.875rem;
        line-height: 130%;
    }
    .cost-type-wrapper {
        @apply relative flex justify-between items-end;
        .summary-content.cost-type {
            @apply flex justify-between;
            max-width: calc(100% - 3.75rem);
            &.is-view-all {
                max-width: initial;
                margin-top: 0.5rem;
                .cost-type-content {
                    overflow: initial;
                    text-overflow: initial;
                    white-space: initial;
                }
            }
            .cost-type-content {
                @apply truncate;
                font-size: 0.875rem;
                line-height: 130%;
            }
        }
    }
    .summary-content {
        font-size: 0.875rem;
        line-height: 120%;
        &.target {
            @apply flex;
            gap: 0.125rem;
            .target-project-group {
                @apply flex items-center;
                gap: 0.125rem;
            }
        }
    }
    .view-all {
        @apply text-blue-700 cursor-pointer;
        font-size: 0.875rem;
        margin-left: 0.5rem;
        flex-shrink: 0;
    }

    .content-wrapper {
        @apply flex flex-col;
        line-height: 125%;
        font-size: 0.875rem;
    }

    @screen tablet {
        @apply flex-col;
        row-gap: 0.5rem;
        .summary-card {
            width: auto;
        }
    }
}
</style>
