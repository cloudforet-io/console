<script lang="ts" setup>
import {
    PHorizontalLayout, PHeading,
} from '@spaceone/design-system';
import {
    reactive, onActivated,
} from 'vue';
import { useRouter } from 'vue-router';

import JobBasicInformation from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobBasicInformation.vue';
import JobStatusChart from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobStatusChart.vue';
import JobTaskDetails from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskDetails.vue';
import JobTable from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskTable.vue';
import type { JobTaskData } from '@/services/asset-inventory/collector/collector-history/collect-job/type';

interface Props {
    jobId: string;
}

defineProps<Props>();
const router = useRouter();

const state = reactive({
    selectedItem: null as null|JobTaskData,
});

const handleSelect = (item: JobTaskData) => {
    state.selectedItem = item;
};

onActivated(() => {
    state.selectedItem = null;
});

</script>

<template>
    <div>
        <p-heading :title="jobId"
                   show-back-button
                   @click-back-button="router.go(-1)"
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
                           @select="handleSelect"
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
