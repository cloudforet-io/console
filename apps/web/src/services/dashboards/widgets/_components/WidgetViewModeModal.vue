<template>
    <div class="widget-view-mode-modal"
         :class="{ 'visible': state.proxyVisible }"
    >
        <div v-if="state.proxyVisible"
             class="modal-header"
        >
            <p-heading :title="state.widget?.title ?? ''"
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
                <dashboard-variables-selector :is-manageable="false" />
            </div>
            <div v-if="state.widget"
                 class="widget-wrapper"
            >
                <component :is="state.component"
                           :id="state.widget.widget_key"
                           :key="state.widget.widget_key"
                           ref="widgetRef"
                           :widget-config-id="state.widget.widget_name"
                           :widget-key="state.widget.widget_key"
                           :title="state.widget.title"
                           :options="state.widget.widget_options"
                           :inherit-options="state.widget.inherit_options"
                           size="full"
                           :theme="props.theme"
                           :dashboard-variables="dashboardDetailState.variables"
                           :dashboard-variables-schema="dashboardDetailState.variablesSchema"
                           :dashboard-settings="dashboardDetailState.settings"
                           :currency-rates="state.currencyRates"
                           :error-mode="dashboardDetailState.widgetValidMap[state.widget.widget_key] === false"
                           :all-reference-type-info="state.allReferenceTypeInfo"
                           :disable-view-mode="true"
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
import { flattenDeep } from 'lodash';

import { store } from '@/store';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardVariablesSelector from '@/services/dashboards/modules/DashboardVariablesSelector.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { DashboardLayoutWidgetInfo, WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';
import { getWidgetComponent } from '@/services/dashboards/widgets/_helpers/widget-helper';


interface WidgetViewModeModalProps {
    visible: boolean;
    widgetKey: string;
    theme?: WidgetTheme;
}
type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

const props = withDefaults(defineProps<WidgetViewModeModalProps>(), {
    visible: false,
    theme: undefined,
});
const emit = defineEmits(['update:visible']);

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    widgetRef: null as WidgetComponent|null,
    proxyVisible: useProxyValue('visible', props, emit),
    hasManagePermission: useManagePermissionState(),
    currencyRates: computed(() => store.state.display.currencyRates),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
    widget: computed<DashboardLayoutWidgetInfo|undefined>(() => {
        const _dashboardWidgetInfoList = flattenDeep(dashboardDetailState.dashboardWidgetInfoList ?? []);
        return _dashboardWidgetInfoList.find((w) => w.widget_key === props.widgetKey);
    }),
    component: null as AsyncComponent|null,
    variablesSnapshot: {},
    variableSchemaSnapshot: {},
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
    state.proxyVisible = false;
    dashboardDetailStore.$patch({
        variables: state.variablesSnapshot,
        variablesSchema: state.variableSchemaSnapshot,
    });
};
const handleClickEditOption = () => {
    // TODO: open widget edit sidebar
    // store.dispatch('display/showWidget');
};

watch(() => props.visible, (visible) => {
    if (visible) initSnapshot();
}, { immediate: true });
watch(() => state.widget, (widget) => {
    if (widget) initWidgetComponent(widget);
}, { immediate: true });
watch(() => state.widgetRef, (_widgetRef) => {
    if (_widgetRef) {
        const prevData = dashboardDetailState.widgetDataMap[props.widgetKey];
        _widgetRef.initWidget(prevData);
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
            .dashboard-variable-selector {
                @apply relative flex items-center flex-wrap;
                gap: 0.5rem;
            }
        }
    }
}
</style>
