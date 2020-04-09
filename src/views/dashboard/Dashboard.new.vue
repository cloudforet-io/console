<template>
    <div class="dashboard grid gap-4 m-4 grid-flow-row grid-cols-12">
        <service-summary class="col-start-1 col-end-5 lg:col-end-4"
                         title="projects" :loading="projects.loading" :data="projects.data"
                         :color="projects.color"
        />
        <service-summary class="col-start-5 col-end-9 lg:col-start-4 lg:col-end-7"
                         title="servers" :loading="servers.loading" :data="servers.data"
                         :color="servers.color"
        />
        <service-summary class="col-start-9 col-end-13 lg:col-start-7 lg:col-end-10"
                         title="cloud services" :loading="cloudServices.loading" :data="cloudServices.data"
                         :color="cloudServices.color"
        />
        <service-accounts class="col-start-1 col-end-7 lg:col-end-4" />
        <daily-updates class="col-start-7 col-end-13 lg:col-start-10
                              row-start-2 row-end-3 lg:row-start-1"
        />
        <top-projects class="col-start-1 col-end-13 lg:col-start-4 lg:col-end-10
                             lg:row-start-2"
        />
        <collection-state class="col-start-1 col-end-13 lg:col-end-7" />
        <collecting-jobs class="col-start-1 col-end-13 lg:col-start-7" />
        <cloud-services class="col-start-1 col-end-13" />
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
import { primary, secondary, secondary1 } from '@/styles/colors';

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
                color: primary,
            },
            servers: {
                data: [],
                loading: true,
                color: secondary,
            },
            cloudServices: {
                data: [],
                loading: true,
                color: secondary1,
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

<style lang="postcss">
    @media (max-width: 477px) {
        html, body {
            font-size: 12px;
        }
    }

    @media (min-width: 478px) and (max-width: 676px) {
        html, body {
            font-size: 14px;
        }
    }

    @media (min-width: 768px) {
        html, body {
            font-size: 16px;
        }
    }

</style>
