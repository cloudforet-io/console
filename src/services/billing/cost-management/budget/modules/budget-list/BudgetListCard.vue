<template>
    <router-link :to="linkLocation" class="budget-list-card">
        <div v-if="loading" class="skeleton-wrapper">
            <div class="top">
                <p-skeleton width="30%" height="1rem" />
                <p-skeleton width="23%" height="1.5rem" />
            </div>
            <p-skeleton width="40%" height="1rem" />
        </div>
        <div v-else class="card-wrapper">
            <div class="card-header">
                <p-breadcrumbs :routes="budgetRoutes" class="breadcrumbs" />
                <p class="budget-name">
                    {{ budget.name }}
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
                                <span class="cost">{{ `$${budget.total_usage_usd_cost}` }}</span>
                                <span class="percent">{{ `(${percentage}%)` }}</span>
                            </div>
                        </div>
                        <div class="label-right">
                            <p class="label">
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGETED') }}
                            </p>
                            <div class="cost">
                                {{ `$${budget.limit}` }}
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
                            <span>{{ costTypeList }}</span>
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

import { BudgetData } from '@/services/billing/cost-management/budget/type';
import { BILLING_ROUTE } from '@/services/billing/routes';
import {
    PBreadcrumbs, PDivider, PSkeleton,
} from '@spaceone/design-system';
import BudgetUsageProgressBar from '@/services/billing/cost-management/modules/BudgetUsageProgressBar.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { capitalize } from 'lodash';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

interface Props {
    budget: BudgetData;
}

interface Route {
    name: string;
    path?: string;
    to?: Location;
}

export const PROVIDER_MAP = Object.freeze({
    google_cloud: 'Google Cloud',
    azure: 'Azure',
    aws: 'AWS',
});

export default {
    name: 'BudgetListCard',
    components: {
        PBreadcrumbs,
        PDivider,
        PSkeleton,
        BudgetUsageProgressBar,
    },
    props: {
        budget: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props) {
        const { i18nDayjs } = useI18nDayjs();

        const state = reactive({
            linkLocation: computed<Location>(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                params: {
                    budgetId: props.budget.budget_id,
                },
            })),
            loading: true,
            budgetRoutes: computed<Route[]>(() => ([
                { name: 'Project Group' },
                { name: props.budget.name },
            ])),
            costTypeList: computed<string>(() => {
                const costTypes = props.budget.cost_types;
                let costTypeList = '';

                if (!costTypes) return costTypeList;

                Object.entries(costTypes).forEach(([costType, costTypeValue]) => {
                    if (costTypeValue) costTypeList += ` ${capitalize(costType)}: ${costTypeValue.map(value => (` ${PROVIDER_MAP[value]}`))}`;
                });
                return costTypeList;
            }),
            percentage: computed<number>(() => {
                const value = parseFloat(((props.budget.total_usage_usd_cost / props.budget.limit) * 100).toFixed(1));
                if (Number.isNaN(value)) return 0;
                return value;
            }),
            progressStatus: computed<'overspent'|'warning'|'unused'|'common'>(() => {
                if (state.percentage >= 100) return 'overspent';
                if (state.percentage >= 90) return 'warning';
                if (state.percentage === 0) return 'unused';
                return 'common';
            }),
        });

        const formatTime = (time: string) => i18nDayjs.value(time).format('MMMYYYY');

        (async () => {
            await SpaceConnector.client.costAnalysis.budgetUsage.list({
                budget_id: props.budget.budget_id,
            });
            state.loading = false;
        })();
        return {
            ...toRefs(state),
            PROVIDER_MAP,
            formatTime,
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
    .card-wrapper {
        @apply border border-solid border-gray-200 rounded-lg bg-white;
        line-height: 1.2;
        .card-header {
            padding: 1rem;
            .budget-name {
                @apply text-gray-900 font-bold;
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
                    @apply flex flex-wrap gap-1 align-middle;
                    .cost-type {
                        @apply text-gray-700;
                        font-size: 0.75rem;
                    }
                }
            }
        }
    }
}
</style>
