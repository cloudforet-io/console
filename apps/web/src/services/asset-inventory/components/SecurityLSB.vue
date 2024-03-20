<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PDataLoader } from '@spaceone/design-system';

import { store } from '@/store';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const { getProperRouteLocation } = useProperRouteLocation();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const gnbStore = useGnbStore();
const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    loading: computed(() => securityPageGetters.loading),
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
    selectedCloudServiceType: computed(() => securityPageGetters.selectedCloudServiceType),
});
const state = reactive({
    currentGrantInfo: computed(() => store.getters['user/getCurrentGrantInfo']),
    pageParams: computed<CloudServiceDetailPageParams|undefined>(() => route.params as unknown as CloudServiceDetailPageParams),
    menuSet: computed<LSBItem[]>(() => {
        const defaultMenuSet: LSBItem[] = [];
        storeState.cloudServiceTypeList?.forEach((d, index, array) => {
            defaultMenuSet.push({
                type: MENU_ITEM_TYPE.TOP_TITLE,
                label: d.group,
                titleIcon: d.items && d.items[0].icon,
                id: d.group,
            });
            d.items?.forEach((i) => {
                defaultMenuSet.push({
                    type: MENU_ITEM_TYPE.ITEM,
                    label: `[${allReferenceGetters.provider[i.data.provider].label}] ${i.name}`,
                    id: i.key,
                    to: getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME, params: { group: i.data.group, provider: i.data.provider, name: i.name } }),
                    favoriteOptions: {
                        type: FAVORITE_TYPE.SECURITY,
                        id: i.data.cloud_service_type_key,
                    },
                });
            });
            if (index !== array.length - 1) {
                defaultMenuSet.push({ type: MENU_ITEM_TYPE.DIVIDER });
            }
        });
        return defaultMenuSet;
    }),
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.SECURITY,
        id: storeState.selectedCloudServiceType?.data.cloud_service_type_key || '',
    })),
});

const routeToFirstCloudServiceType = async () => {
    const selectedCloudServiceType = storeState.selectedCloudServiceType;
    if (selectedCloudServiceType) {
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
            params: {
                provider: selectedCloudServiceType?.data.provider || '',
                group: selectedCloudServiceType?.data.group || '',
                name: selectedCloudServiceType?.name || '',
            },
            query: route.query,
        })).catch(() => {});
    }
};

/* Watchers */
watch(() => state.pageParams, (pageParams) => {
    if (pageParams?.name) {
        securityPageStore.setSelectedCloudServiceType(pageParams.group, pageParams.name);
    } else {
        securityPageStore.setSelectedCloudServiceType();
    }
}, { immediate: true });
watch(() => storeState.selectedCloudServiceType, () => {
    routeToFirstCloudServiceType();
});
watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
});
</script>

<template>
    <p-data-loader :loading="storeState.loading"
                   :data="true"
                   :loader-backdrop-color="BACKGROUND_COLOR"
                   class="security-l-s-b"
    >
        <l-s-b :menu-set="state.menuSet" />
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.security-l-s-b {
    height: 100%;
}
</style>
