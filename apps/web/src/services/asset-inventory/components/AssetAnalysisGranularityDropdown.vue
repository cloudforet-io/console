<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { GRANULARITY } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { getInitialPeriodByGranularity } from '@/services/asset-inventory/helpers/asset-analysis-period-helper';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';
import type { Granularity } from '@/services/asset-inventory/types/asset-analysis-type';


const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const state = reactive({
    granularityItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: GRANULARITY.DAILY,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.DAILY'),
        },
        {
            type: 'item',
            name: GRANULARITY.MONTHLY,
            label: i18n.t('INVENTORY.METRIC_EXPLORER.MONTHLY'),
        },
    ])),
    granularity: GRANULARITY.MONTHLY as Granularity|undefined,
});

/* event */
const handleSelectGranularity = async (granularity: Granularity) => {
    assetAnalysisPageStore.setGranularity(granularity);
    // set period
    const [_period, _relativePeriod] = getInitialPeriodByGranularity(granularity);
    assetAnalysisPageStore.setPeriod(_period);
    assetAnalysisPageStore.setRelativePeriod(_relativePeriod);
    assetAnalysisPageStore.setRefreshMetricPeriodDropdown(true);
};
</script>

<template>
    <div class="asset-analysis-granularity-dropdown">
        <p-select-dropdown :menu="state.granularityItems"
                           :selection-label="$t('INVENTORY.METRIC_EXPLORER.GRANULARITY')"
                           style-type="rounded"
                           :selected="assetAnalysisPageState.granularity"
                           class="granularity-dropdown"
                           reset-selection-on-menu-close
                           @select="handleSelectGranularity"
        />
    </div>
</template>

<style lang="postcss" scoped>
.asset-analysis-granularity-dropdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .granularity-dropdown {
        min-width: unset;
    }
}

</style>
