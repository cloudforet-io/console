<script setup lang="ts">
import {
    reactive, onActivated, computed,
} from 'vue';

import {
    PHorizontalLayout, PHeading,
} from '@cloudforet/mirinae';

import type { JobTaskModel } from '@/api-clients/inventory/job-task/schema/model';

import JobBasicInformation from '@/services/asset-inventory/components/CollectorHistoryJobBasicInformation.vue';
import JobStatusChart from '@/services/asset-inventory/components/CollectorHistoryJobStatusChart.vue';
import JobTaskDetails from '@/services/asset-inventory/components/CollectorHistoryJobTaskDetails.vue';
import JobTable from '@/services/asset-inventory/components/CollectorHistoryJobTaskTable.vue';
import { useInventoryJobGetQuery } from '@/services/asset-inventory/composables/use-inventory-job-get-query';


interface Props {
    jobId: string;
}

const props = withDefaults(defineProps<Props>(), {
    jobId: '',
});

const state = reactive({
    selectedItem: null as null|JobTaskModel,
});

/* Query */
const { data: jobData } = useInventoryJobGetQuery(computed(() => props.jobId));

/* Init */
onActivated(() => {
    state.selectedItem = null;
});
</script>

<template>
    <div>
        <p-heading class="mb-6"
                   :title="props.jobId"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <div v-if="jobData"
             class="top-wrapper"
        >
            <job-status-chart :job="jobData" />
            <job-basic-information :job="jobData" />
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
