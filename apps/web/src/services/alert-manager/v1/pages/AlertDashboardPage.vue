<script setup lang="ts">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PHeading } from '@cloudforet/mirinae';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectAlertConfigListParameters } from '@/schema/monitoring/project-alert-config/api-verbs/list';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertDashboardAlertHistoryWidget from '@/services/alert-manager/v1/components/AlertDashboardAlertHistoryWidget.vue';
import AlertDashboardAlertStateWidget from '@/services/alert-manager/v1/components/AlertDashboardAlertStateWidget.vue';
import AlertDashboardCurrentProjectStatusWidget from '@/services/alert-manager/v1/components/AlertDashboardCurrentProjectStatusWidget.vue';
import AlertDashboardProjectSearchWidget from '@/services/alert-manager/v1/components/AlertDashboardProjectSearchWidget.vue';
import AlertDashboardTop5ProjectActivityWidget from '@/services/alert-manager/v1/components/AlertDashboardTop5ProjectActivityWidget.vue';


const state = reactive({
    activatedProjects: [] as string[],
});

/* api */
const listProjectAlertConfig = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.monitoring.projectAlertConfig.list<ProjectAlertConfigListParameters, ListResponse<ProjectAlertConfigModel>>();
        state.activatedProjects = results?.map((d) => d.project_id) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.activatedProjects = [];
    }
};

/* init */
(async () => {
    await listProjectAlertConfig();
})();

</script>

<template>
    <div class="alert-dashboard-page">
        <p-heading class="mb-6"
                   :title="$t('MONITORING.ALERT.DASHBOARD.DASHBOARD')"
        />
        <div class="widget-wrapper">
            <alert-dashboard-alert-state-widget
                :activated-projects="state.activatedProjects"
                class="alert-state-widget"
            />
            <alert-dashboard-alert-history-widget
                :activated-projects="state.activatedProjects"
                class="alert-history-widget"
            />
            <h2 class="widget-title">
                {{ $t('MONITORING.ALERT.DASHBOARD.PROJECT_HEALTH_BOARD') }}
            </h2>
            <alert-dashboard-current-project-status-widget class="current-project-status-widget" />
            <alert-dashboard-top5-project-activity-widget class="top5-project-activity-widget" />
            <alert-dashboard-project-search-widget
                :activated-projects="state.activatedProjects"
                class="col-span-12"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.alert-dashboard-page {
    .widget-wrapper {
        @apply grid grid-cols-12 gap-4;

        .widget-title {
            @apply col-span-12;
            font-size: 1.5rem;
            line-height: 1.35;
            padding-top: 1rem;
        }

        .alert-state-widget {
            @apply col-span-12;
        }
        .alert-history-widget {
            @apply col-span-12;
        }
        .current-project-status-widget {
            @apply col-span-3;
        }
        .top5-project-activity-widget {
            @apply col-span-9;
        }
        .project-search-widget {
            padding-top: 0.5rem;
        }
    }

    @screen tablet {
        .widget-wrapper {
            .current-project-status-widget {
                grid-column: span 6 / span 6;
            }
            .top5-project-activity-widget {
                grid-column: span 6 / span 6;
            }
        }
    }

    @screen mobile {
        .widget-wrapper {
            .current-project-status-widget {
                grid-column: span 12 / span 12;
            }
            .top5-project-activity-widget {
                grid-column: span 12 / span 12;
            }
        }
    }
}
</style>
