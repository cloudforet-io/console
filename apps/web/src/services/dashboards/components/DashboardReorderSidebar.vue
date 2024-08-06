<script setup lang="ts">
import {
    computed,
    onUnmounted, reactive, watch,
} from 'vue';
import draggable from 'vuedraggable';

import {
    PI, PButton,
} from '@cloudforet/mirinae';

import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { store } from '@/store';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { WIDGET_COMPONENT_ICON_MAP } from '@/common/modules/widgets/_constants/widget-components-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


type WidgetModel = PublicWidgetModel | PrivateWidgetModel;
const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const state = reactive({
    widgetList: computed<WidgetModel[]>(() => {
        const results: WidgetModel[] = [];
        dashboardDetailState.dashboardLayouts.forEach((d) => {
            const _widgetIdList = d.widgets;
            _widgetIdList?.forEach((widgetId) => {
                const _widget = dashboardDetailState.dashboardWidgets.find((w) => w.widget_id === widgetId);
                const _config = getWidgetConfig(_widget?.widget_type);
                if (!_widget || !_config) return;
                results.push(_widget);
            });
        });
        return results;
    }),
});

/* Event */
const handleChangeWidgetOrder = async () => {
    const _widgetIdList = state.widgetList.map((w) => w.widget_id);
    const _updatedLayouts = [{ widgets: _widgetIdList }];
    await dashboardStore.updateDashboard(dashboardDetailState.dashboardId as string, {
        layouts: _updatedLayouts,
    });
    dashboardDetailStore.setDashboardLayouts(_updatedLayouts);
};
const getWidgetDefaultName = (widgetType: string): string => {
    const _config = getWidgetConfig(widgetType);
    return _config?.meta?.title || widgetType;
};

watch(() => dashboardDetailState.dashboardId, (after, before) => {
    if (after !== before) {
        store.dispatch('display/hideSidebar');
    }
});
onUnmounted(() => {
    store.dispatch('display/hideSidebar');
});
</script>

<template>
    <div class="dashboard-reorder-sidebar">
        <portal to="widget-title">
            <span class="sidebar-title">{{ $t('DASHBOARDS.DETAIL.EDIT_LAYOUT') }}</span> <br>
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
                        <p-i name="ic_drag-handle"
                             width="1rem"
                             height="1rem"
                        />
                        <div class="text-wrapper">
                            <p-i :name="WIDGET_COMPONENT_ICON_MAP[widget.widget_type]"
                                 width="1rem"
                                 height="1rem"
                            />
                            <span class="text"
                                  :class="{ 'text-gray-400': !widget.options?.widgetHeader?.title }"
                            >{{ widget.options?.widgetHeader?.title || getWidgetDefaultName(widget.widget_type) }}</span>
                        </div>
                    </div>
                </draggable>
            </div>
        </portal>
        <portal to="widget-footer">
            <div class="footer-wrapper">
                <p-button style-type="substitutive"
                          icon-left="ic_check"
                          @click="store.dispatch('display/hideSidebar')"
                >
                    {{ $t('DASHBOARDS.DETAIL.DONE_EDITING') }}
                </p-button>
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
    padding-bottom: 1.5rem;

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
            .text-wrapper {
                display: flex;
                gap: 0.25rem;
                .text {
                    @apply truncate;
                    width: 13rem;
                }
            }
        }
        .ghost {
            @apply bg-blue-200;
        }
    }
}
.footer-wrapper {
    @apply flex border-t border-gray-200 bg-white;
    width: 100%;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    .p-button {
        width: 100%;
    }
}
</style>
