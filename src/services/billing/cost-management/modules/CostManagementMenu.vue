<template>
    <aside class="sidebar-menu">
        <p class="sidebar-title">
            {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FAVORITES') }}
        </p>
        <p-divider class="sidebar-divider" />
        <p class="sidebar-title">
            {{ $t('BILLING.COST_MANAGEMENT.MAIN.DASHBOARD') }}
        </p>
        <p-divider class="sidebar-divider" />
        <cost-dashboard-list />
        <div v-for="(item) in menuList" :key="item.label"
             @click="showPage(item.routeName)"
        >
            <sidebar-title :title="item.label"
                           style-type="link"
            />
        </div>
    </aside>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import {
    PDivider,
} from '@spaceone/design-system';
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import { i18n } from '@/translations';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { SpaceRouter } from '@/router';
import CostDashboardList from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardList.vue';

interface ListItem {
    routeName?: string;
    label?: TranslateResult;
}

export default {
    name: 'CostManagementMenu',
    components: {
        CostDashboardList,
        SidebarTitle,
        PDivider,
    },
    setup() {
        const state = reactive({
            menuList: computed<ListItem[]>(() => [
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.COST_ANALYSIS'),
                },
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.BUDGET'),
                },
            ]),
        });

        /* util */
        const showPage = (routeName, routeParam) => {
            if (routeParam) {
                SpaceRouter.router.replace({
                    name: routeName,
                    params: { dashboardId: routeParam },
                }).catch(() => {});
            } else {
                SpaceRouter.router.replace({ name: routeName }).catch(() => {});
            }
        };

        return {
            ...toRefs(state),
            showPage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sidebar-title {
    @apply text-gray-900 text-sm font-bold;
    position: relative;
    align-items: center;
    padding: 2rem 0 0.75rem 1rem;
    .count {
        font-weight: normal;
    }
}
.sidebar-divider {
    @apply w-full;
    padding-left: 0;
    margin-bottom: 0.75rem;
}
.dashboard-list {
    margin: 0 0.75rem 1.5rem;
}
.menu-item {
    @apply rounded text-gray-900;
    display: flex;
    position: relative;
    align-items: center;
    width: 100%;
    height: 2rem;
    padding: 0.375rem 0.125rem;
    font-size: 0.875rem;
    line-height: 140%;
    &:hover {
        @apply bg-blue-100 cursor-pointer;
    }
    &:active {
        @apply bg-blue-200 text-blue-500 cursor-pointer;
    }
    &.selected {
        @apply bg-blue-200 text-blue-500 cursor-pointer;
    }
    .title {
        @apply truncate;
    }
    .home-icon {
        flex-shrink: 0;
        margin-left: 0.125rem;
    }
    .favorite-icon {
        flex-shrink: 0;
        margin-right: 0.125rem;
    }
    .private-icon {
        flex-shrink: 0;
        margin-right: 0.125rem;
    }
    .more-button::v-deep {
        display: none;
        flex-shrink: 0;
        margin-left: auto;
        background-color: transparent;
        button:hover {
            background-color: transparent;
        }
    }
    &:hover .more-button::v-deep {
        display: inline-block;
    }
}
.add-button {
    position: absolute;
    bottom: 0.5rem;
    right: 0.75rem;
}

</style>
