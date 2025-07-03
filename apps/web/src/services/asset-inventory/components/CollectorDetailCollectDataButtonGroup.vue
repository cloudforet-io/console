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
import { useInventoryJobListQuery } from '@/services/asset-inventory/composables/use-inventory-job-list-query';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';


const emit = defineEmits<{(e: 'collect'): void;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;

const { width } = useWindowSize();

const state = reactive({
    isPopoverOpen: false,
    showStatus: computed(() => width.value > screens.mobile.max),
    recentJobWithNoSecret: computed<JobModel|null>(() => {
        if (Array.isArray(recentJobsData.value?.results) && recentJobsData.value.results.length > 0) {
            const filteredJobs = recentJobsData.value.results.filter((job) => !job.secret_id);
            return filteredJobs[0] ?? null;
        }
        return null;
    }),
});

/* Query */
const fiveDaysAgo = dayjs.utc().subtract(5, 'day').toISOString();
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

const handleClickCollectDataButton = () => {
    emit('collect');
};
const handleUpdatePopoverVisible = (visible: boolean) => {
    state.isPopoverOpen = visible;
};
watch(() => state.recentJobWithNoSecret, (recentJob, prevJob) => {
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
                        :recent-job="state.recentJobWithNoSecret"
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
