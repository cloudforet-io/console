<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataLoader, PEmpty } from '@spaceone/design-system';
import {
    computed, nextTick, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import draggable from 'vuedraggable';
import { useStore } from 'vuex';

import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import type {
    GNBDashboardMenuItem,
} from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    dashboardList: GNBDashboardMenuItem[];
}

const props = withDefaults(defineProps<Props>(), {
    dashboardList: () => [],
});
const emit = defineEmits<{(e: 'close'): void;
    (e: 'update:is-overflown', value: boolean): void;
}>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    loading: true,
    favoriteDashboardIdList: computed<FavoriteItem[]>(() => store.state.favorite.dashboardItems),
    favoriteDashboardList: computed<FavoriteItem[]>(() => {
        const favoriteList: FavoriteItem[] = [];
        props.dashboardList.forEach((dashboard) => {
            const isFavoriteDashboard = !!(state.favoriteDashboardIdList ?? []).filter((d) => dashboard.dashboardId === d.itemId).length;
            if (isFavoriteDashboard) {
                favoriteList.push({
                    itemId: dashboard.dashboardId,
                    label: dashboard.name,
                    itemType: FAVORITE_TYPE.DASHBOARD,
                });
            }
        });
        return favoriteList;
    }),
    favoriteOrderList: [] as string[],
    sortedFavoriteList: computed<FavoriteItem[]>({
        get: () => {
            const nonExistentOrderList: FavoriteItem[] = [];
            const sortedList: FavoriteItem[] = [];
            state.favoriteOrderList.forEach((dashboardId) => {
                const favoriteItem = (state.favoriteDashboardList ?? []).find((favorite) => favorite.itemId === dashboardId);
                if (favoriteItem) sortedList.push(favoriteItem);
            });
            state.favoriteDashboardList.forEach((item) => {
                const itemId = state.favoriteOrderList.find((id) => item.itemId === id);
                if (!itemId) nonExistentOrderList.push(item);
            });
            return [...nonExistentOrderList, ...sortedList];
        },
        set: (value) => {
            state.favoriteOrderList = value.map((favorite) => favorite.itemId);
            isOverflown();
            setFavoriteOrderList();
        },
    }),
    listContainerRef: null as HTMLElement | null,
    favoriteRef: null as HTMLElement | null,
});

const hideMenu = () => { emit('close'); };
/* Event */

const dashboardRouteFormatter = (id) => {
    const routeName = id.startsWith('project') ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
    return {
        name: routeName,
        params: {
            dashboardId: id,
        },
    };
};

const getFavoriteOrderList = async () => {
    try {
        const { results } = await SpaceConnector.client.addOns.favorite.orderList.get({
            type: FAVORITE_TYPE.DASHBOARD,
        });
        state.favoriteOrderList = results[0]?.data?.order_list ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.favoriteOrderList = [];
    }
};

const setFavoriteOrderList = async () => {
    try {
        state.loading = true;
        await SpaceConnector.client.addOns.favorite.orderList.set({
            type: FAVORITE_TYPE.DASHBOARD,
            order_list: state.favoriteOrderList,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

const isOverflown = () => {
    if (state.listContainerRef && state.favoriteRef) {
        return (state.favoriteRef?.clientHeight < state.listContainerRef?.scrollHeight);
    } return false;
};

/* Init */
(async () => {
    state.loading = true;
    await getFavoriteOrderList();
    state.loading = false;
    await nextTick();
    emit('update:is-overflown', isOverflown());
})();

</script>

<template>
    <div ref="favoriteRef"
         class="gnb-dashboard-favorite"
    >
        <p-data-loader :data="state.sortedFavoriteList"
                       :loading="state.loading"
                       class="gnb-dashboard-favorite-context"
        >
            <div ref="listContainerRef">
                <draggable v-model:model-value="state.sortedFavoriteList"
                           item-key="itemId"
                >
                    <template #item="{element}">
                        <div>
                            <g-n-b-sub-menu :label="element.label"
                                            :is-draggable="true"
                                            :to="dashboardRouteFormatter(element.itemId)"
                                            @navigate="hideMenu"
                            >
                                <template #extra-mark>
                                    <favorite-button :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                                     :item-id="element.itemId"
                                                     scale="0.65"
                                    />
                                </template>
                            </g-n-b-sub-menu>
                        </div>
                    </template>
                </draggable>
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
                    {{ t('COMMON.GNB.DASHBOARDS.NO_ITEMS') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-dashboard-favorite {
    .gnb-dashboard-favorite-context {
        max-height: calc(85vh - 9rem);
        overflow-y: auto;
        padding: 0.5rem;
        min-height: 15rem;
        text-transform: none;
    }
}
</style>
