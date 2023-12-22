<script lang="ts" setup>
import {
    reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectAlertConfigListParameters } from '@/schema/monitoring/project-alert-config/api-verbs/list';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import DailyUpdates from '@/common/modules/widgets/DailyUpdates.vue';

import CloudServices from '@/services/asset-inventory/components/CloudServices.vue';
import ProjectSummaryAlertWidget from '@/services/project/components/ProjectSummaryAlertWidget.vue';
import ProjectSummaryAllSummaryWidget from '@/services/project/components/ProjectSummaryAllSummaryWidget.vue';
import ProjectSummaryBillingWidget from '@/services/project/components/ProjectSummaryBillingWidget.vue';
import ProjectSummaryPersonalHealthDashboardWidget from '@/services/project/components/ProjectSummaryPersonalHealthDashboardWidget.vue';
import ProjectSummaryServiceAccountsWidget from '@/services/project/components/ProjectSummaryServiceAccountsWidget.vue';
import ProjectSummaryTrustedAdvisorWidget from '@/services/project/components/ProjectSummaryTrustedAdvisorWidget.vue';


interface Props {
    id: string;
}
const props = defineProps<Props>();
const state = reactive({
    hasAlertConfig: false,
});

/* api */
const getProjectAlertConfig = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.monitoring.projectAlertConfig.list<ProjectAlertConfigListParameters, ListResponse<ProjectAlertConfigModel>>({
            project_id: props.id,
        });
        state.hasAlertConfig = !!results?.length;
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
        <project-summary-all-summary-widget
            class="col-span-12"
            :project-id="props.id"
        />
        <div class="col-span-12 lg:col-span-9 grid grid-cols-12 left-part">
            <project-summary-alert-widget
                v-if="state.hasAlertConfig"
                class="col-span-12"
                :project-id="props.id"
            />
            <project-summary-billing-widget
                class="col-span-12"
                :project-id="props.id"
            />
            <project-summary-personal-health-dashboard-widget
                class="col-span-12"
                :project-id="props.id"
            />
            <project-summary-service-accounts-widget
                class="col-span-12 service-accounts-table"
                :project-id="props.id"
            />
        </div>
        <div class="col-span-12 lg:col-span-3 grid grid-cols-12 right-part">
            <daily-updates class="col-span-12 daily-updates"
                           :project-id="props.id"
            />
            <cloud-services class="col-span-12 cloud-services"
                            :more-info="true"
                            :project-id="props.id"
            />
            <project-summary-trusted-advisor-widget
                class="col-span-12 trusted-advisor"
                :project-id="props.id"
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
