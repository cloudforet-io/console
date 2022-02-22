<template>
    <div class="cost-dashboard-customize-page">
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
        </nav>
        <section class="header">
            <p-icon-button
                name="ic_back"
                @click="$router.go(-1)"
            />
            <p-text-input v-model="dashboardTitle" block class="dashboard-title" />
            <div class="button-group">
                <p-button style-type="transparent" :outline="true" @click="handleClickCancel">
                    Cancel
                </p-button>
                <p-button style-type="secondary" @click="handleClickSave">
                    Save
                </p-button>
            </div>
        </section>
        <dashboard-layouts :loading="loading"
                           :layout="editingCustomLayout"
                           :customize-mode="true"
                           @confirm="handleConfirmWidgetModal"
        />
        <cost-dashboard-customize-sidebar @confirm="handleConfirmWidgetModal" />
    </div>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PButton, PTextInput, PIconButton,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { i18n } from '@/translations';
import { registerServiceStore } from '@/common/composables/register-service-store';
import CostDashboardStoreModule
    from '@/services/billing/cost-management/cost-dashboard/store';
import { CostDashboardState } from '@/services/billing/cost-management/cost-dashboard/store/type';
import {
    CustomLayout,
    DashboardInfo,
    DefaultLayout, PublicDashboardInfo,
} from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';
import CostDashboardCustomizeSidebar
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeSidebar.vue';
import { SpaceRouter } from '@/router';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { BILLING_ROUTE } from '@/services/billing/routes';
import DashboardLayouts from '@/services/billing/cost-management/cost-dashboard/modules/DashboardLayouts.vue';
import { keyBy } from 'lodash';


export default {
    name: 'CostDashboardCustomizePage',
    components: {
        CostDashboardCustomizeSidebar,
        DashboardLayouts,
        PBreadcrumbs,
        PButton,
        PIconButton,
        PTextInput,
    },
    props: {
        dashboardId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        registerServiceStore<CostDashboardState>('costDashboard', CostDashboardStoreModule);
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: 'Create New Dashboard' },
            ]),
        });

        const state = reactive({
            loading: true,
            layout: [] as CustomLayout[],
            editingCustomLayout: computed<CustomLayout[]>({
                get() { return store.state.service.costDashboard.editedCustomLayout; },
                set(val) {
                    store.commit('service/costDashboard/setEditedCustomLayout', [...val]);
                },
            }),
            dashboardIdFromRoute: computed(() => props.dashboardId || SpaceRouter.router.currentRoute.params.dashboardId),
            dashboardData: {} as DashboardInfo,
            dashboardTitle: '',
            selectedWidget: computed(() => store.state.service.costDashboard?.editedSelectedWidget),
            selectedTemplate: computed<Record<string, DefaultLayout> | PublicDashboardInfo>(() => store.state.service?.costDashboard?.selectedTemplate),
            defaultFilter: computed<Record<string, string[]>>(() => store.state.service?.costDashboard?.defaultFilter),
            widgetPosition: computed(() => store.state.service.costDashboard?.widgetPosition),
            layoutOfSpace: computed(() => store.state.service.costDashboard?.layoutOfSpace),
        });

        const goToMainDashboardPage = () => {
            SpaceRouter.router.replace({ name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME, params: { dashboardId: state.dashboardIdFromRoute } });
        };

        const rollbackDashboard = async () => {
            try {
                if (state.dashboardIdFromRoute?.startsWith('user')) {
                    await SpaceConnector.client.costAnalysis.userDashboard.delete({
                        user_dashboard_id: state.dashboardIdFromRoute,
                    });
                } else {
                    await SpaceConnector.client.costAnalysis.publicDashboard.delete({
                        public_dashboard_id: state.dashboardIdFromRoute,
                    });
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const handleClickCancel = () => {
            if (SpaceRouter.router.currentRoute.query.from === 'create') {
                rollbackDashboard();
            }
            goToMainDashboardPage();
        };

        const handleConfirmWidgetModal = () => {
            if (state.widgetPosition && state.layoutOfSpace) {
                if (state.layoutOfSpace === state.selectedWidget.options.layout) {
                    state.editingCustomLayout[state.widgetPosition.row].splice(state.widgetPosition.col + 1, 0, state.selectedWidget);
                } else {
                    state.editingCustomLayout[state.editingCustomLayout.length] = [state.selectedWidget];
                    store.commit('service/costDashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
                }
            } else if (state.layout?.length === 0) {
                state.editingCustomLayout = [[state.selectedWidget]];
            } else {
                state.editingCustomLayout[state.editingCustomLayout.length] = [state.selectedWidget];
                store.commit('service/costDashboard/setEditedCustomLayout', [...state.editingCustomLayout]);
            }
        };


        const fetchDefaultLayoutData = async (layoutId: string): Promise<any[]> => {
            try {
                // noinspection TypeScriptCheckImport
                const layoutTemplates = await import(`../dashboard-layouts/${layoutId}.json`);
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
            store.commit('service/costDashboard/setEditedCustomLayout', layout);
            return layout;
        };

        const getDashboardData = async () => {
            try {
                state.loading = true;
                if (state.dashboardIdFromRoute.startsWith('user')) {
                    state.dashboardData = await SpaceConnector.client.costAnalysis.userDashboard.get({
                        user_dashboard_id: state.dashboardIdFromRoute,
                    });
                } else {
                    state.dashboardData = await SpaceConnector.client.costAnalysis.publicDashboard.get({
                        public_dashboard_id: state.dashboardIdFromRoute,
                    });
                }
                state.dashboardTitle = state.dashboardData?.name || '';
                state.layout = await getDashboardLayout(state.dashboardData);
                state.loading = false;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dashboardData = {} as DashboardInfo;
            }
        };

        const saveDashboardWithUpdatedData = async () => {
            try {
                if (state.dashboardIdFromRoute.startsWith('user')) {
                    await SpaceConnector.client.costAnalysis.userDashboard.update({
                        user_dashboard_id: state.dashboardIdFromRoute,
                        name: state.dashboardTitle,
                        custom_layouts: state.editingCustomLayout,
                    });
                } else {
                    await SpaceConnector.client.costAnalysis.publicDashboard.update({
                        public_dashboard_id: state.dashboardIdFromRoute,
                        name: state.dashboardTitle,
                        custom_layouts: state.editingCustomLayout,
                    });
                }
                goToMainDashboardPage();
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const handleClickSave = () => {
            saveDashboardWithUpdatedData();
        };

        (() => {
            getDashboardData();
            store.dispatch('display/showInfo');
        })();

        return {
            routeState,
            ...toRefs(state),
            handleClickCancel,
            handleClickSave,
            handleConfirmWidgetModal,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-customize-page {
    .header {
        @apply flex items-center;
    }
    .dashboard-title {
        margin-left: 1rem;
        &.p-text-input::v-deep {
            .input-container {
                @apply font-bold;
                height: 3.125rem;
                font-size: 1.875rem;
            }
        }
    }
    .button-group {
        @apply justify-between;
        display: inherit;
        margin-left: 2.5rem;
        gap: 1rem;
    }
}
</style>
