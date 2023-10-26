<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core';
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PSidebar, PButtonModal, PI,
} from '@spaceone/design-system';
import { isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { getUUID } from '@/lib/component-util/getUUID';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardWidgetForm
    from '@/services/dashboards/shared/dashboard-widget-input-form/DashboardWidgetForm.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { UpdatableWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getNonInheritedWidgetOptionsAmongUsedVariables } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


interface Props {
    widgetKey?: string;
    widgetConfigId?: string;
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    widgetKey: undefined,
    widgetConfigId: undefined,
});
const emit = defineEmits<{(e: 'close', save: boolean): void;
    (e: 'update:widget-info', widgetInfo: UpdatableWidgetInfo): void;
    (e: 'update:has-non-inherited-widget-options', value: boolean): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;
const state = reactive({
    nonInheritedOptionModalVisible: false,
    hasNonInheritedWidgetOptions: computed<boolean>(() => {
        const nonInheritedWidgetOptions = getNonInheritedWidgetOptionsAmongUsedVariables(
            dashboardDetailState.variablesSchema,
            widgetFormState.inheritOptions,
            widgetFormState.schemaProperties,
        );
        return nonInheritedWidgetOptions.length > 0;
    }),
    contextKey: getUUID(),
});

/* Util */
const updateDashboardWidgetStore = () => {
    // update widget info in dashboard detail store
    if (widgetFormStore.updatedWidgetInfo) dashboardDetailStore.updateWidgetInfo(props.widgetKey, widgetFormStore.updatedWidgetInfo);
};

/* Api */
const updateWidgetInfo = async () => {
    try {
        if (dashboardDetailStore.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                project_dashboard_id: dashboardDetailState.dashboardId,
                layouts: [dashboardDetailState.dashboardWidgetInfoList],
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                domain_dashboard_id: dashboardDetailState.dashboardId,
                layouts: [dashboardDetailState.dashboardWidgetInfoList],
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
    state.nonInheritedOptionModalVisible = false;
    emit('close', true);
};
const handleCloseSidebar = () => {
    emit('close', false);
};

debouncedWatch(() => widgetFormStore.updatedWidgetInfo, (after, before) => {
    if (before === undefined || isEqual(after, before)) return;
    emit('update:widget-info', after as UpdatableWidgetInfo);
}, { debounce: 150 });

watch(() => state.hasNonInheritedWidgetOptions, (value) => {
    emit('update:has-non-inherited-widget-options', value);
}, { immediate: true });

watch(() => props.visible, (value) => {
    if (value) state.contextKey = getUUID();
});
</script>

<template>
    <div class="widget-view-mode-sidebar">
        <p-sidebar :visible="true"
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
                    <dashboard-widget-form :key="state.contextKey"
                                           :widget-config-id="props.widgetConfigId"
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
                        :header-title="$t('DASHBOARDS.FULL_SCREEN_VIEW.NON_INHERITED_OPTIONS_INCLUDED')"
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

<style lang="postcss" scoped>
.widget-view-mode-sidebar {
    position: absolute;
    width: 20rem;
    top: 0;
    right: 0;
    z-index: 10;

    .sidebar-title {
        @apply text-label-xl;
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
            padding-top: 2rem;
            padding-bottom: 1rem;
        }
    }
}
</style>
