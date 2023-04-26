<template>
    <cost-dashboard-simple-card-widget
        :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.TOTAL_BUDGET_USAGE')"
        unit-type="PERCENT"
        :value="usageRate"
        :description="`${currencyMoneyFormatter(availableCost, currency, currencyRates, false, 10000000)} ${ $t('BILLING.COST_MANAGEMENT.DASHBOARD.AVAILABLE') }`"
        :loading="loading"
        :widget-link="widgetLink"
        :class="{ 'print-mode': printMode }"
    >
        <template v-if="!loading"
                  #title-extra
        >
            <p-i name="ic_money-bag"
                 width="1em"
                 height="1em"
                 class="mr-1"
            />
            {{ budgetCount }} Budgets
        </template>
        <template #default>
            <budget-usage-progress-bar :usage-rate="usageRate"
                                       :disable-animation="printMode"
                                       class="budget-progress-bar"
            />
            <p class="progress-bar-label">
                <span class="usage-cost"
                      :style="{ color: getUsageCostColor(usageCost, limitCost) }"
                >
                    {{ currencyMoneyFormatter(usageCost, currency, currencyRates, false, 10000000) }} <span class="spent">{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.SPENT') }}</span>
                </span>
                <span class="limit-cost">
                    {{ currencyMoneyFormatter(limitCost, currency, currencyRates, false, 10000000) }}
                </span>
            </p>
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">

import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PI } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo, red } from '@/styles/colors';

import {
    getConvertedBudgetFilter,
} from '@/services/cost-explorer/lib/helper';
import BudgetUsageProgressBar
    from '@/services/cost-explorer/modules/BudgetUsageProgressBar.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import CostDashboardSimpleCardWidget
    from '@/services/cost-explorer/widgets/modules/CostDashboardSimpleCardWidget.vue';

export default {
    name: 'BudgetUsage',
    components: {
        CostDashboardSimpleCardWidget,
        BudgetUsageProgressBar,
        PI,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
            validator(value: Currency) {
                return Object.values(CURRENCY).includes(value);
            },
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: true,
            budgetCount: 0,
            usageRate: 0,
            usageCost: 0,
            limitCost: 0,
            availableCost: computed(() => {
                if (state.limitCost - state.usageCost > 0) return state.limitCost - state.usageCost;
                return 0;
            }),
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return { name: COST_EXPLORER_ROUTE.BUDGET._NAME };
            }),
        });

        /* Util */
        const getUsageCostColor = (usageCost, limitCost) => {
            if (usageCost >= limitCost) return red[400];
            if (usageCost > 0) return indigo[500];
            return undefined;
        };

        /* Api */
        const budgetQueryHelper = new QueryHelper();
        const fetchData = async () => {
            budgetQueryHelper.setFilters(getConvertedBudgetFilter(props.filters));
            const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze({
                include_budget_count: true,
                include_project_info: false,
                start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                ...budgetQueryHelper.apiQuery,
            });
            return results;
        };
        const getData = async () => {
            try {
                state.loading = true;
                const results = await fetchData();

                let usageRate = results[0]?.usage ?? 0;
                if (usageRate < 0) usageRate = 0;
                state.usageRate = usageRate;

                state.usageCost = results[0]?.usd_cost || 0;
                state.limitCost = results[0]?.limit || 0;
                state.budgetCount = results[0]?.budget_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        /* Watcher */
        watch([() => props.period, () => props.filters], async () => {
            await getData();
            await vm.$nextTick();
            emit('rendered');
        }, { immediate: true });

        return {
            ...toRefs(state),
            currencyMoneyFormatter,
            getUsageCostColor,
        };
    },
};
</script>
<style lang="postcss" scoped>
/* custom progress-bar */
.progress-bar {
    :deep(.background-bar) {
        height: 0.75rem;
    }
    :deep(.tracker-bar) {
        height: 0.75rem;
        margin-top: -0.75rem;
    }
}

.progress-bar-label {
    @apply flex;
    margin-top: 0.25rem;
    justify-content: space-between;

    .usage-cost {
        @apply font-bold;
        font-size: 1.125rem;
        line-height: 155%;
    }
    .spent {
        @apply text-gray-600 font-normal;
        font-size: 0.875rem;
        line-height: 150%;
    }
    .limit-cost {
        @apply text-gray-800;
        font-size: 0.875rem;
        line-height: 150%;
    }
}
.print-mode {
    .usage-cost {
        white-space: nowrap;
    }
    .limit-cost {
        white-space: nowrap;
    }
}
</style>
