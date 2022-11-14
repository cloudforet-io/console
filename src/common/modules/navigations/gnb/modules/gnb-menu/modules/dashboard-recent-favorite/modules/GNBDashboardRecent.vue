<template>
    <div class="gnb-dashboard-recent">
        <p-data-loader :data="recentDashboardItems"
                       :loading="loading"
                       :class="{ loading: loading && !recentDashboardItems.length }"
        >
            <div class="gnb-dashboard-recent-list">
                <g-n-b-sub-menu v-for="(item) in recentDashboardItems"
                                :key="`recent-${item.label}-${item.name}`"
                                class="dashboard-recent-item"
                                :label="item.label"
                                :to="dashboardRouteFormatter(item.name)"
                >
                    <template #extra-mark>
                        <favorite-button class="favorite-button"
                                         :item-id="item.name"
                                         :favorite-type="item.itemType"
                                         scale="0.65"
                        />
                    </template>
                </g-n-b-sub-menu>
            </div>
            <template #no-data>
                <div class="no-data">
                    <img class="img"
                         src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                    >
                    <p class="text">
                        <!--song-lang-->
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_ITEMS') }}
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import { sortBy } from 'lodash';

import { store } from '@/store';

import type { RecentConfig, RecentItem } from '@/store/modules/recent/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import { MENU_ID } from '@/lib/menu/config';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    visible: boolean;
}

export default defineComponent<Props>({
    name: 'GNBDashboardRecent',
    components: {
        FavoriteButton,
        GNBSubMenu,
        PDataLoader,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({
            loading: false,
            // load from dashboard api
            dashboardList: [
                { name: 'dashboard1', dashboardId: '1' },
                { name: 'dashboard2', dashboardId: '2' },
                { name: 'dashboard3', dashboardId: '3' },
                { name: 'dashboard4', dashboardId: '4' },
                { name: 'dashboard5', dashboardId: '5' },
                { name: 'dashboard6', dashboardId: '6' },
                { name: 'dashboard7', dashboardId: '7' },
                { name: 'dashboard8', dashboardId: '8' },
            ],
            recents: computed<RecentConfig[]>(() => store.state.recent.dashboardItems),
            recentDashboardItems: computed<RecentItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, store.getters['user/pagePermissionList']);
                const recentItemList = [] as RecentItem[];
                state.recents.forEach((recent) => {
                    state.dashboardList.forEach((dashboard) => {
                        if (recent.itemId === dashboard.dashboardId) {
                            recentItemList.push({
                                itemId: dashboard.dashboardId,
                                label: dashboard.name,
                                name: dashboard.name,
                                itemType: RECENT_TYPE.DASHBOARD,
                                updatedAt: recent.updatedAt,
                            });
                        }
                    });
                });
                return isUserAccessible ? sortBy(recentItemList, (recent) => recent.updatedAt).reverse() : [];
            }),
        });

        const dashboardRouteFormatter = (id) => ({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: { dashboardId: id },
        });
        /* Init */
        (async () => {
            state.loading = true;
            await store.dispatch('recent/load', { type: RECENT_TYPE.DASHBOARD });
            state.loading = false;
        })();
        return {
            ...toRefs(state),
            dashboardRouteFormatter,
        };
    },
});
</script>
<style lang="postcss" scoped>
.gnb-dashboard-recent {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 13rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 0.5rem;
        }
    }

    .gnb-dashboard-recent-list {
        @apply bg-white border-none;
        max-height: unset;
        .dashboard-recent-item {
            width: 100%;
            .favorite-button {
                visibility: hidden;
            }
            &:hover {
                .favorite-button {
                    visibility: visible;
                }
            }
        }
    }

    .no-data {
        text-align: center;
        padding: 1.875rem 3.25rem;
        .img {
            margin-bottom: 0.9375rem;
        }
        .text {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
        }
    }
}
</style>
