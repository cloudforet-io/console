<template>
    <div class="alert-dashboard-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('MONITORING.ALERT.DASHBOARD.DASHBOARD')" />
        <div class="widget-wrapper">
            <alert-state-widget class="alert-state-widget" />
            <alert-history-widget class="col-span-12" />
            <h2 class="widget-title col-span-12">
                {{ $t('MONITORING.ALERT.DASHBOARD.PROJECT_HEALTH_BOARD') }}
            </h2>
            <current-project-status-widget class="col-span-3" />
            <top5-project-activity-widget class="col-span-9" />
            <project-search-widget class="col-span-12" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';

import AlertStateWidget from '@/views/monitoring/alert/modules/alert-dashboard/AlertStateWidget.vue';
import AlertHistoryWidget from '@/views/monitoring/alert/modules/alert-dashboard/AlertHistoryWidget.vue';
import CurrentProjectStatusWidget from '@/views/monitoring/alert/modules/alert-dashboard/CurrentProjectStatusWidget.vue';
import Top5ProjectActivityWidget from '@/views/monitoring/alert/modules/alert-dashboard/Top5ProjectActivityWidget.vue';
import ProjectSearchWidget from '@/views/monitoring/alert/modules/alert-dashboard/ProjectSearchWidget.vue';

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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
        });
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: vm.$t('MENU.MONITORING.ALERT_SYSTEM'), path: '/monitoring/alert-system/dashboard' },
                { name: vm.$t('MONITORING.ALERT.DASHBOARD.DASHBOARD') },
            ]),
        });

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
            font-size: 1.5rem;
            line-height: 1.35;
            padding-top: 1rem;
        }

        .alert-state-widget {
            @apply col-span-12;
        }
        .project-search-widget {
            padding-top: 0.5rem;
        }
    }
}
</style>
