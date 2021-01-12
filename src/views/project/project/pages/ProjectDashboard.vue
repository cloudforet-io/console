<template>
    <div class="grid grid-cols-12 gap-3">
        <project-all-summary class="col-span-12" :project-id="projectId" />
        <div class="col-span-12 lg:col-span-9 grid grid-cols-12 gap-3">
            <project-billing class="col-span-12" :project-id="projectId" />
            <project-personal-health-dashboard class="col-span-12" :providers="providers" :project-id="projectId" />
            <div class="col-span-12 resources-tab">
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
            <service-accounts-table class="col-span-12 service-accounts-table" />
        </div>
        <div class="col-span-12 lg:col-span-3">
            <div class="grid grid-cols-12 gap-3">
                <daily-updates class="col-span-12 daily-updates"
                               :project-id="projectId"
                               :project-filter="projectFilter"
                />
                <cloud-services class="col-span-12 cloud-services"
                                :more-info="true"
                                :project-filter="projectFilter"
                                :project-id="projectId"
                />
                <simplified-trusted-advisor class="col-span-12 trusted-advisor"
                                            :providers="providers"
                                            :project-id="projectId"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Location } from 'vue-router';
import { TranslateResult } from 'vue-i18n';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { PTab } from '@spaceone/design-system';

import ProjectPersonalHealthDashboard from '@/views/common/components/widgets/personal-health-dashboard/ProjectPersonalHealthDashboard.vue';
import ProjectAllSummary from '@/views/common/components/widgets/all-summary/ProjectAllSummary.vue';
import ProjectBilling from '@/views/common/components/widgets/billing/ProjectBilling.vue';
import CloudServices from '@/views/common/components/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/components/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccountsTable from '@/views/common/components/widgets/service-accounts-table/ServiceAccountsTable.vue';
import ResourcesByRegion from '@/views/common/components/widgets/resources-by-region/ResourcesByRegion.vue';
import SimplifiedTrustedAdvisor from '@/views/common/components/widgets/trusted-advisor/SimplifiedTrustedAdvisor.vue';

import {
    blue, secondary, secondary1,
} from '@/styles/colors';
import { store } from '@/store';


interface SummaryState {
    type: string;
    title: TranslateResult;
    to: Location | string;
    color: string;
}

export default {
    name: 'ProjectDashboard',
    components: {
        ProjectBilling,
        ProjectPersonalHealthDashboard,
        SimplifiedTrustedAdvisor,
        ProjectAllSummary,
        ResourcesByRegion,
        CloudServices,
        DailyUpdates,
        ServiceAccountsTable,
        PTab,
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
            providers: computed(() => vm.$store.state.resource.provider.items),
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
            to: `/inventory/server?filters=project_id%3A%3D${projectId.value}`,
            color: secondary,
        });

        const cloudServiceSummaryState: SummaryState = reactive({
            type: 'cloudService',
            title: computed(() => vm.$t('COMMON.WIDGETS.SERVICE_SUMMARY_CLOUD_SERVICE')),
            to: `/inventory/cloud-service?filters=project_id%3A%3D${projectId.value}&provider=all`,
            color: secondary1,
        });

        const dailyUpdates = ({
            server: api => api.setId(projectId.value),
            cloudService: api => api.setId(projectId.value),
        });

        const init = () => {
            store.dispatch('resource/cloudServiceType/load');
            store.dispatch('resource/region/load');
        };
        init();

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
.widget-layout::v-deep {
    .title {
        font-size: 1rem;
        font-weight: bold;
    }
}

.cloud-services {
    @apply border border-gray-200;
    min-height: 25rem;
    max-height: 35rem;
    border-radius: 2px;
    @media screen and (width < 1024px) {
        height: 26rem;
    }
}

.trusted-advisor {
    @apply border border-gray-200;
    border-radius: 2px;
}

.resources-by-region {
    .title {
        font-size: 1.125rem;
    }
}

.service-accounts-table {
    @apply border border-gray-200;
    border-radius: 2px;
}

.daily-updates {
    @apply border border-gray-200;
    max-height: 35rem;
    border-radius: 2px;
}

.health-dashboard {
    height: 46.75rem;
}

</style>
