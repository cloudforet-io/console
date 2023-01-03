<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <template v-for="(widget, idx) in widgetInfoList">
            <component :is="getWidgetComponent(widget.widget_name)"
                       v-if="widget"
                       :id="widget.widgetKey"
                       :key="widget.widgetKey"
                       ref="widgetRef"
                       v-intersection-observer="handleIntersectionObserver"
                       :widget-config-id="widget.widget_name"
                       :widget-key="widget.widgetKey"
                       :title="widget.title"
                       :options="widget.widget_options"
                       :inherit-options="widget.inherit_options"
                       :dashboard-variables="dashboardVariables"
                       :dashboard-settings="dashboardSettings"
                       :size="widgetSizeList[idx]"
                       :width="widgetWidthList[idx]"
                       :theme="widgetThemeList[idx]"
                       :edit-mode="editMode"
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

import { flattenDeep } from 'lodash';

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
} from '@/services/dashboards/widgets/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';
import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

interface Props {
    editMode?: boolean;
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
    },
    setup(props, { expose }: SetupContext) {
        const dashboardDetailStore = useDashboardDetailInfoStore();
        const dashboardDetailState = dashboardDetailStore.state;

        const state = reactive({
            dashboardId: computed(() => dashboardDetailState.dashboardId),
            widgetInfoList: computed(() => dashboardDetailState.dashboardWidgetInfoList),
            dashboardVariables: computed(() => dashboardDetailState.variables),
            dashboardSettings: computed(() => dashboardDetailState.settings),
            widgetDataMap: computed<Record<string, boolean>>({
                get() { return dashboardDetailState.widgetDataMap; },
                set(val) { dashboardDetailState.widgetDataMap = val; },
            }),
            // width
            containerWidth: WIDGET_CONTAINER_MIN_WIDTH,
            widgetSizeList: [] as WidgetSize[],
            widgetWidthList: computed<number[]>(() => flattenDeep(widgetWidthAssigner(state.widgetSizeList, refineContainerWidth(state.containerWidth)))),
            // theme
            widgetThemeList: computed<Array<WidgetTheme | undefined>>(() => {
                const widgetThemeOptions: Array<WidgetConfig['theme']> = [];
                state.widgetInfoList.forEach((widget) => {
                    const widgetConfig = getWidgetConfig(widget.widget_name);
                    widgetThemeOptions.push(widgetConfig.theme);
                });
                return widgetThemeAssigner(widgetThemeOptions);
            }),
            widgetRef: [] as Array<WidgetComponent|null>,
            initiatedWidgetMap: {} as Record<string, any>,
            allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
        });
        const containerRef = ref<HTMLElement|null>(null);

        /* Util */
        const refineContainerWidth = (containerWidth: number|undefined): number => {
            if (!containerWidth || containerWidth < WIDGET_CONTAINER_MIN_WIDTH) return WIDGET_CONTAINER_MIN_WIDTH;
            if (containerWidth > WIDGET_CONTAINER_MAX_WIDTH) return WIDGET_CONTAINER_MAX_WIDTH;
            return containerWidth - (containerWidth % 80);
        };

        const handleIntersectionObserver = ([{ isIntersecting, target }]) => {
            if (state.initiatedWidgetMap[target.id]) return;
            if (isIntersecting) {
                const targetWidgetRef: WidgetComponent|null = state.widgetRef.find((d) => d?.$el?.id === target.id);
                if (typeof targetWidgetRef?.initWidget === 'function') {
                    const data = await targetWidgetRef.initWidget(state.widgetDataMap[target.id]);
                    state.widgetDataMap[target.id] = data;
                    state.initiatedWidgetMap[target.id] = data;
                }
            }
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
                initiatedWidgetMap[widget.widgetKey] = state.initiatedWidgetMap[widget.widgetKey];
            });
            state.initiatedWidgetMap = initiatedWidgetMap;
        }, { immediate: true, deep: true });


        const refreshAllWidget = async () => {
            const promises: WidgetExpose['refreshWidget'][] = [];

            const filteredRefs = state.widgetRef.filter((comp: WidgetComponent|null) => {
                if (!comp || typeof comp.refreshWidget() !== 'function') return false;
                if (!state.initiatedWidgetMap[comp.$el?.id]) return false;
                promises.push(comp.refreshWidget);
                return true;
            });

            const results = await Promise.allSettled(promises);

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
