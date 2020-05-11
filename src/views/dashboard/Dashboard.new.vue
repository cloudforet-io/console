<template>
    <div class="bg-primary-dark grid gap-4 p-4 grid-flow-row grid-cols-12">
        <service-summary class="col-start-1 col-end-13
                                sm:col-end-5
                                lg:col-end-4"
                         v-bind="projects.state"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-5 sm:col-end-9
                                lg:col-start-4 lg:col-end-7"
                         v-bind="servers.state"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-9
                                lg:col-start-7 lg:col-end-10"
                         v-bind="cloudServices.state"
        />
        <service-accounts class="col-start-1 col-end-13 sm:col-end-7 lg:col-end-4
                                 row-start-5 row-end-6 sm:row-start-2 sm:row-end-3"
        />
        <daily-updates class="col-start-1 sm:col-start-7 lg:col-start-10 col-end-13
                              row-start-4 row-end-5 sm:row-start-2 sm:row-end-3 lg:row-start-1
                              daily-updates"
                       :get-server-action="topics.server"
                       :get-cloud-service-action="topics.cloudService"
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
import { Stat } from '@/lib/fluent-api/statistics/resource';
import { ServiceSummaryWidgetState, Value } from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import { HistoryDiff } from '@/lib/fluent-api/statistics/history';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';

export default {
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
        const projects = new ServiceSummaryWidgetState({
            title: 'projects',
            to: '/project',
            color: blue[600],
            getAction: api => api.setResourceType('identity.Project'),
            getTrendAction: api => api.setTopic('daily_project_count')
                .addGroupField('count', STAT_OPERATORS.sum, 'values.project_count'),
        });

        const servers = new ServiceSummaryWidgetState({
            title: 'servers',
            to: '/inventory/server',
            color: secondary,
            getAction: api => api.setResourceType('inventory.Server'),
            getTrendAction: api => api.setTopic('daily_server_count')
                .addGroupField('count', STAT_OPERATORS.sum, 'values.server_count'),
        });

        const cloudServices = new ServiceSummaryWidgetState({
            title: 'cloud services',
            to: '/inventory/cloud-service',
            color: secondary1,
            getAction: api => api.setResourceType('inventory.CloudService'),
            getTrendAction: api => api.setTopic('daily_cloud_service_count')
                .addGroupField('count', STAT_OPERATORS.sum, 'values.cloud_service_count'),
        });

        const topics = ({
            server: api => api.setTopic('daily_server_updates'),
            cloudService: api => api.setTopic('daily_cloud_service_updates'),
        });

        return {
            projects,
            servers,
            cloudServices,
            topics,
        };
    },
};
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
