<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';

import {
    PDivider, PI, PSkeleton,
} from '@spaceone/design-system';

import { store } from '@/store';

import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import type {
    BudgetUsageAnalyzeResult,
} from '@/services/cost-explorer/budget/budget-main/modules/budget-list/budget-main-page-api-helper';
import BudgetUsageProgressBar from '@/services/cost-explorer/budget/budget-main/modules/budget-list/BudgetUsageProgressBar.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';


interface Props {
    budgetUsage: BudgetUsageAnalyzeResult;
    budgetLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    budgetLoading: true,
});

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    currency: computed(() => store.state.settings.currency),
    currencyRates: computed(() => store.state.settings.currencyRates),
});
const state = reactive({
    linkLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
        params: {
            budgetId: props.budgetUsage.budget_id,
        },
    })),
    isProject: computed<boolean>(() => !!props.budgetUsage.project_id),
    projects: computed(() => {
        const projects: string[] = [];
        if (state.isProject) {
            const projectId = props.budgetUsage.project_id as string;
            const project: ProjectReferenceItem|undefined = storeState.projects[projectId];
            if (project?.data?.groupInfo.name) projects.push(project.data.groupInfo.name);
            projects.push(project?.name ?? projectId);
        } else {
            const projectGroupId = props.budgetUsage.project_group_id as string;
            const projectGroup: ProjectGroupReferenceItem|undefined = storeState.projectGroups[projectGroupId];
            if (projectGroup?.data?.parentGroupInfo?.name) projects.push(projectGroup.data.parentGroupInfo.name);
            projects.push(projectGroup?.name ?? projectGroupId);
        }
        return projects;
    }),
    cost: computed<number>(() => props.budgetUsage.total_spent ?? 0),
    limit: computed<number>(() => props.budgetUsage.total_budget ?? 0),
    percentage: computed<number>(() => props.budgetUsage.budget_usage ?? 0),
    currency: computed<Currency>(() => {
        const targetDataSource = allReferenceStore.getters.costDataSource[props.budgetUsage.data_source_id ?? ''];
        const currentCurrency = targetDataSource.data.plugin_info.metadata.currency;
        return currentCurrency ?? CURRENCY.USD;
    }),
    progressStatus: computed<'overspent'|'warning'|'unused'|'common'>(() => {
        if (state.percentage >= 100) return 'overspent';
        if (state.percentage >= 90) return 'warning';
        if (state.percentage === 0) return 'unused';
        return 'common';
    }),
    dataSourceText: computed<string>(() => {
        const targetDataSource = allReferenceStore.getters.costDataSource[props.budgetUsage.data_source_id ?? ''];
        return targetDataSource?.label ?? '';
    }),
    providerText: computed<string>(() => {
        const providerFilter = props.budgetUsage.provider_filter;
        if (!providerFilter) return '';
        if (providerFilter.providers?.length && providerFilter.state === 'ENABLED') {
            return providerFilter.providers.map((providerId) => {
                const targetProvider = storeState.providers[providerId];
                return targetProvider?.label ?? providerId;
            }).join(', ');
        }
        return 'All';
    }),
    currencyText: computed<string>(() => {
        const currentSymbol: string = CURRENCY_SYMBOL[state.currency];
        const result = (state.currency && currentSymbol) && `${currentSymbol}${state.currency}`;
        return result || `${CURRENCY_SYMBOL.USD}${CURRENCY.USD}`;
    }),
});

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/serviceAccount/load'),
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
        store.dispatch('reference/region/load'),
        store.dispatch('reference/provider/load'),
    ]);
})();

</script>

