<template>
    <div class="gnb-dashboard-recent">
        <p-data-loader :data="recentDashboardItems"
                       :loading="loading"
                       class="gnb-dashboard-recent-context"
        >
            <div class="gnb-dashboard-recent-list">
                <g-n-b-sub-menu v-for="(item) in recentDashboardItems"
                                :key="`recent-${item.label}-${item.itemId}`"
                                class="dashboard-recent-item"
                                :label="item.label"
                                :to="dashboardRouteFormatter(item.itemId)"
                                @mouseenter.native="hoveredItem = item.itemId"
                                @mouseleave.native="hoveredItem = ''"
                                @navigate="hideMenu"
                >
                    <template #extra-mark>
                        <favorite-button class="favorite-button"
                                         :item-id="item.itemId"
                                         :favorite-type="item.itemType"
                                         :visible-active-case-only="!getIsHovered(item.itemId)"
                                         scale="0.65"
                        />
                    </template>
                </g-n-b-sub-menu>
            </div>
            <template #no-data>
                <p-empty
                    show-image
                >
                    <template #image>
                        <img alt="empty-image"
                             src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                        >
                    </template>
                    {{ $t('COMMON.GNB.DASHBOARDS.NO_ITEMS') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import type { PropType, SetupContext } from 'vue';
import {
    computed,
    defineComponent, reactive, toRefs, watch,
} from 'vue';

import { PDataLoader, PEmpty } from '@spaceone/design-system';

import { store } from '@/store';

import type { RecentConfig, RecentItem } from '@/store/modules/recent/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import { MENU_ID } from '@/lib/menu/config';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import type {
    GNBDashboardMenuItem,
} from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    visible: boolean;
    dashboardList: GNBDashboardMenuItem[];
}

export default defineComponent<Props>({
    name: 'GNBDashboardRecent',
    components: {
        FavoriteButton,
        GNBSubMenu,
        PDataLoader,
        PEmpty,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        dashboardList: {
            type: Array as PropType<GNBDashboardMenuItem[]>,
            default: () => ([]),
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: false,
            recents: computed<RecentConfig[]>(() => store.state.recent.dashboardItems),
            recentDashboardItems: computed<RecentItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, store.getters['user/pagePermissionList']);
                const recentItemList = [] as RecentItem[];
                state.recents.forEach((recent) => {
                    props.dashboardList.forEach((dashboard) => {
                        if (recentItemList.length === 10) return;
                        if (recent.itemId === dashboard.dashboardId) {
                            recentItemList.push({
                                itemId: dashboard.dashboardId,
                                label: dashboard.name,
                                name: dashboard.dashboardId,
                                itemType: RECENT_TYPE.DASHBOARD,
                                updatedAt: recent.updatedAt,
                            });
                        }
                    });
                });
                return isUserAccessible ? recentItemList : [];
            }),
            hoveredItem: '',
        });

        const dashboardRouteFormatter = (id) => {
            const routeName = id.startsWith('project') ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
            return {
                name: routeName,
                params: {
                    dashboardId: id,
                },
            };
        };
        const getIsHovered = (itemId: string):boolean => !!(state.hoveredItem && state.hoveredItem === itemId);
        const hideMenu = () => {
            emit('close');
        };

        /* Watcher */
        watch(() => props.visible, async (visible) => {
            if (visible) {
                state.loading = true;
                await store.dispatch('recent/load', { itemType: RECENT_TYPE.DASHBOARD });
                state.loading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            dashboardRouteFormatter,
            getIsHovered,
            hideMenu,
        };
    },
});
</script>
<style lang="postcss" scoped>
.gnb-dashboard-recent {
    .gnb-dashboard-recent-context {
        max-height: calc(85vh - 9rem);
        overflow-y: auto;
        padding: 0.5rem;
        min-height: 15rem;
    }

    .gnb-dashboard-recent-list {
        @apply bg-white border-none;
        max-height: unset;
        .dashboard-recent-item {
            width: 100%;
        }
    }
}
</style>
