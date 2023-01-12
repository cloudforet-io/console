<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <template v-for="(widget, idx) in widgetInfoList">
            <component :is="getWidgetComponent(widget.widget_name)"
                       v-if="widget"
                       :id="widget.widget_key"
                       :key="widget.widget_key"
                       ref="widgetRef"
                       v-intersection-observer="handleIntersectionObserver"
                       :widget-config-id="widget.widget_name"
                       :widget-key="widget.widget_key"
                       :title="widget.title"
                       :options="widget.widget_options"
                       :inherit-options="widget.inherit_options"
                       :dashboard-variables="dashboardVariables"
                       :dashboard-variables-schema="dashboardVariablesSchema"
                       :dashboard-settings="dashboardSettings"
                       :size="widgetSizeList[idx]"
                       :width="widgetWidthList[idx]"
                       :theme="widgetThemeList[idx]"
                       :currency-rates="currencyRates"
                       :edit-mode="editMode"
                       :error-mode="!dashboardDetailValidationState.widgetValidMap[widget.widget_key]"
                       :all-reference-type-info="allReferenceTypeInfo"
            />
        </template>
    </div>
</template>

<script lang="ts">
import { vIntersectionObserver } from '@vueuse/components';
import type { ComponentPublicInstance, DirectiveFunction, SetupContext } from 'vue';
import {
    defineComponent, reactive, toRefs, ref, onMounted, watch, onBeforeUnmount, computed,
} from 'vue';

import { flattenDeep, isEmpty } from 'lodash';

import { store } from '@/store';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import {
    WIDGET_CONTAINER_MAX_WIDTH, WIDGET_CONTAINER_MIN_WIDTH,
} from '@/services/dashboards/dashboard-detail/lib/config';
import { widgetThemeAssigner } from '@/services/dashboards/dashboard-detail/lib/theme-helper';
import { widgetWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/width-helper';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type {
    WidgetSize, WidgetConfig, WidgetExpose, WidgetProps,
    DashboardLayoutWidgetInfo,
} from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getWidgetComponent,
    getWidgetConfig,
} from '@/services/dashboards/widgets/_helpers/widget-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';


