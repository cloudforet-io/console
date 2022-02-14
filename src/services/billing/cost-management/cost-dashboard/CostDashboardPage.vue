<template>
    <div class="cost-dashboard-page">
        <p-breadcrumbs :routes="routeState.route" />
        <div class="top-wrapper">
            <p-page-title :title="dashboard.name || $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')" />
            <div class="left-part">
                <!--                <favorite-button :item-id="'item-id1'"-->
                <!--                                 favorite-type="project"-->
                <!--                                 resource-type="identity.Project"-->
                <!--                />-->
                <p-icon-button name="ic_edit-text"
                               class="edit-btn"
                               :outline="false"
                               @click.stop="handleClickEditDashboard"
                />
                <p-icon-button name="ic_trashcan"
                               :outline="false"
                               @click.stop="handleClickDeleteDashboard"
                />
                <cost-dashboard-more-menu :dashboard-id="dashboardId" />
            </div>
            <div class="right-part">
                <cost-dashboard-period-select-dropdown
                    :dashboard-id="dashboardId"
                    :period-type.sync="periodType"
                    :period.sync="period"
                />
                <currency-select-dropdown />
                <div class="left-divider download-pdf">
                    <p-icon-button name="ic_download" style-type="gray-border" size="sm" />
                </div>
                <div class="left-divider">
                    <p-icon-text-button name="ic_edit" style-type="gray-border" size="sm"
                                        @click.stop="handleClickCustomize"
                    >
                        Customize
                    </p-icon-text-button>
                </div>
            </div>
            <cost-dashboard-filter :dashboard-id="dashboardId" :filters.sync="filters" />
        </div>
        <dashboard-layouts :loading="loading"
                           :layout="layout"
                           :period="period"
                           :filters="filters"
                           :currency="currency"
                           :currency-rates="currencyRates"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :loading="checkDeleteState.loading"
                      @confirm="handleDeleteDashboardConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { keyBy } from 'lodash';
import { i18n } from '@/translations';
import {
    PBreadcrumbs, PIconButton, PIconTextButton, PPageTitle,
} from '@spaceone/design-system';

import { BILLING_ROUTE } from '@/services/billing/routes';

import CurrencySelectDropdown from '@/services/billing/cost-management/modules/CurrencySelectDropdown.vue';
import DashboardLayouts from '@/services/billing/cost-management/cost-dashboard/modules/DashboardLayouts.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import CostDashboardFilter from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardFilter.vue';
import CostDashboardMoreMenu from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardMoreMenu.vue';
import CostDashboardPeriodSelectDropdown
    from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardPeriodSelectDropdown.vue';
import {
    CustomLayout, DashboardInfo,
} from '@/services/billing/cost-management/cost-dashboard/type';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';
import { SpaceRouter } from '@/router';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

export default {
    name: 'CostDashboardPage',
    components: {
        CostDashboardPeriodSelectDropdown,
        CostDashboardMoreMenu,
        DashboardLayouts,
        CurrencySelectDropdown,
        CostDashboardFilter,
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
        PIconTextButton,
        DeleteModal,
    },
    props: {
        dashboardId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
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

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: state.dashboard.name || props.dashboardId },
            ]),
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: 'Are you sure you want to delete dashboard?',
            loading: true,
        });

        /* event */
        const handleClickEditDashboard = () => {
            console.log('edit dashboard');
        };

        const handleClickDeleteDashboard = () => {
            checkDeleteState.visible = true;
        };
        const handleDeleteDashboardConfirm = async () => {
            try {
                checkDeleteState.loading = true;
                if (props.dashboardId?.startsWith('user')) {
                    await SpaceConnector.client.costAnalysis.userDashboard.delete({
                        user_dashboard_id: props.dashboardId,
                    });
                } else {
                    await SpaceConnector.client.costAnalysis.dashboard.delete({
                        public_dashboard_id: props.dashboardId,
                    });
                }
                await SpaceRouter.router.replace({ name: BILLING_ROUTE.COST_MANAGEMENT._NAME });
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to delete dashboard');
            } finally {
                checkDeleteState.loading = false;
                checkDeleteState.visible = false;
            }
        };

        const handleUpdatePeriod = (period: Period) => {
            state.period = period;
        };
        const handleUpdateFixedPeriod = (periodType) => {
            state.periodType = periodType;
        };

        const handleClickCustomize = () => {
            SpaceRouter.router.push({ name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE._NAME, params: { dashboardId: props.dashboardId } });
        };

        const fetchDefaultLayoutData = async (layoutId: string): Promise<any[]> => {
            try {
                // noinspection TypeScriptCheckImport
                const layoutTemplates = await import(`./dashboard-layouts/${layoutId}.json`);
                const widgets = await import('../widgets/lib/defaultWidgetList.json');

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

        const setDashboardLayout = async (dashboard: DashboardInfo): Promise<CustomLayout[]> => {
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
                return await SpaceConnector.client.costAnalysis.dashboard.get({
                    public_dashboard_id: dashboardId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return {} as DashboardInfo;
            }
        };

        const getDashboardLayout = async (dashboardId: string) => {
            state.loading = true;

            const dashboard = await fetchDashboard(dashboardId);
            state.dashboard = dashboard;
            state.layout = await setDashboardLayout(dashboard);
            state.filters = dashboard.default_filter;
            if (dashboard.period) state.period = dashboard.period;
            state.periodType = dashboard.period_type;

            state.loading = false;
        };

        watch([() => props.dashboardId, () => state.homeDashboardId], ([dashboardId, homeDashboardId], before) => {
            if (!dashboardId) {
                if (homeDashboardId) {
                    SpaceRouter.router.replace({
                        params: { dashboardId: homeDashboardId },
                    });
                }
                return;
            }
            if (before && dashboardId === before[0]) return;
            getDashboardLayout(dashboardId);
        }, { immediate: true });


        return {
            ...toRefs(state),
            routeState,
            checkDeleteState,
            handleClickEditDashboard,
            handleClickDeleteDashboard,
            handleDeleteDashboardConfirm,
            handleUpdatePeriod,
            handleClickCustomize,
            handleUpdateFixedPeriod,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-page {
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
    .left-part {
        display: flex;
        align-items: center;
        margin-left: 0.5rem;
        .more-button {
            @apply bg-transparent;
        }
    }
    .right-part {
        @apply flex items-center;
        margin-left: auto;
        .download-pdf::v-deep {
            margin-left: 0;
            .p-button {
                padding: 0 1rem;
            }
        }
    }

    &::v-deep .left-divider {
        @apply relative;
        padding-left: 0.5rem;
        margin-left: 0.5rem;
        &::before {
            @apply bg-gray-300;
            position: absolute;
            top: 50%;
            left: 0;
            display: inline-block;
            width: 0.0625rem;
            height: 1.25rem;
            content: ' ';
            margin-top: calc(-1.25rem / 2);
        }
    }
}

@screen tablet {
    .top-wrapper {
        min-width: 100%;
        max-width: 100%;
    }
}

@screen mobile {
    .p-page-title::v-deep .title-wrapper h2 {
        width: 100%;
    }

    .left-part {
        margin-left: 0;
    }

    .right-part {
        @apply flex flex-wrap justify-end;
    }
}
</style>
