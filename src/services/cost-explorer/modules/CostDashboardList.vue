<template>
    <div>
        <li v-for="(item) in dashboardList" :key="item.dashboard_id"
            class="menu-item"
            :class="{'selected': item.dashboard_id === dashboardIdFromRoute}"
        >
            <router-link
                :to="{
                    name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                    params: {
                        dashboardId: item.dashboard_id
                    }
                }"
                class="link"
            >
                <span class="title">
                    {{ item.name }}
                </span>
                <p-i v-if="item.dashboard_id === homeDashboardId" name="ic_home" class="home-icon"
                     width="0.875rem" height="0.875rem"
                />
            </router-link>
        </li>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, PropType, reactive, toRefs,
} from '@vue/composition-api';
import {
    PI,
} from '@spaceone/design-system';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';
import {
    DashboardMenuItem,
    PublicDashboardInfo,
    UserDashboardInfo,
} from '@/services/cost-explorer/cost-dashboard/type';


export default {
    name: 'CostDashboardList',
    components: {
        PI,
    },
    props: {
        publicDashboardItems: {
            type: Array as PropType<Array<PublicDashboardInfo>>,
            default: () => [],
        },
        userDashboardItems: {
            type: Array as PropType<Array<UserDashboardInfo>>,
            default: () => [],
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            moreMenuItems: computed(() => [
                { name: 'duplicate', label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.DUPLICATE'), disabled: true },
                { name: 'setHome', label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.SET_HOME') },
            ]),
            selectedMoreMenuItem: '',
            dashboardIdFromRoute: computed<string|undefined>(() => vm.$route.params.dashboardId),
            homeDashboardId: computed(() => store.getters['settings/getItem']('homeDashboard', '/costDashboard')),
            publicDashboardList: computed<DashboardMenuItem[]>(() => props.publicDashboardItems?.map(d => ({
                ...d,
                dashboard_id: d.public_dashboard_id,
                label: d.name,
            }))),
            userDashboardList: computed<DashboardMenuItem[]>(() => props.userDashboardItems?.map(d => ({
                ...d,
                dashboard_id: d.user_dashboard_id,
                label: d.name,
            }))),
            dashboardList: computed<DashboardMenuItem[]>(() => (props.isPublic ? state.publicDashboardList : state.userDashboardList)),
        });

        /* util */
        const handleSelectMoreMenu = (item, selectedMoreMenuItem) => {
            state.selectedMoreMenuItem = selectedMoreMenuItem;
            if (state.selectedMoreMenuItem === 'setHome') {
                store.dispatch('settings/setItem', {
                    key: 'homeDashboard',
                    value: item.dashboard_id,
                    path: '/costDashboard',
                });
            }
        };

        const showHomeDashboardPage = () => {
            SpaceRouter.router.replace({
                name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                params: { dashboardId: state.homeDashboardId },
            });
        };

        const setInitialHomeDashboard = () => {
            store.dispatch('settings/setItem', {
                key: 'homeDashboard',
                value: state.dashboardList[0]?.public_dashboard_id ?? state.dashboardList[0]?.user_dashboard_id,
                path: '/costDashboard',
            });
        };

        (async () => {
            if (!state.homeDashboardId) setInitialHomeDashboard();

            if (vm.$route.name === COST_EXPLORER_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME && !state.dashboardIdFromRoute) { // with no params
                showHomeDashboardPage();
            }
        })();

        return {
            ...toRefs(state),
            handleSelectMoreMenu,
            COST_EXPLORER_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.menu-item {
    @apply rounded text-gray-900;
    display: flex;
    position: relative;
    align-items: center;
    width: 100%;
    height: 2rem;
    font-size: 0.875rem;
    line-height: 140%;
    &:hover {
        @apply bg-blue-100 cursor-pointer;
    }
    &:active {
        @apply bg-blue-200 text-blue-600 cursor-pointer;
    }
    &.selected {
        @apply bg-blue-200 text-blue-600 cursor-pointer;
    }
    .title {
        @apply truncate inline-block;
        margin-right: 0.25rem;
        padding-bottom: 0.5rem;
        padding-left: 0.75rem;
        padding-top: 0.4rem;
        max-width: calc(100% - 0.75rem);
    }
    .link {
        @apply flex items-center;
        width: 100%;
        height: 2rem;
        .home-icon {
            display: inline-block;
            flex-shrink: 0;
            margin-left: 0.125rem;
            margin-right: 0.75rem;
        }
        .favorite-icon {
            flex-shrink: 0;
            margin-right: 0.125rem;
        }
        .public-icon {
            flex-shrink: 0;
            margin-right: 0.125rem;
            margin-top: -1.5rem;
        }
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
