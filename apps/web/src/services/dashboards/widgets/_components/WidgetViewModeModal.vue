<template>
    <div class="widget-view-mode-modal"
         :class="{ 'visible': props.visible }"
    >
        <div v-if="props.visible"
             class="modal-header"
        >
            <p-heading :title="dashboardDetailState.name"
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
                    {{ $t('DASHBOARDS.VIEW_MODE.EDIT_OPTION') }}
                </p-button>
            </div>
            <div class="filter-wrapper">
                <dashboard-variables-select-dropdown :is-manageable="false" />
            </div>
            <div v-if="state.component"
                 class="widget-wrapper"
            >
                <component :is="state.component"
                           ref="widgetRef"
                           :widget-key="widgetFormState.widgetInfo.widget_key"
                           :widget-config-id="widgetFormState.widgetInfo.widget_name"
                           :title="widgetFormState.widgetTitle"
                           :options="widgetFormState.widgetOptions"
                           :inherit-options="widgetFormState.inheritOptions"
                           size="full"
                           :theme="widgetFormState.theme"
                           :currency-rates="state.currencyRates"
                           :error-mode="dashboardDetailState.widgetValidMap[widgetFormState.widgetInfo.widget_key] === false"
                           :all-reference-type-info="state.allReferenceTypeInfo"
                           :disable-view-mode="true"
                           :initiated="state.initiated"
                />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { AsyncComponent, ComponentPublicInstance } from 'vue';
import {
    computed, reactive, toRef, watch,
} from 'vue';

import { PHeading, PIconButton, PButton } from '@spaceone/design-system';

import { store } from '@/store';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardVariablesSelectDropdown
    from '@/services/dashboards/shared/dashboard-variables/DashboardVariablesSelectDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';
import type {
    DashboardLayoutWidgetInfo, WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetComponent } from '@/services/dashboards/widgets/_helpers/widget-helper';

interface WidgetViewModeModalProps {
    visible: boolean;
}
type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

const props = withDefaults(defineProps<WidgetViewModeModalProps>(), {
    visible: false,
});

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const state = reactive({
    widgetRef: null as WidgetComponent|null,
    hasManagePermission: useManagePermissionState(),
    currencyRates: computed(() => store.state.settings.currencyRates),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
    component: null as AsyncComponent|null,
    initiated: false,
    variablesSnapshot: {} as DashboardVariables,
    variableSchemaSnapshot: {} as DashboardVariablesSchema,
});
const widgetRef = toRef(state, 'widgetRef');

/* Util */
const initSnapshot = () => {
    state.variablesSnapshot = dashboardDetailState.variables;
    state.variableSchemaSnapshot = dashboardDetailState.variablesSchema;
};
const initWidgetComponent = (widget: DashboardLayoutWidgetInfo) => {
    let component: AsyncComponent|null = null;
    try {
        component = getWidgetComponent(widget.widget_name);
    } catch (e) {
        console.error(e);
    }
    state.component = component;
};

const handleCloseModal = () => {
    dashboardDetailStore.$patch((_state) => {
        _state.variables = state.variablesSnapshot;
        _state.variablesSchema = state.variableSchemaSnapshot;
        _state.widgetViewModeModalVisible = false;
    });
};
const handleClickEditOption = () => {
    // TODO: open widget edit sidebar
    // store.dispatch('display/showWidget');
};

watch(() => props.visible, async (visible) => {
    if (visible) {
        initSnapshot();
        await widgetFormStore.initWidgetForm(widgetFormState.widgetKey as string);
        await initWidgetComponent(widgetFormState.widgetInfo as DashboardLayoutWidgetInfo);
        state.widgetRef?.initWidget();
        state.initiated = true;
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

        /* custom design-system component - p-heading */
        :deep(.p-heading) {
            min-width: 0;
            .heading-wrapper {
                width: 100%;
            }
            .title {
                @apply truncate;
                display: inline-block;
                width: calc(100% - 4rem);
            }
        }
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
            .dashboard-variables-select-dropdown {
                @apply relative flex items-center flex-wrap;
                gap: 0.5rem;
                z-index: 10;
            }
        }
    }
}
</style>
