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
            recents: computed<RecentConfig[]>(() => store.state.recent.allItems),
            recentDashboardItems: computed<RecentItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, store.getters['user/pagePermissionList']);
                // Todo: create converter for recent items
                // return isUserAccessible ? convertToRecentData(state.recents.filter((d) => d.itemType === RECENT_TYPE.DASHBOARD)) : [];
                return isUserAccessible ? [
                    {
                        itemId: 'd1', itemType: RECENT_TYPE.DASHBOARD, label: 'dashboard1', name: '1',
                    },
                    {
                        itemId: 'd2', itemType: RECENT_TYPE.DASHBOARD, label: 'dashboard2', name: '2',
                    },
                    {
                        itemId: 'd3', itemType: RECENT_TYPE.DASHBOARD, label: 'dashboard3', name: '3',
                    },
                ] : [];
            }),
        });

        const dashboardRouteFormatter = (id) => ({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: { dashboardId: id },
        });
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
