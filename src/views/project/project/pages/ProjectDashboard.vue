<template>
    <div class="grid gap-4 grid-flow-row grid-cols-12">
        <service-summary class="col-start-1 col-end-13
                                sm:col-end-6
                                lg:col-end-5
                                "
                         v-bind="serverSummaryState"
                         :project-id="projectId"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-6 sm:col-end-13
                                lg:col-start-5 lg:col-end-9"
                         v-bind="cloudServiceSummaryState"
                         :project-id="projectId"
        />
        <cloud-services class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-9
                               sm:col-end-13 lg:row-start-2 cloud-service"
                        :project-filter="projectFilter"
                        :project-id="projectId"
        />
        <div class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-9
             lg:row-start-3 resources-tab"
        >
            <p-tab :tabs="tabs" :active-tab.sync="activeTab">
                <template #server>
                    <resources-by-region
                        :project-filter="projectFilter"
                        :project-id="projectId"
                        :is-server="true"
                    />
                </template>
                <template #cloud_service>
                    <resources-by-region
                        :project-filter="projectFilter"
                        :project-id="projectId"
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
                       :project-id="projectId"
                       :project-filter="projectFilter"
        />
        <health-dashboard class="col-start-1 col-end-13 sm:col-start-1 sm:col-end-13 lg:col-start-9 col-end-13
                              row-start-5 row-end-8 sm:row-start-3 sm:row-end-5 lg:row-start-3
                              health-dashboard"
                          :project-id="projectId"
        />
    </div>
</template>

<script lang="ts">
import { Location } from 'vue-router';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates.vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import ServiceAccountsTable from '@/views/common/widgets/service-accounts-table/ServiceAccountsTable.vue';
import HealthDashboard from '@/views/common/widgets/health-dashboard/HealthDashboard.vue';
import ResourcesByRegion from '@/views/common/widgets/resources-by-region/ResourcesByRegion.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import { blue, secondary, secondary1 } from '@/styles/colors';
import { makeTrItems } from '@/lib/view-helper';
import VueI18n from 'vue-i18n';

import TranslateResult = VueI18n.TranslateResult;


interface SummaryState {
    type: string;
    title: TranslateResult;
    to: Location | string;
    color: string;
}

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
        const vm = getCurrentInstance() as ComponentRenderProxy;

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
        const projectFilter = `&filters=project_id%3A%3D${projectId.value}`;

        const tabData = reactive({
            tabs: computed(() => [
                { name: 'server', label: vm.$t('COMMON.WIDGETS.RESOURCE_BY_REGION_SERVER') },
                { name: 'cloud_service', label: vm.$t('COMMON.WIDGETS.RESOURCE_BY_REGION_CLOUD_SERVICE') },
            ]),
            activeTab: 'server',
        });

        const serverSummaryState: SummaryState = reactive({
            type: 'server',
            title: computed(() => vm.$t('COMMON.WIDGETS.SERVICE_SUMMARY_SERVER')),
            to: `/inventory/server?filters=project_id%3A${projectId.value}`,
            color: secondary,
        });

        const cloudServiceSummaryState: SummaryState = reactive({
            type: 'cloudService',
            title: computed(() => vm.$t('COMMON.WIDGETS.SERVICE_SUMMARY_CLOUD_SERVICE')),
            to: `/inventory/cloud-service?filters=project_id%3A${projectId.value}&provider=all`,
            color: secondary1,
        });

        const dailyUpdates = ({
            server: api => api.setId(projectId.value),
            cloudService: api => api.setId(projectId.value),
        });

        return {
            ...toRefs(state),
            ...toRefs(tabData),
            projectId,
            projectFilter,
            serverSummaryState,
            cloudServiceSummaryState,
            dailyUpdates,
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
