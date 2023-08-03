<template>
    <div class="widget-view-mode-modal"
         :class="{ 'visible': props.visible }"
    >
        <div class="modal-content">
            <widget-view-mode-sidebar :widget-config-id="widgetFormState.widgetConfigId"
                                      :widget-key="widgetFormState.widgetKey"
                                      :visible.sync="state.sidebarVisible"
                                      @refresh="handleRefreshWidget"
            >
                <div class="content-wrapper">
                    <div class="top-wrapper">
                        <p-button icon-left="ic_arrow-left"
                                  style-type="transparent"
                                  size="lg"
                                  @click="handleCloseModal"
                        >
                            {{ $t('DASHBOARDS.FULL_SCREEN_VIEW.BACK_TO_DASHBOARD') }}
                        </p-button>
                        <div class="right">
                            <template v-if="state.hasNonInheritedWidgetOptions">
                                <p-i name="ic_warning-filled"
                                     width="1rem"
                                     height="1rem"
                                     :color="gray[700]"
                                />
                                <p-badge badge-type="subtle"
                                         style-type="primary3"
                                         class="non-inherit-badge"
                                >
                                    <span class="text">
                                        {{ $t('DASHBOARDS.FULL_SCREEN_VIEW.NON_INHERIT_OPTION_APPLIED') }}
                                    </span>
                                </p-badge>
                            </template>
                            <p-button icon-left="ic_edit"
                                      size="md"
                                      style-type="tertiary"
                                      :disabled="!state.hasManagePermission || state.sidebarVisible"
                                      class="edit-button"
                                      @click="handleClickEditOption"
                            >
                                {{ $t('DASHBOARDS.FULL_SCREEN_VIEW.EDIT_OPTION') }}
                            </p-button>
                        </div>
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

import {
    PButton, PBadge, PI,
} from '@spaceone/design-system';
import { cloneDeep, isEqual } from 'lodash';

import { store } from '@/store';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { gray } from '@/styles/colors';

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
import { getNonInheritedWidgetOptions } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


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
    hasNonInheritedWidgetOptions: computed<boolean>(() => {
        const nonInheritedWidgetOptions = getNonInheritedWidgetOptions(widgetFormState?.widgetInfo?.inherit_options);
        return nonInheritedWidgetOptions.length > 0;
    }),
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
const handleRefreshWidget = () => {
    state.widgetRef?.refreshWidget();
};

watch(() => props.visible, async (visible) => {
    if (visible) {
        initSnapshot();
        await widgetFormStore.initWidgetForm(widgetFormState.widgetKey as string);
        setTimeout(async () => {
            // NOTE: wait 0.4s for modal animation
            await initWidgetComponent(widgetFormState.widgetInfo as DashboardLayoutWidgetInfo);
            state.widgetRef?.initWidget();
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
        @apply bg-gray-100;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        transition: all 0.4s ease-in-out;
        transform: scale(0);

        .content-wrapper {
            overflow: auto;
            padding: 0 2rem 2rem 2rem;
            .top-wrapper {
                @apply border-b border-gray-200;
                display: flex;
                width: 100%;
                padding: 1.5rem 0;
                .right {
                    display: flex;
                    align-items: center;
                    margin-left: auto;
                    .non-inherit-badge {
                        margin-left: 0.25rem;
                        margin-right: 0.5rem;
                    }
                }
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
