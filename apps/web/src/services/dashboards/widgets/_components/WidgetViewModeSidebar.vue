<template>
    <div class="widget-view-mode-sidebar">
        <p-sidebar :visible="state.proxyVisible"
                   style-type="primary"
                   size="md"
                   is-fixed-size
                   hide-close-button
                   @close="handleCloseSidebar"
        >
            <main class="main">
                <slot />
            </main>
            <template #title>
                <span class="sidebar-title">{{ $t('DASHBOARDS.FULL_SCREEN_VIEW.EDIT_WIDGET_OPTION') }}</span> <br>
            </template>
            <template #sidebar>
                <div class="sidebar-contents">
                    <dashboard-widget-input-form :widget-config-id="props.widgetConfigId"
                                                 :widget-key="props.widgetKey"
                    />
                </div>
            </template>
            <template #footer>
                <div class="footer-wrapper">
                    <p-button style-type="transparent"
                              @click="handleCloseSidebar"
                    >
                        {{ $t('DASHBOARDS.FULL_SCREEN_VIEW.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!widgetFormState.isValid"
                              @click="handleClickSaveButton"
                    >
                        {{ $t('DASHBOARDS.FULL_SCREEN_VIEW.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-sidebar>
        <p-button-modal :visible.sync="state.nonInheritedOptionModalVisible"
                        :header-title="$t('DASHBOARDS.FULL_SCREEN_VIEW.APPLY_NON_INHERITED_OPTION')"
                        size="sm"
                        @confirm="handleClickSaveButton"
        >
            <template #body>
                <div class="non-inherited-option-modal-body">
                    <p>
                        <p-i name="ic_warning-filled"
                             color="inherit"
                             width="1rem"
                             height="1rem"
                             class="warning-icon"
                        />
                        <span>{{ $t('DASHBOARDS.FULL_SCREEN_VIEW.APPLY_NON_INHERITED_OPTION_HELP_TEXT') }}</span>
                    </p>
                </div>
            </template>
        </p-button-modal>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PButton, PSidebar, PButtonModal, PI,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardWidgetInputForm
    from '@/services/dashboards/shared/dashboard-widget-input-form/DashboardWidgetInputForm.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getNonInheritedWidgetOptions } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


interface Props {
    visible: boolean;
    widgetKey?: string;
    widgetConfigId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    widgetKey: undefined,
    widgetConfigId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'refresh'): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    nonInheritedOptionModalVisible: false,
    hasNonInheritedWidgetOptions: computed<boolean>(() => {
        const nonInheritedWidgetOptions = getNonInheritedWidgetOptions(widgetFormState.inheritOptions);
        return nonInheritedWidgetOptions.length > 0;
    }),
});

/* Util */
const updateDashboardWidgetStore = () => {
    // update widget info in dashboard detail store
    const widgetInfo = cloneDeep(widgetFormState.widgetInfo) as DashboardLayoutWidgetInfo;
    widgetInfo.title = widgetFormState.widgetTitle ?? '';
    widgetInfo.widget_options = widgetFormState.widgetOptions ?? {};
    widgetInfo.schema_properties = widgetFormState.schemaProperties ?? [];
    widgetInfo.inherit_options = widgetFormState.inheritOptions ?? {};
    dashboardDetailStore.updateWidgetInfo(props.widgetKey, widgetInfo);

    // update widget info in widget form store
    widgetFormStore.initWidgetForm(props.widgetKey);
};

/* Api */
const updateWidgetInfo = async () => {
    try {
        if (dashboardDetailStore.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                project_dashboard_id: dashboardDetailState.dashboardId,
                layouts: dashboardDetailState.dashboardWidgetInfoList,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                domain_dashboard_id: dashboardDetailState.dashboardId,
                layouts: dashboardDetailState.dashboardWidgetInfoList,
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Event */
const handleClickSaveButton = async () => {
    if (state.hasNonInheritedWidgetOptions && !state.nonInheritedOptionModalVisible) {
        state.nonInheritedOptionModalVisible = true;
        return;
    }
    updateDashboardWidgetStore();
    await updateWidgetInfo();
    state.proxyVisible = false;
    state.nonInheritedOptionModalVisible = false;
};
const handleCloseSidebar = () => {
    widgetFormStore.initWidgetForm(props.widgetKey);
    state.proxyVisible = false;
    emit('refresh');
};
</script>

<style lang="postcss" scoped>
.widget-view-mode-sidebar {
    .sidebar-title {
        margin-bottom: 0.75rem;
        font-size: 1.125rem;
        line-height: 125%;
    }
    .sidebar-contents {
        position: relative;
        gap: 1.5rem;
        font-size: 0.875rem;
        line-height: 125%;
    }
    .footer-wrapper {
        @apply grid grid-cols-12 border-t border-gray-200;
        position: absolute;
        bottom: 0;
        width: 100%;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        button {
            @apply col-span-6;
        }
    }
    .non-inherited-option-modal-body {
        .warning-icon {
            margin-right: 0.25rem;
        }
    }
}

$footer-height: 57px;

/* custom design-system component - p-sidebar */
:deep(.p-sidebar) {
    .sidebar-wrapper {
        height: 100%;
        padding-top: 0;
        padding-bottom: $footer-height;
        .inner {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
    }
}
</style>
