<script setup lang="ts">
import {
    reactive, onActivated,
} from 'vue';

import {
    PHorizontalLayout, PHeading,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import JobBasicInformation from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobBasicInformation.vue';
import JobStatusChart from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobStatusChart.vue';
import JobTaskDetails from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskDetails.vue';
import JobTable from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskTable.vue';
import type { JobTaskData } from '@/services/asset-inventory/collector/collector-history/collect-job/type';
import type { JobModel } from '@/services/asset-inventory/collector/model';

interface Props {
    jobId: string;
}

const props = withDefaults(defineProps<Props>(), {
    jobId: '',
});

const state = reactive({
    job: {} as JobModel,
    selectedItem: null as null|JobTaskData,
});

/* API */
const apiQuery = new ApiQueryHelper();
const getJob = async () => {
    try {
        apiQuery.setFilters([{ k: 'job_id', v: props.jobId, o: '=' }]);
        const { results } = await SpaceConnector.client.inventory.job.list({
            query: apiQuery.data,
        });
        state.job = results[0] || {};
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Init */
onActivated(() => {
    state.selectedItem = null;
    getJob();
});

// reference store
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/collector/load'),
        store.dispatch('reference/plugin/load'),
    ]);
})();
</script>

<template>
    <div>
        <p-heading :title="props.jobId"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <div class="top-wrapper">
            <job-status-chart :job="state.job" />
            <job-basic-information :job="state.job" />
        </div>
        <p-horizontal-layout class="job-tasks-wrapper"
                             :min-height="350"
        >
            <template #container="{ height }">
                <job-table :style="{height: `${height}px`}"
                           :job-id="props.jobId"
                           @select="state.selectedItem = $event"
                />
            </template>
        </p-horizontal-layout>
        <job-task-details v-if="state.selectedItem"
                          :selected-item="state.selectedItem"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-horizontal-layout */
:deep(.p-horizontal-layout) .horizontal-contents {
    overflow: unset;
}

.top-wrapper {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(352px, 1fr));
    margin-bottom: 1rem;
}

@screen tablet {
    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) .p-data-table {
        min-height: unset;
    }
}
</style>
