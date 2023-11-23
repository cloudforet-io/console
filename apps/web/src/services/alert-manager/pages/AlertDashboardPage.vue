<template>
    <div class="alert-dashboard-page">
        <p-heading :title="$t('MONITORING.ALERT.DASHBOARD.DASHBOARD')" />
        <div class="widget-wrapper">
            <alert-state-widget :activated-projects="activatedProjects"
                                class="alert-state-widget"
            />
            <alert-history-widget :activated-projects="activatedProjects"
                                  class="alert-history-widget"
            />
            <h2 class="widget-title">
                {{ $t('MONITORING.ALERT.DASHBOARD.PROJECT_HEALTH_BOARD') }}
            </h2>
            <current-project-status-widget class="current-project-status-widget" />
            <top5-project-activity-widget class="top5-project-activity-widget" />
            <project-search-widget :activated-projects="activatedProjects"
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

import AlertHistoryWidget from '@/services/alert-manager/alert-dashboard/modules/alert-history-widget/AlertHistoryWidget.vue';
import AlertStateWidget from '@/services/alert-manager/alert-dashboard/modules/AlertStateWidget.vue';
import CurrentProjectStatusWidget from '@/services/alert-manager/alert-dashboard/modules/CurrentProjectStatusWidget.vue';
import ProjectSearchWidget from '@/services/alert-manager/alert-dashboard/modules/project-search-widget/ProjectSearchWidget.vue';
import Top5ProjectActivityWidget from '@/services/alert-manager/alert-dashboard/modules/top-5-project-activity-widget/Top5ProjectActivityWidget.vue';

export default {
    name: 'AlertDashboardPage',
    components: {
        ProjectSearchWidget,
        Top5ProjectActivityWidget,
        CurrentProjectStatusWidget,
        AlertHistoryWidget,
        AlertStateWidget,
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
