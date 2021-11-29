<template>
    <div class="cost-dashboard-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD')">
            <template #extra>
                <div class="top-left-group">
                    <favorite-button :item-id="'item-id1'"
                                     favorite-type="project"
                                     resource-type="identity.Project"
                    />
                    <p-icon-button name="ic_edit-text"
                                   class="edit-btn"
                                   @click.stop="handleClickEditDashboard"
                    />
                </div>
                <ul class="top-right-group">
                    <li class="group-item">
                        <currency-select-dropdown />
                    </li>
                    <li class="group-item">
                        <p-icon-text-button name="ic_download" style-type="gray-border" size="sm">
                            PDF
                        </p-icon-text-button>
                    </li>
                    <li class="group-item">
                        <p-icon-text-button name="ic_edit" style-type="transparent" size="sm">
                            Customize
                        </p-icon-text-button>
                    </li>
                </ul>
            </template>
        </p-page-title>
        <div class="filter-group">
            <p class="date">
                August 1 ~ August 18, 2021 <span>(18 days)</span>
            </p>
            <div class="filter-project">
                <p-tag v-for="(item, index) in selectedProjects.slice(0, 3)" :key="index" :deletable="false">
                    {{ item.name }}
                </p-tag>
                <button class="more-btn" @click.stop="handleClickMore">
                    and 52 more
                </button>
                <p-icon-button
                    name="ic_setting"
                    style-type="transparent"
                    color="inherit"
                    size="md"
                    @click.stop="handleClickFilter"
                />
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
    PBreadcrumbs, PIconButton, PIconTextButton, PPageTitle, PTag,
} from '@spaceone/design-system';

import { BILLING_ROUTE } from '@/services/billing/routes';

import CurrencySelectDropdown from '@/services/billing/cost-management/modules/CurrencySelectDropdown.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import DashboardLayouts from '@/services/billing/cost-management/cost-dashboard/modules/DashboardLayouts.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';

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
        // PublicCloudCostSummary,
        CurrencySelectDropdown,
        FavoriteButton,
        PIconButton,
        PBreadcrumbs,
        PPageTitle,
        PIconTextButton,
        PTag,
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
.p-page-title {
    margin-bottom: 1rem;
}
.top-left-group {
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
    .edit-btn {
        margin-left: 0.5rem;
    }
}
.top-right-group {
    display: flex;
    align-items: center;
    margin-left: auto;
    .group-item {
        position: relative;
        padding: 0 0.5rem;
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
        &:last-of-type button:hover {
            background-color: transparent;
        }
        &:first-of-type::before {
            @apply hidden;
        }
    }
    .p-select-dropdown {
        background-color: transparent;
    }
}
.filter-group {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    .date {
        display: flex;
        align-items: center;
        span {
            @apply text-gray-700;
            display: inline-block;
            margin-left: 0.5rem;
        }
    }
    .filter-project {
        display: flex;
        align-items: center;
        margin-left: auto;
        .more-btn {
            @apply text-blue-600;
            margin-right: 1rem;
            font-size: 0.75rem;
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
