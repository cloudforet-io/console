<template>
    <div class="cost-dashboard-preview">
        <div ref="headerRef"
             class="top-wrapper"
        >
            <p-heading :title="dashboard.name || $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')">
                <template #title-right-extra>
                    <div class="right-part">
                        <cost-dashboard-period-select-dropdown :dashboard-id="dashboardId"
                                                               :period="period"
                                                               :period-type="periodType"
                                                               print-mode
                                                               manage-disabled
                        />
                    </div>
                </template>
            </p-heading>

            <cost-dashboard-filter :dashboard-id="dashboardId"
                                   :filters="filters"
                                   print-mode
                                   manage-disabled
            />
        </div>
        <dashboard-layouts :loading="loading"
                           :layout="layout"
                           :period="period"
                           :filters="filters"
                           :currency="currency"
                           :currency-rates="currencyRates"
                           print-mode
                           @rendered="handleAllRenderedWidgets"
        />
    </div>
</template>

<script lang="ts">

import {
    computed, onMounted, reactive, toRefs, watch,
} from 'vue';

import { PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { fetchDefaultLayoutData } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import CostDashboardFilter from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardFilter.vue';
import CostDashboardPeriodSelectDropdown
    from '@/services/cost-explorer/cost-dashboard/modules/CostDashboardPeriodSelectDropdown.vue';
import DashboardLayouts from '@/services/cost-explorer/cost-dashboard/modules/DashboardLayouts.vue';
import type { CustomLayout, DashboardInfo } from '@/services/cost-explorer/cost-dashboard/type';


const HEADER_ELEMENT = 1;
const DASHBOARD_LAYOUT = 1;

export default {
    name: 'CostDashboardPreview',
    components: {
        CostDashboardPeriodSelectDropdown,
        DashboardLayouts,
        CostDashboardFilter,
        PHeading,
    },
    props: {
        dashboardId: {
            type: String,
            required: true,
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            dashboard: {} as DashboardInfo,
            loading: true,
            layout: [] as any[],
            periodType: '',
            currency: computed(() => store.state.settings.currency),
            currencyRates: computed(() => store.state.settings.currencyRates),
            isPageMounted: false,
            // dashboard layout widget
            widgetList: undefined as HTMLElement[]|undefined,
            //
            totalElementCount: DASHBOARD_LAYOUT + HEADER_ELEMENT,
            headerRef: undefined as Element|undefined,
            renderedCount: computed(() => ((state.widgetList ? DASHBOARD_LAYOUT : 0) + (state.isPageMounted ? HEADER_ELEMENT : 0))),
            isAllRendered: computed<boolean>(() => {
                if (!state.isPageMounted) return false;
                if (state.widgetList === undefined) return false;
                return (state.renderedCount >= state.totalElementCount);
            }),
        });

        /* event */
        const handleAllRenderedWidgets = (rowElements: HTMLElement[]) => {
            state.widgetList = rowElements;
            state.isWidgetListRendered = true;
        };

        const getDashboardLayout = async (dashboard: DashboardInfo): Promise<CustomLayout[]> => {
            let layout: CustomLayout[];
            if (dashboard?.default_layout_id && dashboard.custom_layouts.length === 0) {
                layout = await fetchDefaultLayoutData(dashboard.default_layout_id);
            } else layout = dashboard.custom_layouts;
            return layout;
        };

        const fetchDashboard = async (dashboardId: string): Promise<DashboardInfo> => {
            try {
                if (dashboardId.startsWith('user')) {
                    return await SpaceConnector.client.costAnalysis.userDashboard.get({
                        user_dashboard_id: dashboardId,
                    });
                }
                return await SpaceConnector.client.costAnalysis.publicDashboard.get({
                    public_dashboard_id: dashboardId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return {} as DashboardInfo;
            }
        };

        const loadDashboardAndSetStates = async (dashboardId: string) => {
            state.loading = true;

            const dashboard = await fetchDashboard(dashboardId);
            state.dashboard = dashboard;
            state.layout = await getDashboardLayout(dashboard);
            state.filters = dashboard.default_filter;
            state.period = dashboard.period ?? {};
            state.periodType = dashboard.period_type;

            state.loading = false;
        };

        watch(() => props.dashboardId, async (dashboardId) => {
            if (dashboardId) await loadDashboardAndSetStates(dashboardId);
        }, { immediate: true });

        watch(() => state.isAllRendered, (isAllRendered) => {
            if (isAllRendered) {
                const widgetRows: HTMLElement[] = [
                    state.headerRef,
                    ...(state.widgetList ?? []),
                ];
                emit('rendered', widgetRows);
            }
        });
        onMounted(() => {
            state.isPageMounted = true;
        });

        return {
            ...toRefs(state),
            handleAllRenderedWidgets,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.p-heading {
    margin-bottom: 0;
}
.top-wrapper {
    @apply flex flex-wrap;
    row-gap: 1rem;
    min-width: 62.25rem;
    max-width: 117rem;
    padding-right: 1.5rem;
    .right-part {
        float: right;
        > div {
            display: inline-flex;
            align-items: center;
            line-height: 1;
        }
    }
}
</style>
