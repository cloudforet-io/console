<template>
    <div class="all-dashboards-page">
        <p-page-title :title="'Dashboards'"
                      use-total-count
        >
            <template #extra>
                <p-button icon-left="ic_plus"
                          @click="handleCreateDashboard"
                >
                    <!--song lang-->
                    Create
                </p-button>
            </template>
        </p-page-title>
        <p-divider class="dashboards-divider" />
        <all-dashboards-select-filter :viewer-status.sync="viewersStatus"
                                      :scope-status.sync="scopeStatus"
        />
        <p-search :value="keyword" />
        <div class="dashboard-list-wrapper">
            <dashboard-board-list class="dashboard-list"
                                  :field-title="'Entire Workspace'"
                                  :dashboard-list="workspaceDashboardList"
            />
            <dashboard-board-list class="dashboard-list"
                                  :field-title="'Single Project'"
                                  :dashboard-list="projectDashboardList"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from 'vue';

import {
    PPageTitle, PDivider, PButton, PSearch,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import AllDashboardsSelectFilter from '@/services/dashboards/all-dashboards/modules/AllDashboardsSelectFilter.vue';
import DashboardBoardList from '@/services/dashboards/all-dashboards/modules/DashboardBoardList.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

export default {
    name: 'AllDashboardsPage',
    components: {
        DashboardBoardList,
        PSearch,
        AllDashboardsSelectFilter,
        PButton,
        PPageTitle,
        PDivider,
    },
    setup() {
        const state = reactive({
            keyword: '',
            viewersStatus: { label: i18n.t('All'), name: 'ALL' },
            scopeStatus: { label: i18n.t('All'), name: 'ALL' },
            workspaceDashboardList: computed(() => [
                {
                    domain_dashboard_id: '123',
                    name: 'Cafe Gondry',
                    version: 0,
                    viewers: 'PUBLIC',
                    labels: ['Chicken', 'Hop', 'Pub'],
                    tags: {},
                    user_id: '',
                    domain_id: '',
                    settings: {},
                    dashboard_options: {},
                    dashboard_options_schema: {},
                    created_at: '',
                    updated_at: '',
                },
                {
                    domain_dashboard_id: '123',
                    name: 'Cafe Gondry2',
                    version: 0,
                    viewers: 'PRIVATE',
                    labels: ['Hop', 'Pub'],
                    tags: {},
                    user_id: '',
                    domain_id: '',
                    settings: {},
                    dashboard_options: {},
                    dashboard_options_schema: {},
                    created_at: '',
                    updated_at: '',
                },
            ]),
            projectDashboardList: computed(() => [
                {
                    domain_dashboard_id: '1234',
                    name: 'Cafe Gondry33',
                    version: 0,
                    viewers: 'PUBLIC',
                    labels: ['Chicken', 'Hop', 'Pub'],
                    tags: {},
                    user_id: '',
                    domain_id: '',
                    settings: {},
                    dashboard_options: {},
                    dashboard_options_schema: {},
                    created_at: '',
                    updated_at: '',
                },
                {
                    domain_dashboard_id: '1235',
                    name: 'Cafe Gondry2',
                    version: 0,
                    viewers: 'PRIVATE',
                    labels: ['Hop', 'Pub', 'Test', 'Test2'],
                    tags: {},
                    user_id: '',
                    domain_id: '',
                    settings: {},
                    dashboard_options: {},
                    dashboard_options_schema: {},
                    created_at: '',
                    updated_at: '',
                },
                {
                    domain_dashboard_id: '1235',
                    name: 'Cafe Gondry21',
                    version: 0,
                    viewers: 'PRIVATE',
                    labels: ['Hop', 'Pub', 'Test', 'Test3'],
                    tags: {},
                    user_id: '',
                    domain_id: '',
                    settings: {},
                    dashboard_options: {},
                    dashboard_options_schema: {},
                    created_at: '',
                    updated_at: '',
                },
            ]),
        });

        const handleCreateDashboard = () => { SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.CREATE._NAME }); };

        return {
            ...toRefs(state),
            handleCreateDashboard,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-dashboards-page {
    .dashboard-list-wrapper {
        @apply flex;
        padding-top: 0.5rem;
        gap: 0.5rem;

        .dashboard-list {
            flex-grow: 1;
        }
    }

    @screen tablet {
        .dashboard-list-wrapper {
            display: block;
        }
    }
}
</style>
