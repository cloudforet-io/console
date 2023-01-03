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
import type { DirectiveFunction, SetupContext } from 'vue';
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
import AWSCloudFrontCost from '@/services/dashboards/widgets/aws-cloud-front-cost/AWSCloudFrontCost.vue';
import type { WidgetSize, WidgetConfig } from '@/services/dashboards/widgets/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';
import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

interface Props {
    editMode?: boolean;
}
export default defineComponent<Props>({
    name: 'DashboardWidgetContainer',
    components: {
        AWSCloudFrontCost,
    },
    directives: {
        intersectionObserver: vIntersectionObserver as DirectiveFunction,
    },
    props: {
        editMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit, expose }: SetupContext) {
        const dashboardDetailStore = useDashboardDetailInfoStore();
        const dashboardDetailState = dashboardDetailStore.state;

        const state = reactive({
            widgetInfoList: computed(() => dashboardDetailState.dashboardWidgetInfoList),
            dashboardVariables: computed(() => dashboardDetailState.variables),
            dashboardSettings: computed(() => dashboardDetailState.settings),
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
            widgetRef: [] as Array<InstanceType<typeof AWSCloudFrontCost>>,
            initiatedWidgetMap: {} as {[widgetKey: string]: boolean},
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
                state.initiatedWidgetMap[target.id] = true;
                const targetWidgetRef = state.widgetRef.filter((d) => d.$el.id === target.id)[0];
                if (typeof targetWidgetRef.initWidget === 'function') targetWidgetRef.initWidget();
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

        // for PDF export - start
        const refreshAllWidget = async () => {
            const promises: (()=>void)[] = [];
            state.widgetRef.forEach((d:any) => {
                if (typeof d?.refreshWidget === 'function' && state.initiatedWidgetMap[d.$el.id]) promises.push(d?.refreshWidget());
            });
            await Promise.allSettled(promises);
        };
        expose({
            refreshAllWidget,
        });
        onMounted(async () => {
            await store.dispatch('reference/loadAll');
            emit('rendered', state.widgetRef);
        });
        // for PDF export - end

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
