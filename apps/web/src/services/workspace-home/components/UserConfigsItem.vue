<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PLazyImg, PI, PTextHighlighting } from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import type { ReferenceData } from '@/lib/helper/config-data-helper';
import { getParsedKeysWithManagedCostQueryFavoriteKey } from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { indigo, peacock } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

interface Props {
    item?: ReferenceData;
    isHiddenFavoriteButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
    isHiddenFavoriteButton: false,
});

const router = useRouter();

const emit = defineEmits<{(e: 'click-favorite'): void;
}>();

const state = reactive({
    iconColor: computed<string|undefined>(() => {
        if (props.item?.itemType === FAVORITE_TYPE.PROJECT) {
            return peacock[700];
        }
        if (props.item?.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
            return indigo[500];
        }
        return undefined;
    }),
});

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
        router.push(referenceRouter(itemName, { resource_type: 'identity.Project' })).catch(() => {});
        return;
    }
    if (props.item.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        router.push(referenceRouter(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
        return;
    }
    if (props.item.itemType === FAVORITE_TYPE.CLOUD_SERVICE || props.item.itemType === RECENT_TYPE.CLOUD_SERVICE_TYPE) {
        const itemInfo: string[] = itemName.split('.');
        router.push({
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
            params: {
                provider: itemInfo[0],
                group: itemInfo[1],
                name: itemInfo[2],
            },
        }).catch(() => {});
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
                name: itemInfo[2],
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
            <p-lazy-img v-if="props.item?.itemType === FAVORITE_TYPE.CLOUD_SERVICE
                            || props.item?.itemType === FAVORITE_TYPE.SECURITY
                            || props.item?.itemType === RECENT_TYPE.CLOUD_SERVICE_TYPE
                        "
                        :src="assetUrlConverter(props.item?.icon || '')"
                        width="1rem"
                        height="1rem"
            />
            <p-i v-else
                 :name="props.item?.icon"
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
            v-if="!props.isHiddenFavoriteButton"
            :item-id="props.item?.itemId"
            :favorite-type="props.item?.itemType"
            scale="0.8"
            class="favorite-button"
            @click-favorite="emit('click-favorite')"
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
