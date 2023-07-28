<script setup lang="ts">
import {
    reactive, defineEmits, computed,
} from 'vue';

import { PButton, PPopover, PIconButton } from '@spaceone/design-system';

import { useCollectorJobStore } from '@/services/asset-inventory/collector/collector-detail/collector-job-store';

const emit = defineEmits<{(e: 'collect'): void;
}>();

const collectorJobStore = useCollectorJobStore();
const collectorJobState = collectorJobStore.$state;

const state = reactive({
    isPopoverOpen: false,
    showStatus: computed(() => !!collectorJobState.recentJob),
});
const handleClickCollectDataButton = () => {
    emit('collect');
};
</script>

<template>
    <div class="collect-data-button-group">
        <p-button style-type="tertiary"
                  size="md"
                  icon-left="ic_collect"
                  class="collect-data-button"
                  :class="{'dependent': state.showStatus}"
                  @click="handleClickCollectDataButton"
        >
            {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECT_DATA') }}
        </p-button>
        <p-popover v-if="state.showStatus"
                   :is-visible.sync="state.isPopoverOpen"
        >
            <p-icon-button :name="state.isPopoverOpen ? 'ic_chevron-up' : 'ic_chevron-down'"
                           style-type="tertiary"
                           shape="square"
                           size="md"
                           color="inherit"
                           class="status-button"
            />
            <template #content>
                <!-- TODO: Implement status UI -->
                <div>Current Status</div>
            </template>
        </p-popover>
    </div>
</template>

<style scoped lang="postcss">
.collect-data-button-group {
    display: flex;
    flex-wrap: wrap;
    .collect-data-button {
        &.dependent {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    }
    .status-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: 0;
    }
}
</style>
