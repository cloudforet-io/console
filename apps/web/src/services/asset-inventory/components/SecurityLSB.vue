<script lang="ts" setup>
import {
    computed, onBeforeMount, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PDataLoader } from '@spaceone/design-system';

import { store } from '@/store';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type {
    LSBItem,
} from '@/common/modules/navigations/lsb/type';
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
const securityPageState = securityPageStore.state;
const securityPageGetters = securityPageStore.getters;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
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
                titleIcon: d.titleIcon,
                id: d.group,
            });
            d.items?.forEach((i) => {
                defaultMenuSet.push({
                    type: MENU_ITEM_TYPE.ITEM,
                    label: `[${allReferenceGetters.provider[i.provider].label}] ${i.name}`,
                    id: i.cloud_service_type_id,
                    to: getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME, params: { group: d.group, provider: d.provider, name: i.name || '' } }),
                    favoriteOptions: {
                        type: FAVORITE_TYPE.SECURITY,
                        id: i.cloud_service_type_key,
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
        id: securityPageGetters.selectedCloudServiceType?.cloud_service_type_key || '',
    })),
});

const routeToFirstCloudServiceType = async () => {
    const selectedCloudServiceType = securityPageGetters.selectedCloudServiceType;
    await router.replace(getProperRouteLocation({
        name: ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
        params: {
            provider: selectedCloudServiceType?.provider || '',
            group: selectedCloudServiceType?.group || '',
            name: selectedCloudServiceType?.name || '',
        },
        query: route.query,
    })).catch(() => {});
};
const initData = async () => {
    try {
        securityPageState.loading = true;
        const res = await securityPageStore.fetchCloudServiceAnalyze();
        if (res && res?.length > 0) {
            const promises = res.map((d) => securityPageStore.listCloudServiceTypeData(d.provider || '', d.cloud_service_group || ''));
            await Promise.all(promises);
        }
        await securityPageStore.setSelectedCloudServiceType();
        await routeToFirstCloudServiceType();
    } finally {
        securityPageState.loading = false;
    }
};

/* Watchers */
watch(() => state.pageParams, (pageParams) => {
    if (pageParams?.name) {
        securityPageStore.setSelectedCloudServiceType(pageParams.group, pageParams.name);
    }
});
watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onBeforeMount(() => {
    initData();
});
</script>

<template>
    <p-data-loader :loading="securityPageGetters.loading"
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
