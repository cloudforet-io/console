<template>
    <div class="cost-dashboard-page">
        <p-breadcrumbs :routes="routeState.route" />
        <div class="top-wrapper">
            <p-page-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')" />
            <div class="left-part">
                <favorite-button :item-id="'item-id1'"
                                 favorite-type="project"
                                 resource-type="identity.Project"
                />
                <p-icon-button name="ic_edit-text"
                               class="edit-btn"
                               :outline="false"
                               @click.stop="handleClickEditDashboard"
                />
                <p-select-dropdown class="more-button"
                                   :items="moreMenuItems"
                                   button-style-type="transparent"
                                   use-fixed-menu-style
                                   type="icon-button"
                                   button-icon="ic_more"
                />
            </div>
            <div class="right-part">
                <div class="date-filter">
                    <p-badge style-type="gray200">
                        <div>December 1, 2020 ~ November 30, 2021</div>
                    </p-badge>
                    <p-select-dropdown :items="MonthDateItems"
                                       :selected="currency"
                                       without-outline
                    />
                </div>
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
            <div class="set-filter-part">
                <p class="applied-filter">
                    <span class="label">Applied Filter:</span><span class="count"> 55 Projects & 20 Service Accounts</span>
                </p>
                <p-button
                    style-type="gray-border"
                    size="sm"
                    @click.stop="handleClickFilter"
                >
                    View Filter
                </p-button>
                <div class="left-divider">
                    <p-icon-button name="ic_setting" style-type="gray900" size="sm"
                                   outline
                    />
                </div>
            </div>
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
    PBreadcrumbs, PIconButton, PPageTitle, PSelectDropdown, PBadge, PButton,
} from '@spaceone/design-system';

import { BILLING_ROUTE } from '@/services/billing/routes';

import CurrencySelectDropdown from '@/services/billing/cost-management/modules/CurrencySelectDropdown.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import DashboardLayouts from '@/services/billing/cost-management/cost-dashboard/modules/DashboardLayouts.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

const tempProjectsData = [
    {
        id: 'a-1',
        name: 'project1',
    },
    {
        id: 'a-2',
        name: 'project2',
    },
    {
        id: 'a-3',
        name: 'project3',
    },
    {
        id: 'a-4',
        name: 'project4',
    },
];

export default {
    name: 'CostDashboardPage',
    components: {
        DashboardLayouts,
        CurrencySelectDropdown,
        FavoriteButton,
        PIconButton,
        PButton,
        PBreadcrumbs,
        PPageTitle,
        PSelectDropdown,
        PBadge,
    },
    props: {
        dashboardId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            selectedProjects: computed(() => tempProjectsData.map(d => ({
                ...d,
            }))),
            dashboard: null as any,
            layout: [] as any[],
            period: {} as Period,
            filters: {},
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            moreMenuItems: computed(() => [
                { name: 'visibility', label: 'Edit Visibility' },
                { name: 'duplicate', label: 'Duplicate' },
                { name: 'set as home', label: 'Set as Home Dashboard' },
            ]),
            MonthDateItems: computed<MenuItem[]>(() => ([
                {
                    type: 'item',
                    name: 'Custom',
                    label: 'Custom',
                },
                {
                    type: 'divider',
                },
                {
                    type: 'item',
                    name: 'November 2021',
                    label: 'November 2021',
                },
                {
                    type: 'item',
                    name: 'October 2021',
                    label: 'October 2021',
                },
                {
                    type: 'item',
                    name: 'September 2021',
                    label: 'September 2021',
                },
            ])),
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
        const handleClickMore = () => {
            console.log('click more!');
        };
        const handleClickFilter = () => {
            console.log('click more!');
        };

        const getLayoutData = async (layoutId: string) => {
            try {
                // noinspection TypeScriptCheckImport
                const res = await import(`./dashboard-layouts/${layoutId}.json`);
                return res.default;
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const getDashboard = async (dashboardId: string) => {
            try {
                const res = await SpaceConnector.client.costAnalysis.dashboard.get({
                    dashboard_id: dashboardId,
                });
                return res;
            } catch (e) {
                ErrorHandler.handleError(e);
                return null;
            }
        };

        watch(() => props.dashboardId, async (dashboardId) => {
            if (!dashboardId) return;

            state.dashboard = await getDashboard(dashboardId);
            if (state.dashboard?.default_layout_id) {
                state.layout = await getLayoutData(state.dashboard.default_layout_id);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            routeState,
            handleClickEditDashboard,
            handleClickMore,
            handleClickFilter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-page {
    max-width: 120rem;
}
.top-wrapper {
    @apply flex flex-wrap;
    row-gap: 1rem;
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
        .p-badge {
            margin-right: 0.5rem;
        }
        .p-select-dropdown {
            background-color: transparent;
        }
        .download-pdf::v-deep {
            margin-left: 0;
            .p-button {
                padding: 0 1rem;
            }
        }
    }
    .set-filter-part {
        @apply flex items-center;
        width: 100%;
        .applied-filter {
            margin-right: 0.5rem;
            .count {
                @apply text-gray-800;
            }
        }
    }
    .left-divider {
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

@screen mobile {
    .p-page-title::v-deep .title-wrapper h2 {
        width: 100%;
    }

    .left-part {
        margin-left: 0;
    }

    .right-part {
        @apply flex flex-wrap justify-end;
        .date-filter {
            @apply flex flex-wrap justify-end items-center;
            width: 100%;
        }
    }

    .set-filter-part {
        @apply flex flex-wrap;
        .applied-filter {
            width: 100%;
            .label {
                display: none;
            }
        }
    }
}
</style>
