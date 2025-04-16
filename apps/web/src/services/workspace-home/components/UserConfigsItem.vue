<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PI, PTextHighlighting } from '@cloudforet/mirinae';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import type { ReferenceData } from '@/lib/helper/config-data-helper';
import { getParsedKeysWithManagedCostQueryFavoriteKey } from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { gray, indigo, peacock } from '@/styles/colors';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

interface Props {
    item?: ReferenceData;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});
const workspaceHomePageStore = useWorkspaceHomePageStore();


const router = useRouter();

const { getReferenceLocation } = useReferenceRouter();

const state = reactive({
    iconColor: computed<string|undefined>(() => {
        if (props.item?.itemType === FAVORITE_TYPE.PROJECT) {
            return peacock[600];
        }
        if (props.item?.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
            return indigo[500];
        }
        if (props.item?.itemType === FAVORITE_TYPE.METRIC || props.item?.itemType === FAVORITE_TYPE.METRIC_EXAMPLE) {
            return gray[500];
        }
        return undefined;
    }),
});

const handleClickFavorite = () => {
    workspaceHomePageStore.fetchFavoriteList();
};
const handleClickItem = () => {
    if (!props.item) return;
    const itemName = props.item.name as string;
    if (props.item.itemType === FAVORITE_TYPE.DASHBOARD) {
        router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: itemName,
            },
        }).catch(() => {});
        return;
    }
    if (props.item.itemType === FAVORITE_TYPE.PROJECT) {
        router.push(getReferenceLocation(itemName, { resource_type: 'identity.Project' })).catch(() => {});
        return;
    }
    if (props.item.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        router.push(getReferenceLocation(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
        return;
    }
    if (props.item.itemType === FAVORITE_TYPE.COST_ANALYSIS) {
        const parsedKeys = getParsedKeysWithManagedCostQueryFavoriteKey(itemName);
        router.push({
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId: props.item.dataSourceId,
                costQuerySetId: parsedKeys ? parsedKeys[1] : itemName,
            },
        }).catch(() => {});
        return;
    }
    if (props.item.itemType === FAVORITE_TYPE.SECURITY) {
        const itemInfo: string[] = itemName.split('.');
        router.push({
            name: ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
            params: {
                provider: itemInfo[0],
                group: itemInfo[1],
                name: props.item.label as string,
            },
        }).catch(() => {});
        return;
    }
    if (props.item.itemType === FAVORITE_TYPE.SERVICE) {
        router.push({
            name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
            params: {
                serviceId: props.item.itemId,
            },
        }).catch(() => {});
        return;
    }
    const menuInfo: MenuInfo = MENU_INFO_MAP[itemName];
    if (menuInfo && router.currentRoute.name !== itemName) {
        router.push({ name: menuInfo.routeName }).catch(() => {});
    }
};
</script>

<template>
    <div class="user-configs-item"
         :class="{'is-hidden-favorite-button': props.isHiddenFavoriteButton}"
         @click="handleClickItem"
    >
        <span class="image">
            <p-i :name="props.item?.icon"
                 width="1rem"
                 height="1rem"
                 :color="state.iconColor"
            />
        </span>
        <span class="texts">
            <template v-if="props.item?.parents">
                <template v-for="(parent, pIdx) in props.item?.parents">
                    <p-text-highlighting :key="`parent-${parent.label}-${pIdx}`"
                                         class="text-item"
                                         :text="parent.label"
                    />
                    <span :key="`arrow-${pIdx}`">
                        <p-i name="ic_chevron-right-thin"
                             width="1rem"
                             height="1rem"
                        />
                    </span>
                </template>
            </template>
            <p-text-highlighting :key="`leaf-${props.item?.label}`"
                                 class="text-item"
                                 :text="props.item?.label"
            />
        </span>
        <favorite-button
            :item-id="props.item?.itemId"
            :favorite-type="props.item?.itemType"
            scale="0.8"
            class="favorite-button"
            @click-favorite="handleClickFavorite"
        />
    </div>
</template>

<style scoped lang="postcss">
.user-configs-item {
    @apply relative flex items-center rounded cursor-pointer;
    width: 100%;
    &:hover {
        @apply bg-gray-150;
        .favorite-button {
            @apply block;
        }
    }
    &.is-hidden-favorite-button {
        .texts {
            width: calc(100% - 2.5rem);
        }
    }
    .image {
        padding: 0.5rem;
    }
    .texts {
        @apply truncate;
        width: calc(100% - 4rem);
    }
    .favorite-button {
        @apply absolute hidden;
        top: 0.5rem;
        right: 0.5rem;
    }
}
</style>
