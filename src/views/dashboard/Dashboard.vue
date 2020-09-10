<template>
    <general-page-layout class="dashboard">
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
                              daily-updates" />
        <top-projects class="col-start-1 col-end-13 lg:col-start-4 lg:col-end-10
                             lg:row-start-2"
        />
        <collectors class="col-start-1 col-end-13" />
        <cloud-services class="col-start-1 col-end-13"
                        :more-info="true"
                        :get-action="cloudServiceWidgetGetAction"
        />
    </general-page-layout>
</template>

<script lang="ts">
import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccounts from '@/views/common/widgets/service-accounts/ServiceAccounts.vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import TopProjects from '@/views/common/widgets/top-projects/TopProjects.vue';
import { blue, secondary, secondary1 } from '@/styles/colors';
import { ServiceSummaryWidgetState } from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import Collectors from '@/views/common/widgets/collectors/Collectors.vue';
import { Stat } from '@/lib/fluent-api/statistics/resource';

export default {
    name: 'Dashboard',
    components: {
        GeneralPageLayout,
        CloudServices,
        DailyUpdates,
        ServiceAccounts,
        ServiceSummary,
        TopProjects,
        Collectors,
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
            cloudServiceWidgetGetAction(apiAction: Stat) {
                return apiAction
                    .setFilter({ key: 'tags.spaceone:is_major', value: 'true', operator: '=' })
                    .setLimit(12);
            },
        };
    },
};
</script>

<style lang="postcss">
    /*@media (max-width: 477px) {*/
    /*    html, body {*/
    /*        font-size: 12px;*/
    /*    }*/
    /*}*/

    /*@media (min-width: 478px) and (max-width: 676px) {*/
    /*    html, body {*/
    /*        font-size: 14px;*/
    /*    }*/
    /*}*/

    /*@media (min-width: 768px) {*/
    /*    html, body {*/
    /*        font-size: 16px;*/
    /*    }*/
    /*}*/
</style>

<style lang="postcss" scoped>
    .dashboard::v-deep {
        @apply bg-primary-dark;
        .page-contents {
            @apply grid gap-4 grid-flow-row grid-cols-12 p-4;
        }

        @screen md {
            .page-contents {
                @apply p-8;
            }
        }

        @screen xl {
            .page-contents {
                @apply p-12;
            }
        }
    }
    .daily-updates {
        height: 33.75rem;
    }

    @screen lg {
        .daily-updates {
            height: 48rem;
        }
    }
</style>
