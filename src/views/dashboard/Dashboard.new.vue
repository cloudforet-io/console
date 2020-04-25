<template>
    <div class="bg-primary-dark grid gap-4 p-4 grid-flow-row grid-cols-12">
        <service-summary class="col-start-1 col-end-13
                                sm:col-end-5
                                lg:col-end-4"
                         title="projects"
                         resourceType="identity.Project"
                         :color="projects.color"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-5 sm:col-end-9
                                lg:col-start-4 lg:col-end-7"
                         title="servers"
                         resourceType="inventory.Server"
                         :color="servers.color"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-9
                                lg:col-start-7 lg:col-end-10"
                         title="cloud services"
                         resourceType="inventory.CloudService"
                         :color="cloudServices.color"
        />
        <service-accounts class="col-start-1 col-end-13 sm:col-end-7 lg:col-end-4
                                 row-start-5 row-end-6 sm:row-start-2 sm:row-end-3"
                          :title="'SERVICE ACCOUNTS'"
        />
        <daily-updates class="col-start-1 sm:col-start-7 lg:col-start-10 col-end-13
                              row-start-4 row-end-5 sm:row-start-2 sm:row-end-3 lg:row-start-1
                              daily-updates"
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
import { blue, secondary, secondary1 } from '@/styles/colors';
import { fluentApi } from '@/lib/fluent-api';

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
                color: blue[600],
                // api: fluentApi.statisticsTest().history().query().setTopic('topic'),
            },
            servers: {
                color: secondary,
                // api: fluentApi.statisticsTest().history().query().setTopic('topic'),
            },
            cloudServices: {
                color: secondary1,
                // api: fluentApi.statisticsTest().history().query().setTopic('topic'),
            },
        });

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

<style lang="postcss" scoped>
    .daily-updates {
        height: 33.75rem;
    }

    @screen lg {
        .daily-updates {
            height: 48rem;
        }
    }
</style>
