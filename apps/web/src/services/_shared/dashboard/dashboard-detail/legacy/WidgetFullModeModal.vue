<script setup lang="ts">
import type { AsyncComponent, ComponentPublicInstance } from 'vue';
import {
    computed, onBeforeMount, onBeforeUnmount, reactive, toRef,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { cloneDeep } from 'lodash';

import {
    PButton, PBadge, PI,
} from '@cloudforet/mirinae';

import type {
    DashboardOptions,
    DashboardVariablesSchema,
    DashboardVariables as IDashboardVariables,
    DashboardLayoutWidgetInfo,
} from '@/api-clients/dashboard/_types/dashboard-type';
import type { WidgetSize } from '@/api-clients/dashboard/_types/widget-type';

import { gray } from '@/styles/colors';

import DashboardToolsetDateDropdown from '@/services/_shared/dashboard/dashboard-detail/components/DashboardToolsetDateDropdown.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { getDashboardWidgetInfoList } from '@/services/_shared/dashboard/dashboard-detail/helpers/dashboard-widget-info-helper';
import DashboardVariables from '@/services/_shared/dashboard/dashboard-detail/legacy/DashboardVariables.vue';
import { getWidgetComponent } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-component-helper';
import type {
    WidgetExpose, WidgetProps, WidgetTheme,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { useWidgetFormStore } from '@/services/_shared/dashboard/dashboard-detail/stores/widget-form-store';
import { useAllReferenceTypeInfoStore } from '@/services/dashboards/stores/all-reference-type-info-store';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';


interface WidgetFullModeModalProps {
    visible: boolean;
    widgetKey?: string;
    size?: WidgetSize;
    theme?: WidgetTheme;
}
type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;

const props = withDefaults(defineProps<WidgetFullModeModalProps>(), {
    visible: false,
    widgetKey: undefined,
    size: undefined,
    theme: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const widgetFormStore = useWidgetFormStore();
const widgetFormGetters = widgetFormStore.getters;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const route = useRoute();
const dashboardId = computed(() => route.params.dashboardId);
const { dashboard } = useDashboardGetQuery({
    dashboardId,
});

const state = reactive({
    widgetRef: null as WidgetComponent|null,
    loadingWidget: true,
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    component: null as AsyncComponent|null,
    variablesSnapshot: {} as IDashboardVariables,
    variableSchemaSnapshot: {} as DashboardVariablesSchema,
    optionsSnapshot: {} as DashboardOptions,
    hasNonInheritedWidgetOptions: false,
    originWidgetInfo: computed<DashboardLayoutWidgetInfo|undefined>(() => {
        if (!props.widgetKey) return undefined;
        const widgetInfoList = getDashboardWidgetInfoList((dashboard.value?.layouts?.[0].widgets as DashboardLayoutWidgetInfo[]) || []);
        return widgetInfoList.find((widgetInfo) => widgetInfo.widget_key === props.widgetKey);
    }),
    hideDateDropdown: computed<boolean>(() => widgetFormGetters.widgetConfig?.options?.data_criteria === 'realtime'),
});
const widgetRef = toRef(state, 'widgetRef');

/* Util */
const initSnapshot = () => {
    state.variablesSnapshot = cloneDeep(dashboardDetailState.variables);
    state.variableSchemaSnapshot = cloneDeep(dashboardDetailGetters.refinedVariablesSchema);
    state.optionsSnapshot = cloneDeep(dashboardDetailState.options);
};

const handleCloseModal = () => {
    dashboardDetailStore.setVariables(state.variablesSnapshot);
    dashboardDetailStore.setVariablesSchema(state.variableSchemaSnapshot);
    dashboardDetailStore.setOptions(state.optionsSnapshot);
    emit('update:visible', false);
};

onBeforeMount(() => {
    if (!state.originWidgetInfo) return;
    initSnapshot();
    state.component = getWidgetComponent(state.originWidgetInfo.widget_name);
});
onBeforeUnmount(() => {
    state.loadingWidget = true;
    state.component = null;
    emit('update:visible', false);
});
</script>

<template>
    <transition name="slide-up">
        <div class="widget-full-mode-modal">
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
                    </div>
                </div>
                <div class="filter-wrapper">
                    <div class="left-part">
                        <dashboard-variables disable-save-button
                                             :origin-variables="state.variablesSnapshot"
                                             :origin-variables-schema="state.variableSchemaSnapshot"
                        />
                    </div>
                    <div class="right-part">
                        <dashboard-toolset-date-dropdown v-if="!state.hideDateDropdown"
                                                         widget-mode
                                                         :date-range="dashboardDetailState.options.date_range"
                        />
                    </div>
                </div>
                <div v-if="state.originWidgetInfo && state.component"
                     class="widget-wrapper"
                >
                    <component :is="state.component"
                               ref="widgetRef"
                               :widget-key="props.widgetKey"
                               :widget-config-id="state.originWidgetInfo.widget_name"
                               :title="widgetFormGetters.updatedWidgetInfo?.title ?? state.originWidgetInfo.title"
                               :options="widgetFormGetters.updatedWidgetInfo?.widget_options ?? state.originWidgetInfo.widget_options"
                               :inherit-options="widgetFormGetters.updatedWidgetInfo?.inherit_options ?? state.originWidgetInfo.inherit_options"
                               :schema-properties="widgetFormGetters.updatedWidgetInfo?.schema_properties ?? state.originWidgetInfo.schema_properties"
                               size="full"
                               :theme="props.theme"
                               :all-reference-type-info="state.allReferenceTypeInfo"
                               :dashboard-options="dashboardDetailState.options"
                               :dashboard-variables-schema="dashboardDetailGetters.refinedVariablesSchema"
                               :dashboard-variables="dashboardDetailState.variables"
                               :loading="state.loadingWidget"
                               disable-full-mode
                               @mounted="state.loadingWidget = false"
                    />
                </div>
            </div>
        </div>
    </transition>
</template>

<style lang="postcss" scoped>
.widget-full-mode-modal {
    @apply bg-gray-100;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    .content-wrapper {
        height: 100%;
        overflow: auto;
        padding: 0 2rem 2rem 2rem;
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
</style>
