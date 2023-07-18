<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    reactive,
} from 'vue';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';
import DailyUpdates from '@/common/modules/widgets/DailyUpdates.vue';

import CloudServices from '@/services/asset-inventory/cloud-service/modules/CloudServices.vue';
import ProjectAlertWidget from '@/services/project/project-detail/project-summary/modules/ProjectAlertWidget.vue';
import ProjectAllSummary from '@/services/project/project-detail/project-summary/modules/ProjectAllSummary.vue';
import ProjectBilling from '@/services/project/project-detail/project-summary/modules/ProjectBilling.vue';
import ProjectPersonalHealthDashboard from '@/services/project/project-detail/project-summary/modules/ProjectPersonalHealthDashboard.vue';
import ProjectServiceAccounts from '@/services/project/project-detail/project-summary/modules/ProjectServiceAccounts.vue';
import ProjectTrustedAdvisor from '@/services/project/project-detail/project-summary/modules/ProjectTrustedAdvisor.vue';

interface Props {
    id: string;
}

const props = defineProps<Props>();
const store = useStore();

const state = reactive({
    hasAlertConfig: false,
});

/* api */
const getProjectAlertConfig = async () => {
    try {
        const { results } = await SpaceConnector.client.monitoring.projectAlertConfig.list({
            project_id: props.id,
        });
        state.hasAlertConfig = !!results.length;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

(async () => {
    await Promise.allSettled([
        getProjectAlertConfig(),
        // LOAD REFERENCE STORE
        store.dispatch('reference/cloudServiceType/load'),
    ]);
})();

</script>

<template>
    <div class="grid grid-cols-12 project-dashboard-page">
        <project-all-summary class="col-span-12"
                             :project-id="id"
        />
        <div class="col-span-12 lg:col-span-9 grid grid-cols-12 left-part">
            <project-alert-widget v-if="state.hasAlertConfig"
                                  class="col-span-12"
                                  :project-id="id"
            />
            <project-billing class="col-span-12"
                             :project-id="id"
            />
            <project-personal-health-dashboard class="col-span-12"
                                               :project-id="id"
            />
            <project-service-accounts class="col-span-12 service-accounts-table"
                                      :project-id="id"
            />
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
                                     :project-id="id"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
/* custom widget-layout */
:deep(.widget-layout) {
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
