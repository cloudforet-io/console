<template>
    <router-link :to="linkLocation" class="budget-list-card">
        <div v-if="budgetLoading" class="skeleton-wrapper">
            <div class="top">
                <p-skeleton width="30%" height="1rem" />
                <p-skeleton width="23%" height="1.5rem" />
            </div>
            <p-skeleton width="40%" height="1rem" />
        </div>
        <div v-else class="card-wrapper">
            <div class="card-header">
                <div class="flex items-center mb-1">
                    <span v-for="(name, index) in projects"
                          :key="name"
                          class="project-info"
                          :class="{target: index === projects.length - 1}"
                    >
                        <p-i v-if="index === projects.length - 1"
                             :name="isProject ? 'ic_tree_project' : 'ic_tree_project-group'"
                             color="inherit"
                             width="1em" height="1em" class="mr-1"
                        />
                        {{ name }}
                        <p-i v-if="index < projects.length - 1"
                             name="ic_breadcrumb_arrow"
                             width="1em" height="1em"
                        />
                    </span>
                </div>
                <p class="budget-name">
                    {{ budgetUsage.name }}
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
                            <div class="amount-used-wrapper" :class="progressStatus">
                                <span class="cost">{{ currencyMoneyFormatter(cost, currency, currencyRates, false, 10000000000) }}</span>
                                <span class="percent">(<template v-if="percentage < 0">0.00</template>
                                    <template v-else>{{ percentage.toFixed(2) }}</template>%)</span>
                            </div>
                        </div>
                        <div class="label-right">
                            <p class="label">
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGETED') }}
                            </p>
                            <div class="cost">
                                {{ currencyMoneyFormatter(limit, currency, currencyRates, false, 10000000000) }}
                            </div>
                        </div>
                    </div>
                    <budget-usage-progress-bar :usage-rate="percentage" />
                </div>
                <div class="budget-description">
                    <div class="cost-type-wrapper">
                        <div class="label">
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.COST_TYPE') }}
                        </div>
                        <div class="cost-type">
                            <span v-for="({resourceList, costTypeLabel}) in costTypeResourceListMap" :key="costTypeLabel" class="truncate">
                                {{ costTypeLabel }}: {{ resourceList.join(', ') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </router-link>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { Location } from 'vue-router';

import { BudgetUsageData } from '@/services/billing/cost-management/budget/type';
import { BILLING_ROUTE } from '@/services/billing/routes';
import {
    PDivider, PI, PSkeleton,
} from '@spaceone/design-system';
import BudgetUsageProgressBar from '@/services/billing/cost-management/modules/BudgetUsageProgressBar.vue';
import { store } from '@/store';
import { ProjectResourceItem } from '@/store/modules/resource/project/type';
import { ProjectGroupResourceItem } from '@/store/modules/resource/project-group/type';
import { ResourceMap } from '@/store/modules/resource/type';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';


interface Props {
    budgetUsage: BudgetUsageData;
    budgetLoading: boolean;
}

type ResourceItemMap = {
    label: string;
    items: ResourceMap;
}

type CostTypeResourceItemMap = Record<string, ResourceItemMap>

type CostTypeResourceListMap = Record<string, {
    costTypeLabel: string;
    resourceList: string[];
}>


export default {
    name: 'BudgetListCard',
    components: {
        PI,
        PDivider,
        PSkeleton,
        BudgetUsageProgressBar,
    },
    props: {
        budgetUsage: {
            type: Object,
            default: () => ({}),
        },
        budgetLoading: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: Props) {
        const state = reactive({
            linkLocation: computed<Location>(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                params: {
                    budgetId: props.budgetUsage.budget_id,
                },
            })),
            isProject: computed<boolean>(() => !!props.budgetUsage.project_id),
            projects: computed(() => {
                const projects: string[] = [];
                if (state.isProject) {
                    const projectId = props.budgetUsage.project_id as string;
                    const project: ProjectResourceItem|undefined = store.state.resource.project.items[projectId];
                    if (project?.data?.groupInfo.name) projects.push(project.data.groupInfo.name);
                    projects.push(project?.name ?? projectId);
                } else {
                    const projectGroupId = props.budgetUsage.project_group_id as string;
                    const projectGroup: ProjectGroupResourceItem|undefined = store.state.resource.projectGroup.items[projectGroupId];
                    if (projectGroup?.data?.parentGroupInfo?.name) projects.push(projectGroup.data.parentGroupInfo.name);
                    projects.push(projectGroup?.name ?? projectGroupId);
                }
                return projects;
            }),
            resourceItemMap: computed<CostTypeResourceItemMap>(() => ({
                provider: {
                    label: 'Provider',
                    items: store.state.resource.provider.items,
                },
                region_code: {
                    label: 'Region',
                    items: store.state.resource.region.items,
                },
                service_account_id: {
                    label: 'Service Account',
                    items: store.state.resource.serviceAccount.items,
                },
            })),
            costTypeResourceListMap: computed<CostTypeResourceListMap>(() => {
                const costTypes = props.budgetUsage.cost_types;

                if (!costTypes) return {};

                const costTypeResourceListMap: CostTypeResourceListMap = {};
                Object.entries(costTypes).forEach(([costType, resources]) => {
                    if (Array.isArray(resources) && resources.length) {
                        const resource = state.resourceItemMap[costType];

                        costTypeResourceListMap[costType] = {
                            costTypeLabel: resource?.label ?? costType,
                            resourceList: resources.map(d => (resource?.items[d]?.name ?? d)),
                        };
                    }
                });

                return costTypeResourceListMap;
            }),
            cost: computed<number>(() => props.budgetUsage.usd_cost ?? 0),
            limit: computed<number>(() => props.budgetUsage.limit ?? 0),
            percentage: computed<number>(() => props.budgetUsage.usage ?? 0),
            progressStatus: computed<'overspent'|'warning'|'unused'|'common'>(() => {
                if (state.percentage >= 100) return 'overspent';
                if (state.percentage >= 90) return 'warning';
                if (state.percentage === 0) return 'unused';
                return 'common';
            }),

            // resource store items
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
        });


        return {
            ...toRefs(state),
            currencyMoneyFormatter,
        };
    },
};
</script>

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
                @apply flex flex-wrap gap-2 justify-between align-middle;

                .cost-type-wrapper {
                    @apply flex flex-wrap gap-1 align-middle w-full;
                    line-height: 1.5;
                    .cost-type {
                        @apply text-gray-700 truncate;
                        width: 70.1%;
                        font-size: 0.75rem;
                    }
                }
            }
        }
    }
}
</style>
