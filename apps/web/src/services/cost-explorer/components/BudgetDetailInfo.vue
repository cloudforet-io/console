<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import {
    PPaneLayout, PLink, PI, PTextButton, PPopover,
} from '@cloudforet/mirinae';


import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { gray } from '@/styles/colors';

import BudgetDetailInfoAmountPlanningTypePopover from '@/services/cost-explorer/components/BudgetDetailInfoAmountPlanningTypePopover.vue';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


const changeToLabelList = (providerList: string[]): string => providerList.map((provider) => storeState.providers[provider]?.label ?? '').join(', ') || 'All';

const allReferenceStore = useAllReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();
const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const { getReferenceLocation } = useReferenceRouter();

const costTypeWrapperRef = ref<HTMLElement|null>(null);
const costTypeRef = ref<HTMLElement|null>(null);

const storeState = reactive({
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
});
const state = reactive({
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
    isProjectTarget: computed(() => state.budgetData?.resource_group === 'PROJECT'),
    providerListText: computed<string>(() => {
        if (!budgetPageState.budgetData) return '';
        const providerFilter = budgetPageState.budgetData?.provider_filter;
        if (providerFilter?.state === 'DISABLED') return 'All';
        return changeToLabelList(providerFilter?.providers ?? []);
    }),
    targetLabel: computed<{ group?: string, name: string }>(() => {
        const targetId = state.isProjectTarget ? state.budgetData?.project_id : state.budgetData?.workspace_id;
        if (state.isProjectTarget) {
            const project = storeState.projects[targetId];
            return {
                group: project?.data?.groupInfo?.name ?? '',
                name: project?.name ?? targetId,
            };
        }
        return {
            name: storeState.workspaces[targetId]?.name ?? targetId,
        };
    }),
    targetLocation: computed<Location|undefined>(() => {
        if (state.isProjectTarget) {
            return getReferenceLocation(
                state.budgetData?.project_id,
                {
                    resource_type: 'identity.Project',
                    workspace_id: userWorkspaceStore.getters.currentWorkspaceId,
                },
            );
        }
        // HACK: This is a temporary solution. It should be changed to the proper route.
        // if (isAdminMode.value) {
        //     return ({
        //         name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        //         params: {
        //             workspaceId: state.budgetData?.workspace_id,
        //         },
        //     });
        // }
        return undefined;
    }),
    isTextTruncate: undefined as boolean|undefined,
});

/* Watcher */
watch(() => costTypeRef.value, (costType) => {
    if (costTypeWrapperRef.value && costType) {
        const costTypeWrapperWidth = costTypeWrapperRef.value.offsetWidth;
        const costTypeWidth = costType.offsetWidth;
        state.isTextTruncate = costTypeWrapperWidth <= (costTypeWidth + 60);
    }
});
</script>

<template>
    <section class="budget-detail-info">
        <p-pane-layout class="summary-card">
            <span v-if="!budgetPageState.loading"
                  class="summary-title"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.AMOUNT_PLANNING_TYPE') }} <span class="font-normal">({{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.PERIOD') }})</span>
            </span>
            <div v-if="!budgetPageState.loading"
                 class="flex justify-between"
            >
                <p v-if="state.budgetData?.time_unit === 'TOTAL'"
                   class="summary-content"
                >
                    <b>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.TOTAL_AMOUNT') }}</b> ({{ state.budgetData?.start }} ~ {{ state.budgetData?.end }})
                </p>
                <p v-else
                   class="summary-content"
                >
                    <b>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MONTHLY_PLANNING') }}</b> ({{ state.budgetData?.start }} ~ {{ state.budgetData?.end }})
                </p>
                <budget-detail-info-amount-planning-type-popover class="summary-content">
                    <span class="view-all">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.DETAILS') }}</span>
                </budget-detail-info-amount-planning-type-popover>
            </div>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.TARGET') }}</span>
            <p v-if="!budgetPageState.loading"
               class="summary-content target"
            >
                <span v-if="state.targetLabel.group"
                      class="target-project-group"
                >
                    <span>
                        {{ state.targetLabel.group }}
                    </span>
                    <p-i name="ic_chevron-right-thin"
                         width="0.75rem"
                         height="0.75rem"
                         :color="gray[400]"
                    />
                </span>
                <p-link v-if="state.targetLocation"
                        action-icon="internal-link"
                        new-tab
                        highlight
                        :to="state.targetLocation"
                >
                    {{ state.targetLabel.name }}
                </p-link>
                <span v-else>
                    {{ state.targetLabel.name }}
                </span>
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
                    <span class="cost-type-content">{{ state.providerListText }}</span>
                </span>
                <p-popover>
                    <p-text-button v-if="state.isTextTruncate"
                                   style-type="highlight"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.VIEW_ALL') }}
                    </p-text-button>
                    <template #content>
                        <div class="content-wrapper">
                            {{ state.providerListText }}
                        </div>
                    </template>
                </p-popover>
            </div>
        </p-pane-layout>
    </section>
</template>

<style lang="postcss" scoped>
.budget-detail-info {
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
            display: inline-block;
            gap: 0.125rem;
            .target-project-group {
                @apply items-center;
                display: inline-block;
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
        flex-direction: column;
        row-gap: 0.5rem;
        .summary-card {
            width: auto;
        }
    }
}
</style>
