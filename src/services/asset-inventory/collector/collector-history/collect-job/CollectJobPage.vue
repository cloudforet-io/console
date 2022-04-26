<template>
    <div>
        <p-breadcrumbs :routes="routeState.routes" copiable />
        <p-page-title :title="jobId" child @goBack="$router.go(-1)" />
        <div class="top-wrapper">
            <job-status-chart :job-id="jobId" />
            <job-basic-information :job-id="jobId" />
        </div>
        <p-horizontal-layout class="job-tasks-wrapper" :min-height="350">
            <template #container="{ height }">
                <job-table :style="{height: `${height}px`}"
                           :job-id="jobId"
                           @select="selectedItem = $event"
                />
            </template>
        </p-horizontal-layout>
        <job-task-details v-if="selectedItem" :selected-item="selectedItem" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, onActivated, computed,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PPageTitle, PBreadcrumbs,
} from '@spaceone/design-system';

import JobStatusChart from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobStatusChart.vue';
import JobBasicInformation from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobBasicInformation.vue';
import JobTable from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskTable.vue';
import JobTaskDetails from '@/services/asset-inventory/collector/collector-history/collect-job/modules/JobTaskDetails.vue';
import { JobTaskData } from '@/services/asset-inventory/collector/collector-history/collect-job/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';


export default {
    name: 'CollectorJobPage',
    components: {
        JobTaskDetails,
        JobTable,
        JobBasicInformation,
        JobStatusChart,
        PPageTitle,
        PBreadcrumbs,
        PHorizontalLayout,
    },
    props: {
        jobId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const state = reactive({
            selectedItem: null as null|JobTaskData,
        });

        const routeState = reactive({
            routes: computed(() => [
                { name: 'Asset Inventory', to: { name: ASSET_INVENTORY_ROUTE._NAME } },
                { name: 'Collector', to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME } },
                { name: 'History', to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME } },
                { name: props.jobId },
            ]),
        });

        onActivated(() => {
            state.selectedItem = null;
        });

        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
>>> .p-horizontal-layout .horizontal-contents {
    overflow: unset;
}

.top-wrapper {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(352px, 1fr));
    margin-bottom: 1rem;
}

@screen mobile {
    >>> .p-toolbox-table .p-data-table {
        min-height: unset;
    }
}

@screen tablet {
    >>> .p-toolbox-table .p-data-table {
        min-height: unset;
    }
}
</style>
