<script setup lang="ts">
import {
    onUnmounted, reactive, watch,
} from 'vue';
import draggable from 'vuedraggable';

import {
    PI,
} from '@spaceone/design-system';

import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { store } from '@/store';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const state = reactive({
    widgetList: [] as Array<PublicWidgetModel|PrivateWidgetModel>,
});

/* Event */
const handleChangeWidgetOrder = () => {
    // HACK: implement widget panel
    const _widgetIdList = state.widgetList.map((w) => w.widget_id);
    dashboardDetailStore.updateDashboard(dashboardDetailState.dashboardId, {
        layouts: [{ widgets: _widgetIdList }],
    });
};

/* Util */
const getDashboardWidgetList = (): Array<PublicWidgetModel|PrivateWidgetModel> => {
    const widgetList: Array<PublicWidgetModel|PrivateWidgetModel> = [];
    dashboardDetailState.dashboardLayouts.forEach((d) => {
        const _widgetIdList = d.widgets;
        _widgetIdList?.forEach((widgetId) => {
            const _widget = dashboardDetailState.dashboardWidgets.find((w) => w.widget_id === widgetId);
            widgetList.push(_widget as PublicWidgetModel|PrivateWidgetModel);
        });
    });
    return widgetList;
};

watch(() => store.state.display.visibleSidebar, (visible) => {
    if (visible) {
        state.widgetList = getDashboardWidgetList();
    }
});
onUnmounted(() => {
    store.dispatch('display/hideSidebar');
});
</script>

<template>
    <div class="dashboard-reorder-sidebar">
        <portal to="widget-title">
            <span class="sidebar-title">{{ $t('DASHBOARDS.DETAIL.WIDGET_REORDER') }}</span> <br>
        </portal>
        <portal to="widget-contents">
            <div class="sidebar-contents">
                <draggable class="draggable-wrapper"
                           ghost-class="ghost"
                           :list="state.widgetList"
                           @change="handleChangeWidgetOrder"
                >
                    <div v-for="(widget, idx) in state.widgetList"
                         :key="`drag-item-${widget.widget_id}-${idx}`"
                         class="draggable-item"
                    >
                        <span>
                            <p-i name="ic_drag-handle"
                                 width="1rem"
                                 height="1rem"
                            /></span>
                        <span class="text">{{ widget.name }}</span>
                    </div>
                </draggable>
            </div>
        </portal>
    </div>
</template>

<style lang="postcss" scoped>
.sidebar-title {
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
    line-height: 125%;
}

.sidebar-contents {
    position: relative;
    gap: 1.5625rem;
    font-size: 0.875rem;
    line-height: 125%;

    .draggable-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-bottom: 1rem;
        .draggable-item {
            @apply border border-gray-200 rounded bg-white;
            display: flex;
            gap: 0.5rem;
            cursor: grab;
            padding: 0.5rem;
            &:active {
                cursor: grabbing;
            }
            .text {
                @apply truncate;
            }
        }
        .ghost {
            @apply bg-blue-200;
        }
    }
}
.footer-wrapper {
    @apply flex border-t border-gray-200;
    width: 100%;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    .p-button {
        width: 100%;
    }
}
</style>
