<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <template v-for="(width, idx) in widgetWidthList">
            <component :is="getWidgetComponent(widgetInfoList[idx].widget_name)"
                       v-if="widgetInfoList[idx]"
                       :id="widgetInfoList[idx].widget_name"
                       :key="`widget-${widgetInfoList[idx].widget_name}-${idx}`"
                       ref="widgetRef"
                       v-intersection-observer="handleIntersectionObserver"
                       :widget-config-id="widgetInfoList[idx].widget_name"
                       :widget-key="widgetInfoList[idx].widget_name"
                       :title="widgetInfoList[idx].title"
                       :options="widgetInfoList[idx].widget_options"
                       :inherit-options="{
                           currency: { enabled: true },
                           date_range: { enabled: true },
                       }"
                       :dashboard-variables="dashboardVariables"
                       :dashboard-settings="dashboardSettings"
                       :size="widgetSizeList[idx]"
                       :width="width"
                       :theme="widgetThemeList[idx]"
                       :edit-mode="editMode"
                       :all-reference-type-info="allReferenceTypeInfo"
                       @click-expand-icon="handleExpand"
            />
        </template>
    </div>
</template>

<script lang="ts">
import { vIntersectionObserver } from '@vueuse/components';
import type { DirectiveFunction, PropType, SetupContext } from 'vue';
import {
    defineComponent, reactive, toRefs, ref, onMounted, watch, onBeforeUnmount, computed,
} from 'vue';

import { flattenDeep } from 'lodash';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import type { DashboardSettings, DashboardVariables } from '@/services/dashboards/config';
import {
    WIDGET_CONTAINER_MAX_WIDTH, WIDGET_CONTAINER_MIN_WIDTH,
} from '@/services/dashboards/dashboard-detail/lib/config';
import { widgetThemeAssigner } from '@/services/dashboards/dashboard-detail/lib/theme-helper';
import { widgetWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/width-helper';
import AWSCloudFrontCost from '@/services/dashboards/widgets/aws-cloud-front-cost/AWSCloudFrontCost.vue';
import type { WidgetSize, DashboardLayoutWidgetInfo, WidgetConfig } from '@/services/dashboards/widgets/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';
import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

interface Props {
    widgetInfoList: DashboardLayoutWidgetInfo[];
    editMode?: boolean;
    dashboardSettings: DashboardSettings;
    dashboardVariables: DashboardVariables;
    allReferenceTypeInfo: AllReferenceTypeInfo;
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
        widgetInfoList: {
            type: Array as PropType<DashboardLayoutWidgetInfo[]>,
            default: () => ([]),
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        dashboardSettings: {
            type: Object as PropType<DashboardSettings>,
            default: () => ({}),
        },
        dashboardVariables: {
            type: Object as PropType<DashboardVariables>,
            default: () => ({}),
        },
        allReferenceTypeInfo: {
            type: Object as PropType<AllReferenceTypeInfo>,
            default: () => ({}),
        },
    },
    setup(props, { emit, expose }: SetupContext) {
        const state = reactive({
            // width
            containerWidth: WIDGET_CONTAINER_MIN_WIDTH,
            widgetSizeList: [] as WidgetSize[],
            widgetWidthList: computed<number[]>(() => flattenDeep(widgetWidthAssigner(state.widgetSizeList, refineContainerWidth(state.containerWidth)))),
            // theme
            widgetThemeList: computed<Array<WidgetTheme | undefined>>(() => {
                const widgetThemeOptions: Array<WidgetConfig['theme']> = [];
                props.widgetInfoList.forEach((widget) => {
                    const widgetConfig = getWidgetConfig(widget.widget_name);
                    widgetThemeOptions.push(widgetConfig.theme);
                });
                return widgetThemeAssigner(widgetThemeOptions);
            }),
            widgetRef: [] as Array<InstanceType<typeof AWSCloudFrontCost>>,
            initiatedWidgetMap: {} as {[widgetName: string]: boolean},
        });
        const containerRef = ref<HTMLElement|null>(null);

        /* Util */
        const refineContainerWidth = (containerWidth: number|undefined): number => {
            if (!containerWidth || containerWidth < WIDGET_CONTAINER_MIN_WIDTH) return WIDGET_CONTAINER_MIN_WIDTH;
            if (containerWidth > WIDGET_CONTAINER_MAX_WIDTH) return WIDGET_CONTAINER_MAX_WIDTH;
            return containerWidth - (containerWidth % 80);
        };

        /**
         * If widgetSizeList is given: ['MD', 'MD', **'SM'**, 'LG', 'SM'],
         * And user wants to expand 'SM' to 'FULL'
         * -> Each widget has its own widgetIndex (in this case, widgetIndex is 2)
         * If expand button has clicked, individual widget emits its own widgetIndex.
         * and widgetContainer gains widgetIndex which wants to be changed.
         *
         * So on, widgetSizeList is changed by ['MD', 'MD', **'FULL'**, 'LG', 'SM']
         * And realign widths to every widget.
         * */
        const handleExpand = (type: 'expand'|'collapse', widgetIndex: number): void => {
            const _widgetSizeList = [...state.widgetSizeList];
            if (type === 'expand') _widgetSizeList[widgetIndex] = WIDGET_SIZE.full;
            if (type === 'collapse') _widgetSizeList[widgetIndex] = state.widgetSizeList[widgetIndex];
            state.widgetSizeList = [..._widgetSizeList];
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

        watch(() => props.widgetInfoList, (widgetInfoList) => {
            state.widgetSizeList = widgetInfoList.map((widget) => widget.size);
            state.initiatedWidgetMap = {};
        }, { immediate: true, deep: true });

        // for PDF export - start
        const refreshAllWidget = async () => {
            const promises: (()=>void)[] = [];
            state.widgetRef.forEach((d:any) => {
                if (typeof d?.refreshWidget === 'function' && state.initiatedWidgetMap[d.$el.id]) promises.push(d?.refreshWidget());
            });
            emit('update:loading', true);
            await Promise.allSettled(promises);
            emit('update:loading', false);
        };
        expose({
            refreshAllWidget,
        });
        onMounted(() => {
            emit('rendered', state.widgetRef);
        });
        // for PDF export - end

        return {
            containerRef,
            ...toRefs(state),
            getWidgetComponent,
            handleExpand,
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
