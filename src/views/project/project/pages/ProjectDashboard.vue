<template>
    <div class="grid gap-4 grid-flow-row grid-cols-12">
        <service-summary class="col-start-1 col-end-13
                                sm:col-end-6
                                lg:col-end-5
                                "
                         title="servers" resource-type="inventory.Server"
                         :get-action="getProject"
                         :color="servers.color"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-6 sm:col-end-13
                                lg:col-start-5 lg:col-end-10"
                         title="cloud services" resource-type="inventory.CloudService"
                         :get-action="getServer"
                         :color="cloudServices.color"
        />
        <cloud-services class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-10
                               sm:col-end-13 lg:row-start-2"
        />
        <div class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-10
             lg:row-start-3 resources-tab"
        >
            <PTab :tabs="tabs" :active-tab.sync="activeTab">
                <template #server>
                    <service-accounts
                        :title="'RESOURCES BY REGION'"
                        reverse
                        resource-type="inventory.Server"
                        :get-action="getServer"
                    />
                </template>
                <template #cloud_service>
                    <service-accounts
                        :title="'RESOURCES BY REGION'"
                        reverse
                    />
                </template>
            </PTab>
        </div>
        <service-accounts-table
            class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-10 lg:row-start-4"
        />
        <daily-updates class="col-start-1 col-end-13 sm:col-start-1 sm:col-end-13 lg:col-start-10 col-end-13
                              row-start-4 row-end-5 sm:row-start-2 sm:row-end-3 lg:row-start-1
                              daily-updates"
        />
        <health-dashboard class="col-start-1 col-end-13 sm:col-start-1 sm:col-end-13 lg:col-start-10 col-end-13
                              row-start-5 row-end-8 sm:row-start-3 sm:row-end-4 lg:row-start-3
                              health-dashboard"
        />
    </div>
</template>

<script lang="ts">
import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccounts from '@/views/common/widgets/service-accounts/ServiceAccounts.vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import ServiceAccountsTable from '@/views/common/widgets/service-accounts-table/ServiceAccountsTable.vue';
import HealthDashboard from '@/views/common/widgets/health-dashboard/HealthDashboard.vue';
import { blue, secondary, secondary1 } from '@/styles/colors';
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { fluentApi, Resource } from '@/lib/fluent-api';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import { makeTrItems } from '@/lib/view-helper';
import { Stat } from '@/lib/fluent-api/statistics/resource';
import { api } from '@/lib/api/axios';

export default {
    name: 'ProjectDashboard',
    components: {
        CloudServices,
        DailyUpdates,
        ServiceSummary,
        ServiceAccountsTable,
        PTab,
        ServiceAccounts,
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
        const vm = getCurrentInstance();
        const projectId = computed<string>(() => context.root.$route.params.id as string);

        const tabData = reactive({
            tabs: makeTrItems([
                ['server', 'COMMON.SERVER', { keepAlive: true }],
                ['cloud_service', 'FIELD.CLOUD_SERVICE'],
            ],
            context.parent),
            activeTab: 'server',
        });

        return {
            ...toRefs(state),
            ...toRefs(tabData),
            getProject(apiAction: Stat<any>) {
                return apiAction.setFilter({
                    key: 'project_id',
                    value: projectId.value,
                    operator: '=',
                }).setResourceType('identity.Project');
            },
            getServer(apiAction: Stat<any>) {
                return apiAction.setFilter({
                    key: 'project_id',
                    value: projectId.value,
                    operator: '=',
                }).setResourceType('inventory.Server');
            },
        };
    },
};
</script>

<style scoped>
    .daily-updates {
        height: 38rem;
    }

    .health-dashboard {
        height: 34rem;
    }

</style>
