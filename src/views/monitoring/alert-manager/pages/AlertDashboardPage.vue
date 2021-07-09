<template>
    <div class="alert-dashboard-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('MONITORING.ALERT.DASHBOARD.DASHBOARD')" />
        <div class="widget-wrapper">
            <alert-state-widget class="alert-state-widget" />
            <alert-history-widget class="alert-history-widget" />
            <h2 class="widget-title">
                {{ $t('MONITORING.ALERT.DASHBOARD.PROJECT_HEALTH_BOARD') }}
            </h2>
            <current-project-status-widget class="current-project-status-widget" />
            <top5-project-activity-widget class="top5-project-activity-widget" />
            <project-search-widget class="col-span-12" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';

import AlertStateWidget from '@/views/monitoring/alert-manager/modules/alert-dashboard/AlertStateWidget.vue';
import AlertHistoryWidget from '@/views/monitoring/alert-manager/modules/alert-dashboard/AlertHistoryWidget.vue';
import CurrentProjectStatusWidget from '@/views/monitoring/alert-manager/modules/alert-dashboard/CurrentProjectStatusWidget.vue';
import Top5ProjectActivityWidget from '@/views/monitoring/alert-manager/modules/alert-dashboard/Top5ProjectActivityWidget.vue';
import ProjectSearchWidget from '@/views/monitoring/alert-manager/modules/alert-dashboard/ProjectSearchWidget.vue';

import { store } from '@/store';
import { i18n } from '@/translations';

export default {
    name: 'AlertDashboardPage',
    components: {
        ProjectSearchWidget,
        Top5ProjectActivityWidget,
        CurrentProjectStatusWidget,
        AlertHistoryWidget,
        AlertStateWidget,
        PBreadcrumbs,
        PPageTitle,
    },
    setup() {
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: i18n.t('MENU.MONITORING.ALERT_MANAGER'), path: '/monitoring/alert-manager/dashboard' },
                { name: i18n.t('MONITORING.ALERT.DASHBOARD.DASHBOARD') },
            ]),
        });

        (() => {
            store.dispatch('resource/project/load');
        })();

        return {
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-dashboard-page {
    max-width: 85.5rem;

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
