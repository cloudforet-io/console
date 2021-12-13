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
                <!--                <p-icon-button name="ic_edit-text"-->
                <!--                               class="edit-btn"-->
                <!--                               :outline="false"-->
                <!--                               @click.stop="handleClickEditDashboard"-->
                <!--                />-->
                <cost-dashboard-more-menu :dashboard-id="dashboardId" />
            </div>
            <div class="right-part">
                <cost-dashboard-period-select-dropdown :fixed-period="fixedPeriod" @update="handleUpdatePeriod" />
                <currency-select-dropdown />
                <div class="left-divider download-pdf">
                    <p-icon-button name="ic_download" style-type="gray-border" size="sm" />
                </div>
                <!--                <div class="left-divider">-->
                <!--                    <p-icon-text-button name="ic_edit" style-type="gray-border" size="sm">-->
                <!--                        Customize-->
                <!--                    </p-icon-text-button>-->
                <!--                </div>-->
            </div>
            <cost-dashboard-filter :dashboard-id="dashboardId" :filters.sync="filters" />
        </div>
        <dashboard-layouts :layout="layout"
                           :period="period"
                           :filters="filters"
                           :currency="currency"
                           :currency-rates="currencyRates"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { i18n } from '@/translations';
import {
    PBreadcrumbs, PIconButton, PPageTitle,
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
import { DashboardInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';
import { SpaceRouter } from '@/router';

export default {
    name: 'CostDashboardPage',
    components: {
        CostDashboardPeriodSelectDropdown,
        CostDashboardMoreMenu,
        DashboardLayouts,
        CurrencySelectDropdown,
        CostDashboardFilter,
        PIconButton,
        PBreadcrumbs,
        PPageTitle,
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
            layout: [] as any[],
            period: {} as Period,
            fixedPeriod: {} as Period,
            filters: {} as CostQueryFilters,
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            homeDashboardId: computed<string|undefined>(() => store.getters['settings/getItem']('homeDashboard', '/costDashboard')),
        });

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: props.dashboardId },
            ]),
        });

        /* event */
        const handleClickEditDashboard = () => {
            console.log('edit dashboard');
        };

        const handleUpdatePeriod = (period: Period) => {
            state.period = period;
        };

        const getLayoutData = async (layoutId: string) => {
            try {
                // noinspection TypeScriptCheckImport
                const res = await import(`./dashboard-layouts/${layoutId}.json`);
                state.layout = res.default;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.layout = [];
            }
        };

        const getDashboard = async (dashboardId: string) => {
            try {
                const dashboard = await SpaceConnector.client.costAnalysis.dashboard.get({
                    dashboard_id: dashboardId,
                });
                state.dashboard = dashboard;
                state.filters = dashboard.default_filter;
                if (dashboard.period_type === 'FIXED') state.fixedPeriod = dashboard.period;
                else state.fixedPeriod = {};
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dashboard = {} as DashboardInfo;
            }
        };

        watch([() => props.dashboardId, () => state.homeDashboardId], async ([dashboardId, homeDashboardId]) => {
            if (!dashboardId) {
                if (homeDashboardId) {
                    SpaceRouter.router.replace({
                        params: { dashboardId: homeDashboardId },
                    });
                }
                return;
            }

            await getDashboard(dashboardId);
            if (state.dashboard?.default_layout_id) {
                await getLayoutData(state.dashboard.default_layout_id);
            }
        }, { immediate: true });


        return {
            ...toRefs(state),
            routeState,
            handleClickEditDashboard,
            handleUpdatePeriod,
        };
    },
};
</script>

<style lang="postcss" scoped>
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
        .edit-btn {
            margin-left: 0.5rem;
        }
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