<template>
    <router-link :to="state.linkLocation"
                 class="budget-list-card"
    >
        <div v-if="props.budgetLoading"
             class="skeleton-wrapper"
        >
            <div class="top">
                <p-skeleton width="30%"
                            height="1rem"
                />
                <p-skeleton width="23%"
                            height="1.5rem"
                />
            </div>
            <p-skeleton width="40%"
                        height="1rem"
            />
        </div>
        <div v-else
             class="card-wrapper"
        >
            <div class="card-header">
                <div class="flex items-center mb-1">
                    <span v-for="(name, index) in state.projects"
                          :key="name"
                          class="project-info"
                          :class="{target: index === state.projects.length - 1}"
                    >
                        <p-i v-if="index === state.projects.length - 1"
                             :name="state.isProject ? 'ic_document-filled' : 'ic_folder-filled'"
                             color="inherit"
                             width="1em"
                             height="1em"
                             class="mr-1"
                        />
                        {{ name }}
                        <p-i v-if="index < state.projects.length - 1"
                             name="ic_chevron-right-thin"
                             width="1em"
                             height="1em"
                        />
                    </span>
                </div>
                <p class="budget-name">
                    {{ props.budgetUsage.name }}
                </p>
            </div>
            <p-divider />
            <div class="card-body">
                <div class="budget-progress">
                    <div class="label-wrapper">
                        <div class="label-left">
                            <p class="label">
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.AMOUNT_SPENT') }}
                            </p>
                            <div class="amount-used-wrapper"
                                 :class="state.progressStatus"
                            >
                                <span class="cost">{{ currencyMoneyFormatter(state.cost, state.currency) }}</span>
                                <span class="percent">(<template v-if="state.percentage < 0">0.00</template>
                                    <template v-else>{{ state.percentage.toFixed(2) }}</template>%)</span>
                            </div>
                        </div>
                        <div class="label-right">
                            <p class="label">
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGETED') }}
                            </p>
                            <div class="cost">
                                {{ currencyMoneyFormatter(state.limit, state.currency) }}
                            </div>
                        </div>
                    </div>
                    <budget-usage-progress-bar :usage-rate="state.percentage" />
                </div>
                <div class="budget-description">
                    <div class="description-wrapper">
                        <span class="sub-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DATA_SOURCE') }}</span>
                        <span class="text">{{ state.dataSourceText }}</span>
                        <span class="currency-text">({{ state.currencyText }})</span>
                    </div>
                    <div class="description-wrapper">
                        <span class="sub-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.PROVIDER') }}</span>
                        <span class="text">{{ state.providerText }}</span>
                    </div>
                </div>
            </div>
        </div>
    </router-link>
</template>

<style lang="postcss" scoped>
.skeleton-wrapper {
    @apply border border-solid border-gray-200 rounded-lg bg-white p-4;
    height: 12.5rem;
    .top {
        @apply flex flex-col flex-wrap gap-1;
        margin-bottom: 1.25rem;
    }
}
.budget-list-card {
    @apply rounded-lg border border-solid border-gray-200 rounded-lg bg-white;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06);
    &:hover {
        @apply bg-secondary-2;
    }
    .card-wrapper {
        line-height: 1.2;
        .card-header {
            padding: 1rem;
            .budget-name {
                @apply text-gray-900 font-bold;
            }
            .project-info {
                @apply text-gray-400;
                display: inline-flex;
                flex-wrap: wrap;
                align-items: center;
                font-size: 0.75rem;
                &.target {
                    @apply text-gray-700;
                }
            }
        }
        .card-body {
            .label {
                @apply text-gray-400;
                font-size: 0.75rem;
            }
            padding: 1rem;
            .label-wrapper {
                @apply flex justify-between;
                margin-bottom: 0.25rem;
                .cost {
                    font-size: 1.125rem;
                    line-height: 1.75rem;
                }
                .label-left {
                    .amount-used-wrapper {
                        @apply flex flex-wrap gap-1 items-center;
                        &.overspent {
                            @apply text-red-400;
                        }
                        &.warning {
                            @apply text-yellow-500;
                        }
                        &.common {
                            @apply text-indigo-500;
                        }
                        &.unused {
                            @apply text-gray-500;
                        }
                        .cost {
                            @apply font-bold;
                        }
                        .percent {
                            @apply ml-1;
                            font-size: 0.75rem;
                            line-height: 0.75rem;
                        }
                    }
                }

                .label-right {
                    @apply text-right;
                }
            }
            .budget-progress {
                margin-bottom: 1.25rem;
            }
            .budget-description {
                @apply text-paragraph-sm text-gray-700;
                display: block;
                width: 100%;

                .description-wrapper {
                    display: block;
                    .sub-title {
                        font-weight: bold;
                        padding-right: 0.25rem;
                    }
                    .currency-text {
                        @apply text-gray-400;
                        padding-left: 0.25rem;
                    }
                }
            }
        }
    }
}
</style>
