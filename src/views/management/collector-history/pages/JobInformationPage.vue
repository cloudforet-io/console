<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="jobId" child @goBack="$router.go(-1)" />
        <div class="top-wrapper">
            <job-status-chart />
            <job-basic-information :job-id="jobId" />
        </div>
        <p-horizontal-layout class="job-tasks-wrapper">
            <template #container="{ height }">
                <job-table :style="{height: `${height}px`}"
                           :job-id="jobId"
                           @select="selectedItem = $event"
                />
            </template>
        </p-horizontal-layout>
        <job-task-details v-if="selectedItem" :selected-item="selectedItem" />
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
    getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PPageTitle, PBreadcrumbs,
} from '@spaceone/design-system';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import JobStatusChart from '@/views/management/collector-history/modules/JobStatusChart.vue';
import JobBasicInformation from '@/views/management/collector-history/modules/JobBasicInformation.vue';
import JobTable from '@/views/management/collector-history/modules/JobTaskTable.vue';
import JobTaskDetails from '@/views/management/collector-history/modules/JobTaskDetails.vue';
import { store } from '@/store';


export default {
    name: 'CollectorHistoryJob',
    components: {
        JobTaskDetails,
        JobTable,
        JobBasicInformation,
        JobStatusChart,
        GeneralPageLayout,
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
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            selectedItem: null as null|any,
        });

        const routeState = reactive({
            routes: computed(() => [
                { name: vm.$t('MENU.MANAGEMENT.MANAGEMENT'), path: '/management/collector-history' },
                { name: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY'), path: '/management/collector-history' },
                { name: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY_JOB_MANAGEMENT') },
            ]),
        });

        /* Init */
        (() => {
            Promise.all([store.dispatch('resource/project/load'),
                store.dispatch('resource/serviceAccount/load'),
                store.dispatch('resource/plugin/load'),
                store.dispatch('resource/collector/load')]);
        })();


        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.top-wrapper {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(352px, 1fr));
    margin-bottom: 1rem;
}
</style>
