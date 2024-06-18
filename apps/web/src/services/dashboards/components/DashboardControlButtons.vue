<script setup lang="ts">
import { reactive } from 'vue';

import { PButton } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DashboardLayout } from '@/schema/dashboard/_types/dashboard-type';
import type { PrivateWidgetCreateParameters } from '@/schema/dashboard/private-widget/api-verbs/create';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetCreateParameters } from '@/schema/dashboard/public-widget/api-verbs/create';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { store } from '@/store';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


const widgetGenerateStore = useWidgetGenerateStore();
const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const state = reactive({
    loading: false,
});

/* Util */
const addWidgetToDashboardLayouts = (createdWidgetId: string): DashboardLayout[] => {
    const _layouts = cloneDeep(dashboardDetailState.dashboardInfo?.layouts || []);
    if (_layouts.length) {
        const _targetLayout = _layouts[0];
        if (_targetLayout.widgets) {
            _targetLayout.widgets.unshift(createdWidgetId);
        } else {
            _targetLayout.widgets = [createdWidgetId];
        }
        _layouts[0] = _targetLayout;
    } else {
        _layouts.push({
            widgets: [createdWidgetId],
        });
    }
    return _layouts;
};

/* Api */
const createWidget = async (): Promise<PublicWidgetModel|PrivateWidgetModel|null> => {
    const isPrivate = dashboardDetailState.dashboardId?.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.create<PrivateWidgetCreateParameters, PrivateWidgetModel>
        : SpaceConnector.clientV2.dashboard.publicWidget.create<PublicWidgetCreateParameters, PublicWidgetModel>;
    try {
        return await fetcher({
            dashboard_id: dashboardDetailState.dashboardId as string,
            tags: { created_by: store.state.user.userId },
            widget_type: 'table',
            size: 'full',
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};
const updateDashboardLayouts = async (layouts: DashboardLayout[]): Promise<DashboardModel|null> => {
    try {
        return await dashboardStore.updateDashboard(dashboardDetailState.dashboardId as string, {
            dashboard_id: dashboardDetailState.dashboardId,
            layouts,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

/* Event */
const handleAddWidget = async () => {
    state.loading = true;
    const createdWidget = await createWidget();
    if (createdWidget) {
        const newDashboardLayouts = addWidgetToDashboardLayouts(createdWidget.widget_id);
        const dashboardUpdated = await updateDashboardLayouts(newDashboardLayouts);
        if (dashboardUpdated) {
            dashboardDetailStore.setDashboardLayouts(newDashboardLayouts);
        }
        widgetGenerateStore.setWidgetForm(createdWidget);
        widgetGenerateStore.setShowOverlay(true);
    }
    state.loading = false;
};
const handleClickWidgetReorder = () => {
    if (store.state.display.visibleSidebar) {
        store.dispatch('display/hideSidebar');
    } else {
        store.dispatch('display/showWidget');
    }
};
</script>

<template>
    <div class="dashboard-control-buttons">
        <p-button icon-left="ic_plus"
                  style-type="tertiary"
                  size="sm"
                  :loading="state.loading"
                  @click="handleAddWidget"
        >
            {{ $t('DASHBOARDS.DETAIL.ADD_WIDGET') }}
        </p-button>
        <p-button :icon-left="store.state.display.visibleSidebar ? 'ic_check' : 'ic_edit'"
                  :style-type="store.state.display.visibleSidebar ? 'substitutive' : 'tertiary'"
                  size="sm"
                  @click="handleClickWidgetReorder"
        >
            {{ store.state.display.visibleSidebar ? $t('DASHBOARDS.DETAIL.DONE_EDITING') : $t('DASHBOARDS.DETAIL.WIDGET_REORDER') }}
        </p-button>
    </div>
</template>

<style lang="postcss">
.dashboard-control-buttons {
    @apply flex justify-end;
    gap: 0.75rem;
}
</style>
