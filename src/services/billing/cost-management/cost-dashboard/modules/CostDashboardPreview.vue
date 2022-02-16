<template>
    <div class="cost-dashboard-preview">
        <div class="top-wrapper">
            <p-page-title :title="dashboard.name || $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')" />
            <div class="right-part">
                <cost-dashboard-period-select-dropdown :dashboard-id="dashboardId"
                                                       :period.sync="period"
                                                       :period-type.sync="periodType"
                                                       print-mode
                />
            </div>
            <cost-dashboard-filter :dashboard-id="dashboardId" :filters.sync="filters" print-mode />
        </div>
        <dashboard-layouts :loading="loading"
                           :layout="layout"
                           :period="period"
                           :filters="filters"
                           :currency="currency"
                           :currency-rates="currencyRates"
                           print-mode
                           @rendered="handleDashboardRendered"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { keyBy } from 'lodash';
import {
    PPageTitle,
} from '@spaceone/design-system';

import DashboardLayouts from '@/services/billing/cost-management/cost-dashboard/modules/DashboardLayouts.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import CostDashboardFilter from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardFilter.vue';
import CostDashboardPeriodSelectDropdown
    from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardPeriodSelectDropdown.vue';
import { CustomLayout, DashboardInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';

export default {
    name: 'CostDashboardPreview',
    components: {
        CostDashboardPeriodSelectDropdown,
        DashboardLayouts,
        CostDashboardFilter,
        PPageTitle,
    },
    props: {
        dashboardId: {
            type: String,
            required: true,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            dashboard: {} as DashboardInfo,
            loading: true,
            layout: [] as any[],
            period: {} as Period,
            periodType: '',
            filters: {} as CostQueryFilters,
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            homeDashboardId: computed<string|undefined>(() => store.getters['settings/getItem']('homeDashboard', '/costDashboard')),
        });


        /* event */
        const handleDashboardRendered = () => {
            console.debug('dashboard rendered');
            emit('rendered');
        };

        const fetchDefaultLayoutData = async (layoutId: string): Promise<any[]> => {
            try {
                // noinspection TypeScriptCheckImport
                const layoutTemplates = await import(`../dashboard-layouts/${layoutId}.json`);
                // noinspection TypeScriptCheckImport
                const widgets = await import('../../widgets/lib/defaultWidgetList.json');

                const optionsKeyByWidgetId = keyBy(widgets.default, option => option.widget_id);
                const layoutData: CustomLayout[] = layoutTemplates.default.map(layout => layout.map((d) => {
                    const widget = optionsKeyByWidgetId[d.widget_id];
                    return widget ? { ...widget } : {};
                }));

                return layoutData;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
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


        return {
            ...toRefs(state),
            handleDashboardRendered,
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
.top-wrapper {
    @apply flex flex-wrap;
    row-gap: 1rem;
    min-width: 62.25rem;
    max-width: 117rem;
    padding-right: 1.5rem;
    .p-page-title {
        width: auto;
        margin-bottom: 0;
    }
    .right-part {
        @apply flex items-center;
        margin-left: auto;
    }
}
</style>
