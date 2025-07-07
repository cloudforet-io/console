<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    reactive, defineEmits, computed, watch,
} from 'vue';

import dayjs from 'dayjs';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PPopover, PIconButton, screens,
} from '@cloudforet/mirinae';

import type { JobModel } from '@/api-clients/inventory/job/schema/model';

import CollectorCurrentStatus from '@/services/asset-inventory/components/CollectorCurrentStatus.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useInventoryJobListQuery } from '@/services/asset-inventory/composables/use-inventory-job-list-query';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';


const emit = defineEmits<{(e: 'collect'): void;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;

const { width } = useWindowSize();

const state = reactive({
    isPopoverOpen: false,
});
const recentJob = computed<JobModel|undefined>(() => {
    if (!collectorFormState.collectorId) return undefined;
    return recentJobsData.value?.results?.[0];
});
const showStatus = computed(() => width.value > screens.mobile.max);
const schedule = computed(() => originCollectorData.value?.schedule);

/* Query */
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
});
const fiveDaysAgo = dayjs.utc().subtract(5, 'day').startOf('day').toISOString();
const recentJobsQueryHelper = new ApiQueryHelper();
const { data: recentJobsData } = useInventoryJobListQuery({
    params: computed(() => {
        recentJobsQueryHelper.setFilters([
            { k: 'collector_id', v: collectorFormState.collectorId ?? '', o: '=' },
            { k: 'created_at', v: fiveDaysAgo, o: '>' },
        ]);
        return {
            query: recentJobsQueryHelper.data,
        };
    }),
});

/* Event Handlers */
const handleClickCollectDataButton = () => {
    emit('collect');
};
const handleUpdatePopoverVisible = (visible: boolean) => {
    state.isPopoverOpen = visible;
};

/* Watchers */
watch(() => recentJob.value, (_recentJob, prevJob) => {
    if (_recentJob?.status === 'IN_PROGRESS') {
        if (prevJob && _recentJob?.job_id === prevJob.job_id && _recentJob?.status === prevJob.status) return;
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
                  :class="{dependent: showStatus}"
                  @click="handleClickCollectDataButton"
        >
            {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECT_DATA') }}
        </p-button>
        <p-popover v-if="showStatus"
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
                        :hours="schedule?.hours"
                        :collector-id="collectorFormState.collectorId"
                        :is-schedule-activated="schedule?.state === 'ENABLED'"
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
