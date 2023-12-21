<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';

import {
    PDivider, PI, PBadge,
} from '@spaceone/design-system';

import type { BudgetUsageAnalyzeResult } from '@/schema/cost-analysis/budget-usage/api-verbs/analyze';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import BudgetMainUsageProgressBar from '@/services/cost-explorer/components/BudgetMainUsageProgressBar.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


interface Props {
    budgetUsage: BudgetUsageAnalyzeResult;
    more?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    budgetUsage: () => ({} as BudgetUsageAnalyzeResult),
});

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    costDataSource: computed(() => allReferenceStore.getters.costDataSource),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
});
const state = reactive({
    linkLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
        params: {
            budgetId: props.budgetUsage.budget_id,
        },
    })),
    isProject: computed(() => !!props.budgetUsage.project_id),
    targetLabelList: computed<string[]>(() => {
        const targetId = props.budgetUsage.project_id ?? props.budgetUsage.workspace_id;
        if (!targetId) return [];

        const targetNameList: string[] = [];
        if (props.budgetUsage.project_id) { // for project
            const targetProject: ProjectReferenceItem|undefined = storeState.projects[targetId];
            if (targetProject?.data?.groupInfo?.name) targetNameList.push(targetProject.data.groupInfo.name);
            targetNameList.push(targetProject?.name ?? targetId);
        } else if (props.budgetUsage.workspace_id) { // for workspace
            const targetWorkspace = storeState.workspaces[targetId];
            if (targetWorkspace) {
                targetNameList.push(targetWorkspace?.name ?? targetId);
            }
        }
        return targetNameList;
    }),
    cost: computed<number>(() => props.budgetUsage.total_spent ?? 0),
    limit: computed<number>(() => props.budgetUsage.total_budget ?? 0),
    percentage: computed<number>(() => props.budgetUsage.budget_usage ?? 0),
    currency: computed<Currency>(() => {
        const targetDataSource = storeState.costDataSource[props.budgetUsage.data_source_id ?? ''];
        if (!targetDataSource) return CURRENCY.USD;
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
        const targetDataSource = storeState.costDataSource[props.budgetUsage.data_source_id ?? ''];
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
        store.dispatch('reference/region/load'),
        store.dispatch('reference/provider/load'),
    ]);
})();

</script>

<template>
    <router-link :to="state.linkLocation"
                 class="budget-main-list-card"
    >
        <div class="card-header">
            <div class="left-part">
                <div class="flex items-center mb-1">
                    <span v-for="(targetName, index) in state.targetLabelList"
                          :key="`${targetName}-${index}`"
                          class="target-info"
                          :class="{target: index === state.targetLabelList.length - 1}"
                    >
                        <p-i v-if="state.isProject && index === state.targetLabelList.length - 1"
                             name="ic_document-filled"
                             color="inherit"
                             width="1em"
                             height="1em"
                             class="mr-1"
                        />
                        {{ targetName }}
                        <p-i v-if="index < state.targetLabelList.length - 1"
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
            <div v-if="!state.isProject && !storeState.isAdminMode"
                 class="right-part"
            >
                <p-badge style-type="indigo100"
                         badge-type="subtle"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MANAGED_BY_ADMIN') }}
                </p-badge>
            </div>
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
                            <span class="cost">{{ currencyMoneyFormatter(state.cost, { currency: state.currency }) }}</span>
                            <span class="percent">(<template v-if="state.percentage < 0">0.00</template>
                                <template v-else>{{ state.percentage.toFixed(2) }}</template>%)</span>
                        </div>
                    </div>
                    <div class="label-right">
                        <p class="label">
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGETED') }}
                        </p>
                        <div class="cost">
                            {{ currencyMoneyFormatter(state.limit, { currency: state.currency }) }}
                        </div>
                    </div>
                </div>
                <budget-main-usage-progress-bar
                    :usage-rate="state.percentage"
                />
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
    </router-link>
</template>

<style lang="postcss" scoped>
.budget-main-list-card {
    @apply rounded-lg border border-solid border-gray-200 rounded-lg bg-white;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06);
    &:hover {
        @apply bg-secondary-2;
    }
    line-height: 1.2;
    .card-header {
        display: flex;
        align-content: center;
        justify-content: space-between;
        padding: 1rem;
        .budget-name {
            @apply text-gray-900 font-bold;
        }
        .target-info {
            @apply text-gray-400;
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            font-size: 0.75rem;
            &.target {
                @apply text-gray-700;
            }
        }
        .right-part {
            display: flex;
            align-items: center;
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
</style>
