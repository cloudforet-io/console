<script setup lang="ts">
import {
    reactive, onActivated,
} from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHorizontalLayout, PHeading,
} from '@cloudforet/mirinae';

import type { JobTaskModel } from '@/schema/inventory/job-task/model';
import type { JobModel } from '@/schema/inventory/job/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import JobBasicInformation from '@/services/asset-inventory/components/CollectorHistoryJobBasicInformation.vue';
import JobStatusChart from '@/services/asset-inventory/components/CollectorHistoryJobStatusChart.vue';
import JobTaskDetails from '@/services/asset-inventory/components/CollectorHistoryJobTaskDetails.vue';
import JobTable from '@/services/asset-inventory/components/CollectorHistoryJobTaskTable.vue';


interface Props {
    jobId: string;
}

const props = withDefaults(defineProps<Props>(), {
    jobId: '',
});

const state = reactive({
    job: {} as JobModel,
    selectedItem: null as null|JobTaskModel,
});

/* API */
const apiQuery = new ApiQueryHelper();
const getJob = async () => {
    try {
        apiQuery.setFilters([{ k: 'job_id', v: props.jobId, o: '=' }]);
        const { results } = await SpaceConnector.clientV2.inventory.job.list({
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

</script>

<template>
    <div>
        <p-heading class="mb-6"
                   :title="props.jobId"
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
