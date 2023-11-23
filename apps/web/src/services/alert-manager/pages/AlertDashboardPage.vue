<template>
    <div class="alert-dashboard-page">
        <p-heading :title="$t('MONITORING.ALERT.DASHBOARD.DASHBOARD')" />
        <div class="widget-wrapper">
            <alert-dashboard-alert-state-widget
                :activated-projects="activatedProjects"
                class="alert-state-widget"
            />
            <alert-dashboard-alert-history-widget
                :activated-projects="activatedProjects"
                class="alert-history-widget"
            />
            <h2 class="widget-title">
                {{ $t('MONITORING.ALERT.DASHBOARD.PROJECT_HEALTH_BOARD') }}
            </h2>
            <alert-dashboard-current-project-status-widget class="current-project-status-widget" />
            <alert-dashboard-top5-project-activity-widget class="top5-project-activity-widget" />
            <alert-dashboard-project-search-widget
                :activated-projects="activatedProjects"
                class="col-span-12"
            />
        </div>
    </div>
</template>

<script lang="ts">

import {
    reactive, toRefs,
} from 'vue';

import { PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import AlertDashboardAlertHistoryWidget from '@/services/alert-manager/components/AlertDashboardAlertHistoryWidget.vue';
import AlertDashboardAlertStateWidget from '@/services/alert-manager/components/AlertDashboardAlertStateWidget.vue';
import AlertDashboardCurrentProjectStatusWidget from '@/services/alert-manager/components/AlertDashboardCurrentProjectStatusWidget.vue';
import AlertDashboardProjectSearchWidget from '@/services/alert-manager/components/AlertDashboardProjectSearchWidget.vue';
import AlertDashboardTop5ProjectActivityWidget from '@/services/alert-manager/components/AlertDashboardTop5ProjectActivityWidget.vue';

export default {
    name: 'AlertDashboardPage',
    components: {
        AlertDashboardProjectSearchWidget,
        AlertDashboardTop5ProjectActivityWidget,
        AlertDashboardCurrentProjectStatusWidget,
        AlertDashboardAlertHistoryWidget,
        AlertDashboardAlertStateWidget,
        PHeading,
    },
    setup() {
        const state = reactive({
            activatedProjects: [] as string[],
        });

        /* api */
        const listProjectAlertConfig = async () => {
            try {
                const { results } = await SpaceConnector.client.monitoring.projectAlertConfig.list();
                state.activatedProjects = results.map((d) => d.project_id);
            } catch (e) {
            }
        };

        /* init */
        (async () => {
            await listProjectAlertConfig();
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

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
                @apply col-span-6;
            }
            .top5-project-activity-widget {
                @apply col-span-6;
            }
        }
    }

    @screen mobile {
        .widget-wrapper {
            .current-project-status-widget {
                @apply col-span-12;
            }
            .top5-project-activity-widget {
                @apply col-span-12;
            }
        }
    }
}
</style>
