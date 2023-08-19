<template>
    <transition name="slide-up">
        <div v-show="props.visible"
             class="widget-view-mode-modal"
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
            <transition name="slide-left">
                <widget-view-mode-sidebar v-if="state.sidebarVisible"
                                          v-model:visible="state.sidebarVisible"
                                          :widget-config-id="widgetFormState.widgetConfigId"
                                          :widget-key="widgetFormState.widgetKey"
                                          @refresh="handleRefreshWidget"
                />
            </transition>
        </div>
    </transition>
</template>
<script setup lang="ts">
import {
    PButton, PBadge, PI,
} from '@spaceone/design-system';
import { cloneDeep, isEqual } from 'lodash';
import type { AsyncComponent, ComponentPublicInstance } from 'vue';
import {
    computed, reactive, toRef, watch,
} from 'vue';


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
        await initWidgetComponent(widgetFormState.widgetInfo as DashboardLayoutWidgetInfo);
        state.widgetRef?.initWidget();
        state.initiated = true;
    } else {
        state.sidebarVisible = false;
        emit('refresh-widget', widgetFormState.widgetKey as string);
    }
});
watch([() => widgetFormState.inheritOptions, () => widgetFormState.widgetOptions], async (after, before) => {
    if (!state.initiated) return;
    if (isEqual(after[0], before[0]) && isEqual(after[1], before[1])) return;
    await state.widgetRef?.refreshWidget();
}, { immediate: false });
</script>

<style lang="postcss" scoped>
.widget-view-mode-modal {
    @apply bg-gray-100;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    .content-wrapper {
        overflow: auto;
        padding: 0 2rem 2rem;
    }

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

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}
.slide-left-leave-active,
.slide-left-enter-active {
    transition: all 0.3s ease;
}
.slide-left-enter {
    transform: translate(100%, 0);
}
.slide-left-leave-to {
    transform: translate(100%, 0);
}
</style>
