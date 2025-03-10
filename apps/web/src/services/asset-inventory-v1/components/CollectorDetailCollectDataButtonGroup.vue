<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    reactive, defineEmits, computed, watch,
} from 'vue';

import {
    PButton, PPopover, PIconButton, screens,
} from '@cloudforet/mirinae';


import type { JobModel } from '@/schema/inventory/job/model';

import CollectorCurrentStatus from '@/services/asset-inventory-v1/components/CollectorCurrentStatus.vue';
import { useCollectorJobStore } from '@/services/asset-inventory-v1/stores/collector-job-store';


const emit = defineEmits<{(e: 'collect'): void;
}>();

const collectorJobStore = useCollectorJobStore();

const { width } = useWindowSize();

const state = reactive({
    isPopoverOpen: false,
    recentJob: computed<JobModel|null>(() => collectorJobStore.recentJobForAllAccounts),
    showStatus: computed(() => width.value > screens.mobile.max),
});
const handleClickCollectDataButton = () => {
    emit('collect');
};
const handleUpdatePopoverVisible = (visible: boolean) => {
    state.isPopoverOpen = visible;
};
watch(() => state.recentJob, (recentJob, prevJob) => {
    if (recentJob?.status === 'IN_PROGRESS') {
        if (prevJob && recentJob.job_id === prevJob.job_id && recentJob.status === prevJob.status) return;
        state.isPopoverOpen = true;
    }
}, { immediate: true });

</script>

<template>
    <div class="collect-data-button-group">
        <p-button style-type="tertiary"
                  size="md"
                  icon-left="ic_collect"
                  class="collect-data-button"
                  :class="{dependent: state.showStatus}"
                  @click="handleClickCollectDataButton"
        >
            {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECT_DATA') }}
        </p-button>
        <p-popover v-if="state.showStatus"
                   :is-visible="state.isPopoverOpen"
                   ignore-outside-click
                   @update:is-visible="handleUpdatePopoverVisible"
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
                        :hours="collectorJobStore.schedule?.hours"
                        :recent-job="state.recentJob"
                        :is-schedule-activated="collectorJobStore.schedule?.state === 'ENABLED'"
                        :is-popover-mode="true"
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
    .collect-status-wrapper {
        min-height: 68px;
        min-width: 250px;
    }
}
</style>
