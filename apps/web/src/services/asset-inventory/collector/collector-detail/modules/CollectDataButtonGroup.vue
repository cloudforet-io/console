<script setup lang="ts">
import {
    reactive, defineEmits, computed,
} from 'vue';

import { PButton, PPopover, PIconButton } from '@spaceone/design-system';

import { useCollectorJobStore } from '@/services/asset-inventory/collector/collector-detail/collector-job-store';
import type { JobModel } from '@/services/asset-inventory/collector/model';
import CollectorCurrentStatus from '@/services/asset-inventory/collector/shared/CollectorCurrentStatus.vue';

const emit = defineEmits<{(e: 'collect'): void;
}>();

const collectorJobStore = useCollectorJobStore();

const state = reactive({
    isPopoverOpen: false,
    showStatus: computed(() => collectorJobStore.isRecentJobLoaded),
    recentJob: computed<JobModel|null>(() => collectorJobStore.recentJob),
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
                <div class="collect-status-wrapper">
                    <collector-current-status
                        :schedule="collectorJobStore.schedule"
                        :recent-job="state.recentJob"
                    />
                </div>
            </template>
        </p-popover>
    </div>
</template>

<style scoped lang="postcss">
.collect-data-button-group {
    display: flex;
    flex-wrap: wrap;
    .collect-data-button {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    .status-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: 0;
    }
    .collect-status-wrapper {
        min-height: 68px;
        min-width: 250px;
    }
}
</style>
