<template>
    <div class="dashboard-more-menu">
        <p-select-dropdown class="more-button"
                           :items="state.moreMenuItems"
                           style-type="icon-button"
                           button-icon="ic_more"
                           menu-position="left"
                           @select="handleSelectMoreMenu"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :loading="checkDeleteState.loading"
                      @confirm="handleDeleteDashboardConfirm"
        />
    </div>
</template>

<script setup lang="ts">
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { computed, reactive } from 'vue';
import VueI18n from 'vue-i18n';

import { PSelectDropdown } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardViewer } from '@/services/dashboards/config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';


import TranslateResult = VueI18n.TranslateResult;

type DefaultMenuItems = Array<{
    name: typeof MENU.DELETE | typeof MENU.SET_HOME
    label: TranslateResult
    disabled: boolean
}>;

interface DashboardMoreMenuProps {
    dashboardId: string;
    dashboardViewer: DashboardViewer;
    manageDisabled: boolean;
}

const MENU = Object.freeze({
    DELETE: 'delete',
    SET_HOME: 'setHome',
} as const);

const defaultMenuItems = computed<DefaultMenuItems>(() => [
    { name: MENU.DELETE, label: i18n.t('DASHBOARDS.DETAIL.DELETE'), disabled: false },
    { name: MENU.SET_HOME, label: i18n.t('DASHBOARDS.DETAIL.SET_HOME'), disabled: false },
]);

const props = defineProps<DashboardMoreMenuProps>();

const state = reactive({
    moreMenuItems: computed(() => {
        const menuItems = cloneDeep(defaultMenuItems.value);
        if (state.homeDashboardId === props.dashboardId) {
            // below find() never be undefined
            menuItems.find((d) => d.name === MENU.DELETE)!.disabled = true;
            menuItems.find((d) => d.name === MENU.SET_HOME)!.disabled = true;
            return menuItems;
        }
        if (state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC && props.manageDisabled) {
            if (state.homeDashboardId === props.dashboardId) {
                // below find() never be undefined
                menuItems.find((d) => d.name === MENU.DELETE)!.disabled = true;
                menuItems.find((d) => d.name === MENU.SET_HOME)!.disabled = true;
            }
            menuItems.find((d) => d.name === MENU.DELETE)!.disabled = true;
            return menuItems;
        }
        return defaultMenuItems.value;
    }),
    // FIXME:: connect dashboardStore
    // homeDashboardId: computed<string|undefined>(() => costExplorerStore.getters.homeDashboardId),
    homeDashboardId: '',
    dashboardViewer: computed<DashboardViewer>(() => props.dashboardViewer),
});
const isProjectDashboard = props.dashboardId.startsWith('project');

const checkDeleteState = reactive({
    visible: false,
    headerTitle: i18n.t('DASHBOARDS.FORM.DELETE_TITLE'),
    loading: false,
});

const handleSelectMoreMenu = (item) => {
    if (item === MENU.SET_HOME && props.dashboardId) {
        // FIXME:: connect dashboardStore
        // costExplorerStore.dispatch('setHomeDashboard', props.dashboardId);
    } else if (item === MENU.DELETE) {
        checkDeleteState.visible = true;
    }
};

const handleDeleteDashboardConfirm = async () => {
    try {
        checkDeleteState.loading = true;
        if (isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.delete({
                project_dashboard_id: props.dashboardId,
            });
            await store.dispatch('dashboard/loadProjectDashboard');
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.delete({
                domain_dashboard_id: props.dashboardId,
            });
            await store.dispatch('dashboard/loadDomainDashboard');
        }
        await SpaceRouter.router.replace({ name: DASHBOARDS_ROUTE.ALL._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
    } finally {
        checkDeleteState.loading = false;
        checkDeleteState.visible = false;
    }
};

</script>

<style lang="postcss" scoped>
.p-select-dropdown {
    height: 2rem;
}
</style>
