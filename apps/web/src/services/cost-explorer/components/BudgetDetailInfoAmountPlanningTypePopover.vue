<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import { PPopover } from '@cloudforet/mirinae';

import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const state = reactive({
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
});
const dateFormatter = (date: string) => dayjs(date).format('MMMM YYYY');

</script>

<template>
    <p-popover class="budget-detail-info-amount-planning-type-popover"
               position="bottom-end"
    >
        <slot />
        <template #content>
            <div v-if="state.budgetData?.time_unit === 'TOTAL'"
                 class="total-wrapper"
            >
                <p class="total-data">
                    {{ currencyMoneyFormatter(state.budgetData?.limit, { currency: state.budgetData?.currency, notation: 'standard' }) }}
                </p>
            </div>
            <template v-else>
                <div class="monthly-wrapper">
                    <p v-for="{ date, limit } in state.budgetData?.planned_limits"
                       :key="date"
                       class="monthly-data"
                    >
                        <span>
                            <span class="date">
                                {{ dateFormatter(date) }}
                            </span>
                            <br>
                            <span>{{ currencyMoneyFormatter(limit, { currency: state.budgetData?.currency, notation: 'standard' }) }}</span>
                        </span>
                    </p>
                </div>
            </template>
        </template>
    </p-popover>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-popover */
.budget-detail-info-amount-planning-type-popover {
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
        --tw-bg-opacity: 1;
        background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
    }
    .monthly-wrapper > p:nth-child(4n+1), .monthly-wrapper > p:nth-child(4n+2) {
        --tw-bg-opacity: 1;
        background-color: rgb(247 247 247 / var(--tw-bg-opacity, 1));
    }
}
</style>
