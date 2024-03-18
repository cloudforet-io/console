<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { OPERATOR } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type { Operator } from '@/services/asset-inventory/types/metric-explorer-type';


const state = reactive({
    operatorItems: computed<MenuItem[]>(() => ([
        { type: 'item', name: OPERATOR.SUM, label: 'Sum' },
        { type: 'item', name: OPERATOR.AVG, label: 'Average' },
        { type: 'item', name: OPERATOR.MAX, label: 'Max' },
        { type: 'item', name: OPERATOR.MIN, label: 'Min' },
    ])),
    operator: OPERATOR.SUM as Operator|undefined,
});

/* Event */
const handleSelectOperator = async (operator: Operator) => {
    state.operator = operator;
};
</script>

<template>
    <div class="metric-explorer-operator-dropdown">
        <p-select-dropdown :menu="state.operatorItems"
                           :selection-label="$t('INVENTORY.METRIC_EXPLORER.OPERATOR')"
                           style-type="rounded"
                           :selected="state.operator"
                           class="operator-dropdown"
                           @select="handleSelectOperator"
        />
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-operator-dropdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .operator-dropdown {
        min-width: unset;
    }
}

</style>
