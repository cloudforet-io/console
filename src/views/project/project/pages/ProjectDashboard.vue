<template>
    <div class="grid gap-4 grid-flow-row grid-cols-12">
        <service-summary class="col-start-1 col-end-13
                                sm:col-end-6
                                lg:col-end-5
                                "
                         v-bind="serverSummary.state"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-6 sm:col-end-13
                                lg:col-start-5 lg:col-end-9"
                         v-bind="cloudServiceSummary.state"
        />
        <cloud-services class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-9
                               sm:col-end-13 lg:row-start-2 cloud-service"
                        :get-action="getCloudServiceCount"
                        :project-filter="projectFilter"
        />
        <div class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-9
             lg:row-start-3 resources-tab"
        >
            <p-tab :tabs="tabs" :active-tab.sync="activeTab">
                <template #server>
                    <resources-by-region
                        :get-action="resources.server"
                        :project-filter="projectFilter"
                        :project-id="projectId"
                        :is-server="true"
                    />
                </template>
                <template #cloud_service>
                    <resources-by-region
                        :get-action="resources.cloudService"
                        :project-filter="projectFilter"
                        :is-server="false"
                    />
                </template>
            </p-tab>
        </div>
        <service-accounts-table
            class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-9 lg:row-start-4"
        />
        <daily-updates class="col-start-1 col-end-13 sm:col-start-1 sm:col-end-13 lg:col-start-9 col-end-13
                              row-start-4 row-end-5 sm:row-start-2 sm:row-end-3 lg:row-start-1
                              daily-updates"
                       :get-cloud-service-action="dailyUpdates.cloudService"
                       :get-server-action="dailyUpdates.server"
                       :project-filter="projectFilter"
        />
        <health-dashboard class="col-start-1 col-end-13 sm:col-start-1 sm:col-end-13 lg:col-start-9 col-end-13
                              row-start-5 row-end-8 sm:row-start-3 sm:row-end-5 lg:row-start-3
                              health-dashboard"
        />
    </div>
</template>

<script lang="ts">
import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates_new.vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import ServiceAccountsTable from '@/views/common/widgets/service-accounts-table/ServiceAccountsTable.vue';
import HealthDashboard from '@/views/common/widgets/health-dashboard/HealthDashboard.vue';
import { blue, secondary, secondary1 } from '@/styles/colors';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { FILTER_OPERATOR } from '@/lib/fluent-api';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import { makeTrItems } from '@/lib/view-helper';
import { Stat } from '@/lib/fluent-api/statistics/resource';
import ResourcesByRegion from '@/views/common/widgets/resources-by-region/ResourcesByRegion.vue';
import { ServiceSummaryWidgetState } from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';

export default {
    name: 'ProjectDashboard',
    components: {
        ResourcesByRegion,
        CloudServices,
        DailyUpdates,
        ServiceSummary,
        ServiceAccountsTable,
        PTab,
        HealthDashboard,
    },
    setup(props, context) {
        const state = reactive({
            projectName: '',
            projects: {
                color: blue[600],
            },
            servers: {
                color: secondary,
            },
            cloudServices: {
                color: secondary1,
            },
        });
        const projectId = computed<string>(() => context.root.$route.params.id as string);
        const projectFilter = `&f=project_id%3A%3D${projectId.value}`;

        const tabData = reactive({
            tabs: makeTrItems([
                ['server', 'COMMON.SERVER', { keepAlive: true }],
                ['cloud_service', 'FIELD.CLOUD_SERVICE'],
            ],
            context.parent),
            activeTab: 'server',
        });

        const serverSummary = new ServiceSummaryWidgetState({
            title: 'servers',
            to: `/inventory/server?filters=project_id%3A${projectId.value}`,
            color: secondary,
            getAction: api => api.setResourceType('identity.Project')
                .setFilter({
                    key: 'project_id',
                    value: projectId.value,
                    operator: '=',
                }).setResourceType('inventory.Server'),
            getTrendAction: api => api.setTopic('daily_server_count')
                .setFilter({
                    key: 'values.project_id',
                    value: projectId.value,
                    operator: '=',
                })
                .addGroupField('count', STAT_OPERATORS.sum, 'values.server_count'),
        });

        const cloudServiceSummary = new ServiceSummaryWidgetState({
            title: 'cloud services',
            to: `/inventory/cloud-service?f=project_id%3A${projectId.value}&provider=all`,
            color: secondary1,
            getAction: api => api.setResourceType('identity.Project')
                .setFilter({
                    key: 'project_id',
                    value: projectId.value,
                    operator: '=',
                }).setResourceType('inventory.CloudService'),
            getTrendAction: api => api.setTopic('daily_cloud_service_count')
                .setFilter({
                    key: 'values.project_id',
                    value: projectId.value,
                    operator: '=',
                })
                .addGroupField('count', STAT_OPERATORS.sum, 'values.cloud_service_count'),
        });

        const dailyUpdates = ({
            server: api => api.setId(projectId.value),
            cloudService: api => api.setId(projectId.value),
        });

        const resources = ({
            server: api => api.addGroupKey('data.compute.region_name', 'region_name')
                .setFilter({
                    key: 'data.compute.region_name',
                    value: [null, ''],
                    operator: FILTER_OPERATOR.notIn,
                }, {
                    key: 'project_id',
                    value: projectId.value,
                    operator: '=',
                }).setResourceType('inventory.Server'),
            cloudService: api => api.addGroupKey('data.region_name', 'region_name')
                .setFilter({
                    key: 'project_id',
                    value: projectId.value,
                    operator: '=',
                }, {
                    key: 'data.region_name',
                    value: [null, ''],
                    operator: FILTER_OPERATOR.notIn,
                }).setResourceType('inventory.CloudService'),
        });

        return {
            ...toRefs(state),
            ...toRefs(tabData),
            projectId,
            projectFilter,
            serverSummary,
            cloudServiceSummary,
            dailyUpdates,
            resources,
            getCloudServiceCount(apiAction: Stat) {
                return apiAction
                    .setJoinType('INNER')
                    .setJoinFilter([{
                        key: 'project_id',
                        value: projectId.value,
                        operator: '=',
                    }]);
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
    .cloud-service {
        height: 26rem;
    &::v-deep .widget-contents {
         overflow-y: auto;
         margin-bottom: 1rem;
     }
    }

    .daily-updates {
        height: 39.2rem;
    }

    .health-dashboard {
        height: 46.75rem;
    }

</style>
