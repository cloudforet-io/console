<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { OPERATOR } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';
import type { Operator } from '@/services/asset-inventory/types/asset-analysis-type';


const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const state = reactive({
    operatorItems: computed<MenuItem[]>(() => ([
        { type: 'item', name: OPERATOR.SUM, label: 'Sum' },
        { type: 'item', name: OPERATOR.AVG, label: 'Average' },
        { type: 'item', name: OPERATOR.MAX, label: 'Max' },
        { type: 'item', name: OPERATOR.MIN, label: 'Min' },
    ])),
});

/* Event */
const handleSelectOperator = async (operator: Operator) => {
    assetAnalysisPageStore.setSelectedOperator(operator);
};
</script>

<template>
    <div class="asset-analysis-operator-dropdown">
        <p-select-dropdown :menu="state.operatorItems"
                           :selection-label="$t('INVENTORY.ASSET_ANALYSIS.OPERATOR')"
                           style-type="rounded"
                           :selected="assetAnalysisPageState.selectedOperator"
                           class="operator-dropdown"
                           @select="handleSelectOperator"
        />
    </div>
</template>

<style lang="postcss" scoped>
.asset-analysis-operator-dropdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .operator-dropdown {
        min-width: unset;
    }
}

</style>
