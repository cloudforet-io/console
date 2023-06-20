<template>
    <div ref="containerRef"
         class="dashboard-widget-container"
    >
        <template v-if="!dashboardDetailState.loadingDashboard">
            <template v-for="(widget) in reformedWidgetInfoList">
                <component :is="widget.component"
                           :id="widget.widget_key"
                           :key="widget.widget_key"
                           ref="widgetRef"
                           v-intersection-observer="handleIntersectionObserver"
                           :widget-config-id="widget.widget_name"
                           :widget-key="widget.widget_key"
                           :title="widget.title"
                           :options="widget.widget_options"
                           :inherit-options="widget.inherit_options"
                           :size="widget.size"
                           :width="widget.width"
                           :theme="widget.theme"
                           :dashboard-variables="dashboardDetailState.variables"
                           :dashboard-variables-schema="dashboardDetailState.variablesSchema"
                           :dashboard-settings="dashboardDetailState.settings"
                           :currency-rates="currencyRates"
                           :edit-mode="editMode"
                           :error-mode="editMode && dashboardDetailState.widgetValidMap[widget.widget_key] === false"
                           :all-reference-type-info="allReferenceTypeInfo"
                           :initiated="!!initiatedWidgetMap[widget.widget_key]"
                />
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import { vIntersectionObserver } from '@vueuse/components';
import type { ComponentPublicInstance, DirectiveFunction, SetupContext } from 'vue';
import {
    defineComponent, reactive, toRefs, ref, onMounted, watch, computed, toRef,
} from 'vue';

import {
    debounce, isEmpty, isEqual,
} from 'lodash';

import { store } from '@/store';

import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import {
    useContainerWidth,
} from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/composables/use-container-width';
import {
    useWidgetReformer,
} from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/composables/use-widget-reformer';
import {
    useWidgetValidator,
} from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/composables/use-widget-validator';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';


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
        const dashboardDetailState = dashboardDetailStore.$state;

        const state = reactive({
            widgetRef: [] as Array<WidgetComponent|null>,
            initiatedWidgetMap: {} as Record<string, any>,
            allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
            currencyRates: computed(() => store.state.display.currencyRates),
        });

        /* container width */
        const containerRef = ref<HTMLElement|null>(null);
        const { containerWidth } = useContainerWidth({ containerRef, observeResize: true });

        /* reform widget info list */
        const { reformedWidgetInfoList, widgetConfigMap } = useWidgetReformer({
            dashboardWidgetInfoList: toRef(dashboardDetailState, 'dashboardWidgetInfoList'),
            containerWidth,
        });

        /* widget validation */
        useWidgetValidator({
            validateOnVariablesSchemaChange: computed(() => !!props.editMode),
            dashboardWidgetInfoList: reformedWidgetInfoList,
            widgetConfigMap,
            variablesSchema: toRef(dashboardDetailState, 'variablesSchema'),
            updateWidgetValidMap: (validMap) => {
                dashboardDetailStore.$patch((_state) => {
                    _state.widgetValidMap = validMap;
                });
            },
        });

        /* init widgets */
        const handleIntersectionObserver = async ([{ isIntersecting, target }]) => {
            if (state.initiatedWidgetMap[target.id]) return;
            if (isIntersecting) {
                const targetWidgetRef = state.widgetRef.find((d) => d?.$el?.id === target.id);
                if (typeof targetWidgetRef?.initWidget === 'function') {
                    const prevData = props.reusePreviousData ? dashboardDetailState.widgetDataMap[target.id] : undefined;
                    const data = await targetWidgetRef.initWidget(prevData);
                    dashboardDetailStore.$patch((_state) => {
                        _state.widgetDataMap[target.id] = data;
                    });
                    state.initiatedWidgetMap[target.id] = data;
                }
            }
        };
        watch(reformedWidgetInfoList, (widgetInfoList) => {
            if (!Array.isArray(widgetInfoList)) return;
            const initiatedWidgetMap = {};
            widgetInfoList.forEach((widget) => {
                initiatedWidgetMap[widget.widget_key] = state.initiatedWidgetMap[widget.widget_key];
            });
            state.initiatedWidgetMap = initiatedWidgetMap;
        }, { immediate: true, deep: true });


        /* refresh widgets */
        let dashboardChangedTime;
        watch(() => dashboardDetailState.dashboardId, () => {
            state.initiatedWidgetMap = {};
            dashboardChangedTime = new Date().getTime();
        });
        watch(() => dashboardDetailState.settings, (dashboardSettings, prevSettings) => {
            // escape if there is no initiated widget
            if (isEmpty(state.initiatedWidgetMap)) return;

            // escape if just initiated
            if (new Date().getTime() - dashboardChangedTime < 300) return;

            // refresh if date range is changed
            if (!isEqual(dashboardSettings.date_range, prevSettings?.date_range)) {
                refreshAllWidget();
            }
        });
        const refreshAllWidget = debounce(async () => {
            dashboardDetailStore.$patch({ loadingWidgets: true });
            const refreshWidgetPromises: WidgetExpose['refreshWidget'][] = [];

            const filteredRefs = state.widgetRef.filter((comp) => {
                if (!comp || typeof comp.refreshWidget() !== 'function') return false;
                if (!state.initiatedWidgetMap[comp.$el?.id]) return false;
                refreshWidgetPromises.push(comp.refreshWidget);
                return true;
            });

            const results = await Promise.allSettled(refreshWidgetPromises);

            results.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    const widgetKey = filteredRefs[idx]?.$el?.id;
                    if (widgetKey) {
                        dashboardDetailStore.$patch((_state) => {
                            _state.widgetDataMap[widgetKey] = result.value;
                        });
                    }
                }
            });
            dashboardDetailStore.$patch({ loadingWidgets: false });
        }, 150);
        expose({
            refreshAllWidget,
        });

        /* init */
        onMounted(async () => {
            await store.dispatch('reference/loadAll');
            // for PDF export
            // emit('rendered', state.widgetRef);
        });
        (async () => {
            await store.dispatch('display/loadCurrencyRates');
        })();

        return {
            dashboardDetailState,
            ...toRefs(state),
            containerRef,
            reformedWidgetInfoList,
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