interface Props {
    editMode?: boolean;
    reusePreviousData?: boolean;
}
type WidgetComponent = ComponentPublicInstance<WidgetProps, WidgetExpose>;
export default defineComponent<Props>({
    name: 'DashboardWidgetContainer',
    directives: {
        intersectionObserver: vIntersectionObserver as DirectiveFunction,
    },
    props: {
        editMode: {
            type: Boolean,
            default: false,
        },
        reusePreviousData: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { expose }: SetupContext) {
        const dashboardDetailStore = useDashboardDetailInfoStore();
        const dashboardDetailState = dashboardDetailStore.state;
        const dashboardDetailValidationState = dashboardDetailStore.validationState;

        const state = reactive({
            dashboardId: computed(() => dashboardDetailState.dashboardId),
            widgetInfoList: computed<DashboardLayoutWidgetInfo[]>(() => dashboardDetailState.dashboardWidgetInfoList),
            dashboardVariables: computed(() => dashboardDetailState.variables),
            dashboardVariablesSchema: computed(() => dashboardDetailState.variablesSchema),
            dashboardSettings: computed(() => dashboardDetailState.settings),
            widgetDataMap: computed({
                get() { return dashboardDetailState.widgetDataMap; },
                set(val) { dashboardDetailState.widgetDataMap = val; },
            }),
            widgetConfigMap: computed<Record<string, WidgetConfig>>(() => {
                const _configMap: Record<string, WidgetConfig> = {};
                state.widgetInfoList.forEach((d) => {
                    _configMap[d.widget_key] = getWidgetConfig(d.widget_name);
                });
                return _configMap;
            }),
            // width
            containerWidth: WIDGET_CONTAINER_MIN_WIDTH,
            widgetSizeList: [] as WidgetSize[],
            widgetWidthList: computed<number[]>(() => flattenDeep(widgetWidthAssigner(state.widgetSizeList, refineContainerWidth(state.containerWidth)))),
            // theme
            widgetThemeList: computed<Array<WidgetTheme | undefined>>(() => {
                const widgetThemeOptions: Array<WidgetConfig['theme']> = [];
                state.widgetInfoList.forEach((widgetInfo) => {
                    widgetThemeOptions.push(state.widgetConfigMap[widgetInfo.widget_key].theme);
                });
                return widgetThemeAssigner(widgetThemeOptions);
            }),
            widgetRef: [] as Array<WidgetComponent|null>,
            initiatedWidgetMap: {} as Record<string, any>,
            allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
            currencyRates: computed(() => store.state.display.currencyRates),
        });
        const containerRef = ref<HTMLElement|null>(null);

        /* Util */
        const refineContainerWidth = (containerWidth: number|undefined): number => {
            if (!containerWidth || containerWidth < WIDGET_CONTAINER_MIN_WIDTH) return WIDGET_CONTAINER_MIN_WIDTH;
            if (containerWidth > WIDGET_CONTAINER_MAX_WIDTH) return WIDGET_CONTAINER_MAX_WIDTH;
            return containerWidth - (containerWidth % 80);
        };

        const handleIntersectionObserver = async ([{ isIntersecting, target }]) => {
            if (state.initiatedWidgetMap[target.id]) return;
            if (isIntersecting) {
                const targetWidgetRef: WidgetComponent|null = state.widgetRef.find((d) => d?.$el?.id === target.id);
                if (typeof targetWidgetRef?.initWidget === 'function') {
                    const prevData = props.reusePreviousData ? state.widgetDataMap[target.id] : undefined;
                    const data = await targetWidgetRef.initWidget(prevData);
                    state.widgetDataMap[target.id] = data;
                    state.initiatedWidgetMap[target.id] = data;
                }
            }
        };

        const validateAllWidget = () => {
            const _widgetValidMap: Record<string, boolean> = {};
            state.widgetInfoList.forEach((widgetInfo: DashboardLayoutWidgetInfo) => {
                const _widgetConfig = state.widgetConfigMap[widgetInfo.widget_key];
                const _widgetSchemaErrorMap = getWidgetInheritOptionsErrorMap(
                    widgetInfo.inherit_options,
                    _widgetConfig.options_schema.schema,
                    dashboardDetailState.variables,
                    dashboardDetailState.variablesSchema,
                );
                _widgetValidMap[widgetInfo.widget_key] = isEmpty(_widgetSchemaErrorMap);
            });
            dashboardDetailValidationState.widgetValidMap = _widgetValidMap;
        };

        let timer: undefined|number;
        const handleResizeObserve = () => {
            // timeouts for throttle
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                // RESIZE containerWidth on `resizeObserve`
                state.containerWidth = refineContainerWidth(containerRef.value?.clientWidth);
                // for less throttle, change below timeout ms
            }, 500);
        };

        const observeInstance = new ResizeObserver(handleResizeObserve);
        onMounted(() => {
            // INIT containerWidth
            state.containerWidth = refineContainerWidth(containerRef.value?.clientWidth);
            observeInstance.observe(containerRef?.value as Element);
        });
        onBeforeUnmount(() => {
            observeInstance.unobserve(containerRef?.value as Element);
        });

        watch(() => state.widgetInfoList, (widgetInfoList) => {
            if (!Array.isArray(widgetInfoList)) return;
            state.widgetSizeList = widgetInfoList.map((widget) => widget.size);
            const initiatedWidgetMap = {};
            widgetInfoList.forEach((widget) => {
                initiatedWidgetMap[widget.widget_key] = state.initiatedWidgetMap[widget.widget_key];
            });
            state.initiatedWidgetMap = initiatedWidgetMap;
        }, { immediate: true, deep: true });
        watch(() => state.dashboardVariablesSchema, () => {
            if (props.editMode) validateAllWidget();
        }, { immediate: true });


        const refreshAllWidget = async () => {
            const refreshWidgetPromises: WidgetExpose['refreshWidget'][] = [];

            const filteredRefs = state.widgetRef.filter((comp: WidgetComponent|null) => {
                if (!comp || typeof comp.refreshWidget() !== 'function') return false;
                if (!state.initiatedWidgetMap[comp.$el?.id]) return false;
                refreshWidgetPromises.push(comp.refreshWidget);
                return true;
            });

            const results = await Promise.allSettled(refreshWidgetPromises);

            results.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    const widgetKey = filteredRefs[idx]?.$el?.id;
                    state.widgetDataMap[widgetKey] = result.value;
                }
            });
        };
        expose({
            refreshAllWidget,
        });
        onMounted(async () => {
            await store.dispatch('reference/loadAll');
            // for PDF export
            // emit('rendered', state.widgetRef);
        });

        return {
            containerRef,
            ...toRefs(state),
            dashboardDetailValidationState,
            getWidgetComponent,
            handleIntersectionObserver,
        };
    },
});
</script>

<style scoped>
.dashboard-widget-container {
    min-width: 320px;
    max-width: 1840px;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
