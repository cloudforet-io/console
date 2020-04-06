<template>
    <div class="grid gap-2 m-2">
        <div class="grid grid-flow-col gap-2">
            <div class="grid grid-cols-1 gap-2">
                <div class="grid grid-cols-3 gap-2">
                    <service-summary title="projects" :loading="projects.loading" :data="projects.data" />
                    <service-summary title="servers" :loading="servers.loading" :data="servers.data" />
                    <service-summary title="cloud services" :loading="cloudServices.loading" :data="cloudServices.data" />
                </div>
                <div class="grid gap-2 custom-grid">
                    <service-accounts />
                    <top-projects />
                </div>
            </div>
            <daily-updates />
        </div>
        <div class="grid grid-cols-2">
            <collection-state class="collection-state" />
            <collecting-jobs class="collecting-jobs" />
        </div>
        <cloud-services />
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import CollectingJobs from '@/views/common/widgets/collecting-jobs/CollectingJobs.vue';
import CollectionState from '@/views/common/widgets/collection-state/CollectionState.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccounts from '@/views/common/widgets/service-accounts/ServiceAccounts.vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import TopProjects from '@/views/common/widgets/top-projects/TopProjects.vue';

export default defineComponent({
    name: 'Dashboard',
    components: {
        CloudServices,
        CollectingJobs,
        CollectionState,
        DailyUpdates,
        ServiceAccounts,
        ServiceSummary,
        TopProjects,
    },
    setup() {
        const state = reactive({
            projects: {
                data: [],
                loading: true,
            },
            servers: {
                data: [],
                loading: true,
            },
            cloudServices: {
                data: [],
                loading: true,
            },
        });

        const api = (): Promise<any> => new Promise((resolve) => {
            setTimeout(() => {
                resolve([0, 0, 200, 300, 500, 800, 1300]);
            }, 100);
        });

        const getData = async (type: string) => {
            state[type].loading = true;
            state[type].data = await api();
            state[type].loading = false;
        };

        getData('projects');
        getData('servers');
        getData('cloudServices');


        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.collection-state {
    border-right: 0;
}
.collecting-jobs {
    border-left: 0;
}
.custom-grid {
    grid-template-columns: 1fr 2fr;
}
</style>
