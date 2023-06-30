<script lang="ts" setup>
import {
    computed,
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { red, yellow, indigo } from '@/styles/colors';

import type { BudgetUsageRange } from '@/services/cost-explorer/budget/type';

const USAGE_RANGE = Object.freeze({
    overspent: 'overspent',
    between90And100: 'between90And100',
    lessThan90: 'lessThan90',
} as const);
type UsageRange = typeof USAGE_RANGE[keyof typeof USAGE_RANGE];

type SelectedMap = Partial<Record<UsageRange, boolean>>;

const { t } = useI18n();
const emit = defineEmits<{(e: 'update', value: BudgetUsageRange): void}>();

const state = reactive({
    items: computed(() => [
        { name: USAGE_RANGE.overspent, label: t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVERSPENT'), color: red[400] },
        { name: USAGE_RANGE.between90And100, label: '90-100%', color: yellow[500] },
        { name: USAGE_RANGE.lessThan90, label: '< 90%', color: indigo[500] },
    ]),
    selected: [USAGE_RANGE.overspent, USAGE_RANGE.between90And100, USAGE_RANGE.lessThan90] as UsageRange[],
    selectedMap: computed<SelectedMap>(() => {
        const selectedMap: SelectedMap = {};
        state.selected.forEach((d) => { selectedMap[d] = true; });
        return selectedMap;
    }),
    range: computed<BudgetUsageRange>(() => {
        /*
                [] max: -1

                [overspent, 90-100, <90] none

                [90-100, <90] max: 100
                [overspent, 90-100] min: 90
                [overspent, <90] max: 90, min: 100, condition: or

                [<90] max: 90
                [90-100] min: 90, max: 100
                [overspent] min:100
                 */

        if (state.selected.length === 0) return { max: -1 };

        const range: BudgetUsageRange = {};

        if (state.selected.length === 3) return range;

        const selectedMap = state.selectedMap;

        if (state.selected.length === 2) {
            if (selectedMap[USAGE_RANGE.between90And100] && selectedMap[USAGE_RANGE.lessThan90]) return { max: 100 };
            if (selectedMap[USAGE_RANGE.overspent] && selectedMap[USAGE_RANGE.between90And100]) return { min: 90 };
            return { max: 90, min: 100, condition: 'or' };
        }

        if (selectedMap[USAGE_RANGE.lessThan90]) return { max: 90 };
        if (selectedMap[USAGE_RANGE.between90And100]) return { min: 90, max: 100 };
        if (selectedMap[USAGE_RANGE.overspent]) return { min: 100 };

        return range;
    }),
});

const handleClick = (name: UsageRange) => {
    const index = state.selected.findIndex((d) => d === name);
    if (index !== -1) state.selected.splice(index, 1);
    else state.selected.push(name);
    emit('update', state.range);
};

</script>

<template>
    <div class="budget-toolbox-usage-range">
        <div v-for="({name, label, color}) in state.items"
             :key="name"
             class="range"
             :class="{disabled: !selectedMap[name]}"
             @click="handleClick(name)"
        >
            <span class="mark"
                  :style="{color}"
            />
            <span class="label">{{ label }}</span>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.budget-toolbox-usage-range {
    display: inline-flex;
    flex-wrap: wrap;
    .range {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        height: 1.3125rem;
        margin-right: 1rem;
        cursor: pointer;
        .mark {
            @apply rounded-xs;
            width: 0.625rem;
            height: 0.625rem;
            margin-right: 0.25rem;
            background-color: currentColor;
        }
        .label {
            @apply text-gray-700;
            font-size: 0.875rem;
        }

        &.disabled {
            .mark {
                @apply bg-gray-300;
            }
            .label {
                @apply text-gray-300;
            }
        }
    }
}
</style>
