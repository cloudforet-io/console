<template>
    <div class="widget-view-mode-modal"
         :class="{ 'visible': props.visible }"
    >
        <div v-if="props.visible"
             class="modal-header"
        >
            <p-heading :title="state.widgetInfo?.title ?? ''"
                       show-back-button
                       @click-back-button="handleCloseModal"
            />
            <p-icon-button name="ic_close"
                           class="close-button"
                           @click="handleCloseModal"
            />
        </div>
        <div class="content-wrapper">
            <div class="edit-button-wrapper">
                <p-button icon-left="ic_edit"
                          size="sm"
                          style-type="tertiary"
                          :disabled="!state.hasManagePermission"
                          class="edit-button"
                          @click="handleClickEditOption"
                >
                    {{ $t('DASHBOARDS.WIDGET.VIEW_MODE.EDIT_OPTION') }}
                </p-button>
            </div>
            <div class="filter-wrapper">
                <dashboard-variables-selector :is-manageable="false" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PHeading, PIconButton, PButton } from '@spaceone/design-system';
import { flattenDeep } from 'lodash';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import DashboardVariablesSelector from '@/services/dashboards/modules/DashboardVariablesSelector.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';


interface WidgetViewModeModalProps {
    visible: boolean;
    selectedWidgetKey: string;
}

const props = withDefaults(defineProps<WidgetViewModeModalProps>(), {
    visible: false,
});
const emit = defineEmits(['update:visible']);

const dashboardDetailInfoStore = useDashboardDetailInfoStore();
const dashboardDetailInfoState = dashboardDetailInfoStore.$state;
const state = reactive({
    hasManagePermission: useManagePermissionState(),
    widgetInfo: computed<DashboardLayoutWidgetInfo | undefined>(() => {
        const _dashboardWidgetInfoList = flattenDeep(dashboardDetailInfoState.dashboardWidgetInfoList ?? []);
        return _dashboardWidgetInfoList.find((w) => w.widget_key === props.selectedWidgetKey);
    }),
    variablesSnapshot: {},
    variableSchemaSnapshot: {},
});

const handleCloseModal = () => {
    emit('update:visible', false);
    // TODO: reset variables, variable schema
};
const handleClickEditOption = () => {
    // TODO: open widget edit sidebar
};

watch(() => props.visible, (visible) => {
    if (visible) {
        state.variablesSnapshot = dashboardDetailInfoState.variables;
        state.variableSchemaSnapshot = dashboardDetailInfoState.variablesSchema;
    }
});
</script>
<style lang="postcss" scoped>
.widget-view-mode-modal {
    @apply bg-white;
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    transition: all 0.2s ease-in-out;
    transform: scale(1);
    &.visible {
        display: block;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        height: 6rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
        padding: 2rem;
    }
    .content-wrapper {
        @apply bg-gray-100;
        height: calc(100% - 6rem);
        padding: 0 2rem 2rem 2rem;
        .edit-button-wrapper {
            @apply border-b border-gray-200;
            width: 100%;
            text-align: right;
            padding: 1.5rem 0;
        }
        .filter-wrapper {
            padding: 1rem 0;
            .dashboard-variable-selector {
                @apply relative flex items-center flex-wrap;
                gap: 0.5rem;
            }
        }
    }
}
</style>
