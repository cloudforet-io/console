<template>
    <div class="grid grid-cols-12 project-dashboard-page">
        <project-all-summary class="col-span-12" :project-id="id" />
        <div class="col-span-12 lg:col-span-9 grid grid-cols-12 left-part">
            <!--            <project-alert-widget class="col-span-12" :project-id="id" />-->
            <project-billing class="col-span-12" :project-id="id" />
            <project-personal-health-dashboard class="col-span-12" :providers="providers" :project-id="id" />
            <project-service-accounts class="col-span-12 service-accounts-table" :project-id="id" />
        </div>
        <div class="col-span-12 lg:col-span-3 grid grid-cols-12 right-part">
            <daily-updates class="col-span-12 daily-updates"
                           :project-id="id"
            />
            <cloud-services class="col-span-12 cloud-services"
                            :more-info="true"
                            :project-id="id"
            />
            <project-trusted-advisor class="col-span-12 trusted-advisor"
                                     :providers="providers"
                                     :project-id="id"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import CloudServices from '@/common/modules/CloudServices.vue';
import DailyUpdates from '@/common/modules/DailyUpdates.vue';
import ProjectPersonalHealthDashboard from '@/views/project/project/modules/project-dashboard/ProjectPersonalHealthDashboard.vue';
import ProjectAllSummary from '@/views/project/project/modules/project-dashboard/ProjectAllSummary.vue';
import ProjectBilling from '@/views/project/project/modules/project-dashboard/ProjectBilling.vue';
import ProjectServiceAccounts from '@/views/project/project/modules/project-dashboard/ProjectServiceAccounts.vue';
import ProjectTrustedAdvisor from '@/views/project/project/modules/project-dashboard/ProjectTrustedAdvisor.vue';
// import ProjectAlertWidget from '@/views/project/project/modules/project-dashboard/ProjectAlertWidget.vue';

import { store } from '@/store';
import { SpaceConnector } from '@/lib/space-connector';


export default {
    name: 'ProjectDashboardPage',
    components: {
        // ProjectAlertWidget,
        ProjectBilling,
        ProjectPersonalHealthDashboard,
        ProjectTrustedAdvisor,
        ProjectAllSummary,
        CloudServices,
        DailyUpdates,
        ProjectServiceAccounts,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            providers: computed(() => vm.$store.state.resource.provider.items),
            hasAlertConfig: false,
        });

        /* api */
        const getProjectAlertConfig = async () => {
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.get({
                    project_id: props.id,
                });
                state.hasAlertConfig = true;
            } catch (e) {
                state.hasAlertConfig = false;
            }
        };

        (async () => {
            await Promise.all([
                store.dispatch('resource/cloudServiceType/load'),
                store.dispatch('resource/region/load'),
                // getProjectAlertConfig(),
            ]);
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.widget-layout::v-deep {
    .title {
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.6;
    }
}

.project-dashboard-page {
    grid-gap: 1rem;
    padding: 2rem 1rem 0;

    .left-part, .right-part {
        display: grid;
        grid-auto-rows: max-content;
        row-gap: 1rem;
    }

    .cloud-services {
        @apply border border-gray-200 rounded-md;
        min-height: 25rem;
        max-height: 35rem;

        @screen tablet {
            height: 26rem;
        }
    }

    .trusted-advisor {
        @apply border border-gray-200 rounded-md;
    }

    .service-accounts-table {
        @apply border border-gray-200 rounded-md;
    }

    .daily-updates {
        @apply border border-gray-200 rounded-md;
        max-height: 35rem;
    }
}
</style>
