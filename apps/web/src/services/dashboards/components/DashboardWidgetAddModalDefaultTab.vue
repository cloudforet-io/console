<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PButtonTab, PLazyImg } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { flattenDeep } from 'lodash';

import type { DashboardLayoutWidgetInfo } from '@/schema/dashboard/_types/dashboard-type';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import DashboardWidgetForm from '@/services/dashboards/components/DashboardWidgetForm.vue';
import { DASHBOARD_TEMPLATES } from '@/services/dashboards/dashboard-template/template-list';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import { CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/_constants/widget-config-list-constant';

interface TemplateWidgetConfig extends WidgetConfig {
    template_widget_id?: string
}


const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const state = reactive({
    widgets: computed(() => getWidgetConfigsByLabel(tabState.activeTab)),
    selectedWidgetConfigId: undefined as string | undefined,
    selectedTemplateWidgetId: undefined as string | undefined,
});
const tabState = reactive({
    tabs: computed<TabItem[]>(() => [
        { name: 'all', label: `${i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_ALL')} (${getWidgetConfigsByLabel('all').length})` },
        { name: 'Cost', label: `${i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_COST')} (${getWidgetConfigsByLabel('Cost').length})` },
        { name: 'Asset', label: `${i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_ASSET')} (${getWidgetConfigsByLabel('Asset').length})` },
        { name: 'Alert', label: `${i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_ALERT')} (${getWidgetConfigsByLabel('Alert').length})` },
    ]),
    activeTab: 'all' as string,
});

/* Util */
const getWidgetConfigsByLabel = (label: string): Array<Partial<TemplateWidgetConfig>> => {
    const _allWidgetConfigs = Object.values(CONSOLE_WIDGET_CONFIGS);
    const _templateId = dashboardDetailState.templateId;
    if (_templateId === 'blank') {
        if (label === 'all') return _allWidgetConfigs;
        return _allWidgetConfigs.filter((config) => config.labels?.includes(label));
    }

    const _templateWidgets: DashboardLayoutWidgetInfo[] = flattenDeep(DASHBOARD_TEMPLATES[_templateId].layouts.map((layout) => layout.widgets || []));
    const _templateWidgetConfig: Partial<TemplateWidgetConfig>[] = _templateWidgets.map((widget) => {
        const _widgetConfig = _allWidgetConfigs.find((config) => config.widget_config_id === widget.widget_name);
        return {
            ..._widgetConfig,
            title: widget.title || _widgetConfig?.title || '',
            template_widget_id: widget.template_widget_id,
        };
    });

    if (label === 'all') return _templateWidgetConfig;
    return _templateWidgetConfig.filter((config) => config.labels?.includes(label));
};

/* Event */
const handleChangeTab = (selectedTab: string) => {
    tabState.activeTab = selectedTab;
    state.selectedWidgetConfigId = undefined;
    state.selectedTemplateWidgetId = undefined;
};
const selectWidget = (widgetConfigId?: string, templateWidgetId?: string) => {
    state.selectedWidgetConfigId = widgetConfigId;
    state.selectedTemplateWidgetId = templateWidgetId;
};
</script>

<template>
    <div class="dashboard-default-widget-tab">
        <div class="left-area">
            <p-button-tab :tabs="tabState.tabs"
                          :active-tab="tabState.activeTab"
                          @change="handleChangeTab"
            />
            <ul class="widget-list">
                <li v-for="widget in state.widgets"
                    :key="`card-${widget.widget_config_id}`"
                    class="widget-card"
                    :class="{'selected' : state.selectedWidgetConfigId === widget.widget_config_id}"
                    @click="selectWidget(widget.widget_config_id, widget.template_widget_id)"
                >
                    <div class="card-header">
                        {{ widget.title }}
                    </div>
                    <div class="card-content">
                        <p-lazy-img :src="`/images/widgets/${widget.description?.preview_image}`"
                                    class="preview-img"
                                    height="4.75rem"
                                    width="100%"
                        >
                            <template #error>
                                <img src="/images/widgets/widget-img_default--thumbnail.png">
                            </template>
                        </p-lazy-img>
                    </div>
                </li>
            </ul>
        </div>
        <div id="dashboard-widget-option"
             class="right-area"
        >
            <div v-if="!state.selectedWidgetConfigId && !state.selectedTemplateWidgetId"
                 class="no-selected-wrapper"
            >
                <span class="title">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NO_SELECTED') }}</span>
                <span class="text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NO_SELECTED_HELP_TEXT') }}</span>
            </div>
            <dashboard-widget-form v-else
                                   :widget-config-id="state.selectedWidgetConfigId"
                                   :template-widget-id="state.selectedTemplateWidgetId"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-default-widget-tab {
    display: flex;
    width: 100%;
    height: inherit;

    /* custom design-system component - p-button-tab */
    :deep(.p-button-tab) {
        .button-group {
            margin-left: 0;
            button:first-child {
                margin-left: 0;
            }
        }
        .tab-pane {
            display: none;
        }
    }
    .left-area {
        @apply flex flex-col flex-grow flex-shrink border-r border-gray-200;
        .widget-list {
            @apply grid grid-cols-3 gap-2;
            overflow: auto;
            padding-right: 1.25rem;
            .widget-card {
                @apply flex flex-col overflow-hidden border border-gray-300 rounded-md cursor-pointer;
                height: 9.125rem;

                &.selected {
                    @apply border border-blue-600;
                    .card-header {
                        @apply text-blue-600;
                    }
                }
                .card-header {
                    @apply flex items-center flex-grow;
                    font-size: 0.875rem;
                    height: 3.125rem;
                    padding: 1rem;
                }
                .card-content {
                    @apply flex justify-center items-center bg-gray-100;
                    height: 5.875rem;

                    /* custom design-system component - p-lazy-img */
                    :deep(.preview-img) {
                        .img-container {
                            display: flex;
                            justify-content: center;
                            width: 100%;

                            img {
                                width: auto !important;
                            }
                        }
                    }
                }
            }
        }
    }
    .right-area {
        @apply overflow-auto flex-shrink-0;
        width: 20rem;
        height: inherit;
        padding: 1.25rem 1.25rem 0 1.25rem;
        .no-selected-wrapper {
            @apply flex flex-col justify-center items-center;
            height: 100%;
            font-size: 0.875rem;
            text-align: center;
            .title {
                @apply text-primary-2;
                padding-bottom: 0.75rem;
            }
            .text {
                @apply text-gray-600;
            }
        }
    }
}
</style>
