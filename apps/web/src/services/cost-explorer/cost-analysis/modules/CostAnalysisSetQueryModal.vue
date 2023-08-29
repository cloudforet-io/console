<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';


interface Props {
    visible: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    granularity: '' as Granularity,
    granularityItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: GRANULARITY.DAILY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY'),
        },
        {
            type: 'item',
            name: GRANULARITY.MONTHLY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY'),
        },
        {
            type: 'item',
            name: GRANULARITY.YEARLY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.YEARLY'),
        },
    ])),
});

const handleFormConfirm = async () => {
    if (costAnalysisPageState.granularity !== state.granularity) {
        costAnalysisPageStore.$patch((_state) => {
            _state.period = getInitialDates();
        });
    }
    costAnalysisPageStore.$patch({
        granularity: state.granularity,
    });
    state.proxyVisible = false;
};
const handleSelectGranularity = (granularity: Granularity) => {
    state.granularity = granularity;
};

watch(() => state.proxyVisible, (after) => {
    if (after) {
        state.granularity = costAnalysisPageState.granularity;
    }
});
</script>

<template>
    <p-button-modal
        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SET_QUERY')"
        :visible.sync="state.proxyVisible"
        size="sm"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <div class="set-query-modal-body">
                <div class="input-wrapper">
                    <p class="input-title">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY') }}
                    </p>
                    <p-select-dropdown
                        class="select-input-box"
                        use-fixed-menu-style
                        :items="state.granularityItems"
                        :selected="granularity"
                        @select="handleSelectGranularity"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.set-query-modal-body {
    margin-bottom: 2rem;
    .input-wrapper {
        .input-title {
            @apply font-bold;
            margin-top: 1rem;
            margin-bottom: 0.375rem;
            font-size: 0.875rem;
            line-height: 140%;
        }
        .select-input-box {
            width: 100%;
        }
    }
}
</style>
