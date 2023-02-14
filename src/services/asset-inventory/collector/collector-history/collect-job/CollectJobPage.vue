<template>
    <div>
        <p-heading :title="jobId"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <div class="top-wrapper">
            <job-status-chart :job-id="jobId" />
            <job-basic-information :job-id="jobId" />
        </div>
        <p-horizontal-layout class="job-tasks-wrapper"
                             :min-height="350"
        >
            <template #container="{ height }">
                <job-table :style="{height: `${height}px`}"
                           :job-id="jobId"
                           @select="selectedItem = $event"
                />
            </template>
        </p-horizontal-layout>
        <job-task-details v-if="selectedItem"
                          :selected-item="selectedItem"
        />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, onActivated,
} from 'vue';

import {
    PHorizontalLayout, PHeading,
} from '@spaceone/design-system';

import JobBasicInformation from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobBasicInformation.vue';
import JobStatusChart from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobStatusChart.vue';
import JobTaskDetails from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskDetails.vue';
import JobTable from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskTable.vue';
import type { JobTaskData } from '@/services/asset-inventory/collector/collector-history/collect-job/type';

export default {
    name: 'CollectorJobPage',
    components: {
        JobTaskDetails,
        JobTable,
        JobBasicInformation,
        JobStatusChart,
        PHeading,
        PHorizontalLayout,
    },
    props: {
        jobId: {
            type: String,
            required: true,
        },
    },
    setup() {
        const state = reactive({
            selectedItem: null as null|JobTaskData,
        });

        onActivated(() => {
            state.selectedItem = null;
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

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
