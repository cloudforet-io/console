<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="jobId" child @goBack="$router.go(-1)" />
        <div class="top-wrapper">
            <job-status-chart />
            <job-basic-information />
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
/* eslint-disable camelcase */

import {
    computed, reactive, toRefs,
    getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PPageTitle, PBreadcrumbs,
} from '@spaceone/design-system';

import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';

import { TimeStamp } from '@/models';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import JobStatusChart from '@/views/management/collector-history/modules/JobStatusChart.vue';
import JobBasicInformation from '@/views/management/collector-history/modules/JobBasicInformation.vue';
import JobTable from '@/views/management/collector-history/modules/JobTaskTable.vue';
import { JOB_STATUS } from '@/views/management/collector-history/pages/config';
import JobTaskDetails from '@/views/management/collector-history/modules/JobTaskDetails.vue';
import router from '@/routes';


interface JobModel {
    job_id: string;
    state: JOB_STATUS;
    collect_mode: COLLECT_MODE;
    collector_info: CollectorModel;
    secret_id: string;
    filter: any;
    errors: {
        code: string;
        message: string;
        secret_id?: string;
    }[];
    created_at: TimeStamp;
    finished_at: TimeStamp;
}

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
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 1rem;
}
</style>
