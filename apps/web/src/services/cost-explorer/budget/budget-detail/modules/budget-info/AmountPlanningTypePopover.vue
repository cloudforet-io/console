<script lang="ts" setup>

import { PPopover } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { computed, reactive } from 'vue';
import { useStore } from 'vuex';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import type { BudgetData } from '@/services/cost-explorer/budget/type';
import { BUDGET_TIME_UNIT } from '@/services/cost-explorer/budget/type';

interface Props {
    budgetData: BudgetData;
}

withDefaults(defineProps<Props>(), {
    budgetData: () => ({}) as BudgetData,
});

const store = useStore();

const state = reactive({
    currency: computed(() => store.state.settings.currency),
    currencyRates: computed(() => store.state.settings.currencyRates),
});
const dateFormatter = (date: string) => dayjs(date).format('MMMM YYYY');

</script>

<template>
    <p-popover class="amount-planning-type-popover"
               position="bottom-end"
    >
        <slot />
        <template #content>
            <div v-if="budgetData.time_unit === BUDGET_TIME_UNIT.TOTAL"
                 class="total-wrapper"
            >
                <p class="total-data">
                    {{ currencyMoneyFormatter(budgetData.limit, state.currency, state.currencyRates, false, 1000000000) }}
                </p>
            </div>
            <template v-else>
                <div class="monthly-wrapper">
                    <p v-for="{ date, limit } in budgetData.planned_limits"
                       :key="date"
                       class="monthly-data"
                    >
                        <span>
                            <span class="date">
                                {{ dateFormatter(date) }}
                            </span>
                            <br>
                            <span>{{ currencyMoneyFormatter(limit, state.currency, state.currencyRates, false, 1000000000) }}</span>
                        </span>
                    </p>
                </div>
            </template>
        </template>
    </p-popover>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-popover */
.amount-planning-type-popover {
    z-index: 99;
    overflow-y: unset;
}
.total-wrapper {
    @apply flex items-center bg-gray-100;
    min-width: 10.5rem;
    min-height: 2.625rem;
    padding-left: 0.75rem;
}
.monthly-wrapper {
    @apply grid;
    grid-template-columns: repeat(3, 144px);
    grid-template-rows: auto;

    .monthly-data {
        @apply flex items-center;
        height: 4rem;
        line-height: 125%;
        font-size: 0.875rem;
        padding-left: 0.75rem;
        .date {
            @apply font-bold;
            font-size: 0.75rem;
        }
    }

    @screen mobile {
        grid-template-columns: repeat(2, 144px);
    }
}

.monthly-wrapper > p:nth-child(6n+1), .monthly-wrapper > p:nth-child(6n+2),
.monthly-wrapper > p:nth-child(6n+3) {
    @apply bg-gray-100;
}

@screen mobile {
    .monthly-wrapper > p:nth-child(6n+1), .monthly-wrapper > p:nth-child(6n+2), .monthly-wrapper > p:nth-child(6n+3) {
        @apply bg-white;
    }
    .monthly-wrapper > p:nth-child(4n+1), .monthly-wrapper > p:nth-child(4n+2) {
        @apply bg-gray-100;
    }
}
</style>
