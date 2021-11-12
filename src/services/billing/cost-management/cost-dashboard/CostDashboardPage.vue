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
                        <p-select-dropdown v-model="filterState.selectedCurrency"
                                           class="filter-item"
                                           :items="filterState.currencyItems"
                                           without-outline
                                           @select="handleSelectCurrency"
                        />
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
        <div style="height: 50rem; background-color: #fff;">
            {{ dashboardId }} 대쉬보드으~
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { i18n } from '@/translations';

import {
    PBreadcrumbs, PIconButton, PIconTextButton, PPageTitle, PSelectDropdown, PTag,
} from '@spaceone/design-system';
import { BILLING_ROUTE } from '@/services/billing/routes';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { CURRENCY } from '@/services/billing/cost-management/cost-analysis/lib/config';

const tempProjectsData = [
    {
        id: 'a-1',
        name: 'project1',
    },
    {
        id: 'a-2',
        name: 'project22',
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
        FavoriteButton,
        PIconButton,
        PBreadcrumbs,
        PPageTitle,
        PIconTextButton,
        PSelectDropdown,
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
        });

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: props.dashboardId },
            ]),
        });

        const filterState = reactive({
            selectedCurrency: CURRENCY.USD,
            currencyItems: computed<MenuItem[]>(() => ([
                { type: 'item', name: CURRENCY.USD, label: '$USD' },
                { type: 'item', name: CURRENCY.KRW, label: '$KRW' },
                { type: 'item', name: CURRENCY.JPY, label: '¥JPY' },
            ])),
        });

        /* event */
        const handleClickEditDashboard = () => {
            console.log('edit dashboard');
        };
        const handleSelectCurrency = () => {
            console.log('select currency');
        };
        const handleClickMore = () => {
            console.log('click more!');
        };
        const handleClickFilter = () => {
            console.log('click more!');
        };

        return {
            ...toRefs(state),
            routeState,
            filterState,
            handleClickEditDashboard,
            handleSelectCurrency,
            handleClickMore,
            handleClickFilter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-page {
    max-width: 85.5rem;
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
