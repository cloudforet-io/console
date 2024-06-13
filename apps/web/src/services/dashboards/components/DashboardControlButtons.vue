<script setup lang="ts">
import { reactive } from 'vue';

import { PButton } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DashboardLayout } from '@/schema/dashboard/_types/dashboard-type';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicWidgetCreateParameters } from '@/schema/dashboard/public-widget/api-verbs/create';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const widgetGenerateStore = useWidgetGenerateStore();
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
    } else {
        _layouts.push({
            widgets: [createdWidgetId],
        });
    }
    return _layouts;
};

/* Api */
const createWidget = async (): Promise<PublicWidgetModel|null> => {
    try {
        return await SpaceConnector.clientV2.dashboard.publicWidget.create<PublicWidgetCreateParameters, PublicWidgetModel>({
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
const updateDashboardLayouts = async (createdWidgetId: string): Promise<PublicDashboardModel|null> => {
    try {
        const _layouts = addWidgetToDashboardLayouts(createdWidgetId);
        return await SpaceConnector.clientV2.dashboard.publicDashboard.update({
            dashboard_id: dashboardDetailState.dashboardId as string,
            layouts: _layouts,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

const handleAddWidget = async () => {
    state.loading = true;
    const createdWidget = await createWidget();
    if (createdWidget) {
        await updateDashboardLayouts(createdWidget?.widget_id as string);
        widgetGenerateStore.initWidgetForm(createdWidget);
        widgetGenerateStore.setShowOverlay(true);
    }
    state.loading = false;
};
const handleClickWidgetReorder = () => {
    // TODO
};
</script>

<template>
    <div class="dashboard-control-buttons">
        <p-button icon-left="ic_plus"
                  style-type="substitutive"
                  :loading="state.loading"
                  @click="handleAddWidget"
        >
            Add Widget
        </p-button>
        <p-button icon-left="ic_duplicate"
                  style-type="secondary"
                  @click="handleClickWidgetReorder"
        >
            Widget Reorder
        </p-button>
    </div>
</template>

<style lang="postcss">
.dashboard-control-buttons {
    @apply flex justify-end;
    gap: 0.75rem;
}
</style>
