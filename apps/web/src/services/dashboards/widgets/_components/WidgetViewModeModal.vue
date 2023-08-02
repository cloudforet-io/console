<template>
    <div class="widget-view-mode-modal"
         :class="{ 'visible': props.visible }"
    >
        <div class="modal-content">
            <div v-if="props.visible"
                 class="modal-header"
            >
                <p-heading :title="dashboardDetailState.name"
                           @click-back-button="handleCloseModal"
                />
                <p-icon-button name="ic_close"
                               class="close-button"
                               @click="handleCloseModal"
                />
            </div>
            <widget-view-mode-sidebar :widget-config-id="widgetFormState.widgetConfigId"
                                      :widget-key="widgetFormState.widgetKey"
                                      :visible.sync="state.sidebarVisible"
            >
                <div class="content-wrapper">
                    <div class="edit-button-wrapper">
                        <p-button icon-left="ic_edit"
                                  size="md"
                                  style-type="tertiary"
                                  :disabled="!state.hasManagePermission"
                                  class="edit-button"
                                  @click="handleClickEditOption"
                        >
                            {{ $t('DASHBOARDS.VIEW_MODE.EDIT_OPTION') }}
                        </p-button>
                    </div>
                    <div class="filter-wrapper">
                        <div class="left-part">
                            <dashboard-variables-select-dropdown :is-manageable="false"
                                                                 disable-save-button
                                                                 :origin-variables="state.variablesSnapshot"
                                                                 :origin-variables-schema="state.variableSchemaSnapshot"
                            />
                        </div>
                        <div class="right-part">
                            <dashboard-toolset />
                        </div>
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
            </widget-view-mode-sidebar>
        </div>
        <div class="modal-backdrop"
             :class="{ 'visible': props.visible }"
        />
    </div>
</template>
<script setup lang="ts">
import type { AsyncComponent, ComponentPublicInstance } from 'vue';
import {
    computed, reactive, toRef, watch,
} from 'vue';

import { PHeading, PIconButton, PButton } from '@spaceone/design-system';
import { cloneDeep, isEqual } from 'lodash';

import { store } from '@/store';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import type { DashboardSettings, DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardToolset from '@/services/dashboards/shared/dashboard-toolset/DashboardToolset.vue';
import DashboardVariablesSelectDropdown
    from '@/services/dashboards/shared/dashboard-variables/DashboardVariablesSelectDropdown.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';
import WidgetViewModeSidebar from '@/services/dashboards/widgets/_components/WidgetViewModeSidebar.vue';
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
const emit = defineEmits<{(e: 'refresh-widget', widgetKey: string): void}>();

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
    settingsSnapshot: {} as DashboardSettings,
    sidebarVisible: false,
});
const widgetRef = toRef(state, 'widgetRef');

/* Util */
const initSnapshot = () => {
    state.variablesSnapshot = cloneDeep(dashboardDetailState.variables);
    state.variableSchemaSnapshot = cloneDeep(dashboardDetailState.variablesSchema);
    state.settingsSnapshot = cloneDeep(dashboardDetailState.settings);
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
        _state.settings = state.settingsSnapshot;
        _state.widgetViewModeModalVisible = false;
    });
};
const handleClickEditOption = () => {
    state.sidebarVisible = true;
};

watch(() => props.visible, async (visible) => {
    if (visible) {
        initSnapshot();
        await widgetFormStore.initWidgetForm(widgetFormState.widgetKey as string);
        await initWidgetComponent(widgetFormState.widgetInfo as DashboardLayoutWidgetInfo);
        setTimeout(() => {
            state.widgetRef?.initWidget(); // NOTE: wait 0.4s for modal animation
        }, 400);
        state.initiated = true;
    } else {
        state.sidebarVisible = false;
        emit('refresh-widget', widgetFormState.widgetKey as string);
    }
});
watch([() => widgetFormState.inheritOptions, () => widgetFormState.widgetInfo?.widget_options.filters], async ([_inheritOptions, _filters]) => {
    if (!state.initiated) return;
    if (isEqual(_inheritOptions, widgetFormState.widgetInfo?.inherit_options)
        && isEqual(_filters, widgetFormState.widgetInfo?.widget_options.filters)) return;
    await state.widgetRef?.refreshWidget();
}, { immediate: false });
</script>

<style lang="postcss" scoped>
.widget-view-mode-modal {
    &.visible {
        .modal-content {
            transform: scale(1, 1);
        }
        .modal-backdrop {
            display: block;
        }
    }
    .modal-content {
        @apply bg-white;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        transition: all 0.4s ease-in-out;
        transform: scale(0);

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
            overflow: auto;
            padding: 0 2rem 2rem 2rem;
            .edit-button-wrapper {
                @apply border-b border-gray-200;
                width: 100%;
                text-align: right;
                padding: 1.5rem 0;
            }
            .filter-wrapper {
                padding: 1rem 0;
                .left-part {
                    display: inline-block;
                    padding-bottom: 0.75rem;
                }
                .right-part {
                    display: inline-block;
                    float: right;
                    padding-bottom: 0.75rem;
                }
                .dashboard-variables-select-dropdown {
                    @apply relative flex items-center flex-wrap;
                    gap: 0.5rem;
                    z-index: 10;
                }
            }
        }
    }
    .modal-backdrop {
        @apply bg-gray-900;
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99;
        opacity: 0.4;
    }
}
</style>
