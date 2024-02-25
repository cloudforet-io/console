<script lang="ts" setup>
import {
    computed, getCurrentInstance, reactive, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { get } from 'lodash';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import type { FavoriteOptions } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type {
    LSBItem, LSBMenu, TopTitle,
} from '@/common/modules/navigations/lsb/type';
import { useTopBarHeaderStore } from '@/common/modules/navigations/top-bar/modules/top-bar-header/store';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const { getProperRouteLocation } = useProperRouteLocation();
const topBarHeaderStore = useTopBarHeaderStore();
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const cloudServiceDetailPageState = cloudServiceDetailPageStore.$state;

const vm = getCurrentInstance()?.proxy as Vue;
const state = reactive({
    isCloudServiceDetailPage: computed(() => vm.$route.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME
        || vm.$route.name === makeAdminRouteName(ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME)),
    detailPageParams: computed<CloudServiceDetailPageParams|undefined>(() => {
        if (state.isCloudServiceDetailPage) return vm.$route.params as unknown as CloudServiceDetailPageParams;
        return undefined;
    }),
    topTitle: computed<TopTitle|undefined>(() => {
        if (!state.detailPageParams) return undefined;
        return { label: state.detailPageParams.group, icon: get(cloudServiceDetailPageState.cloudServiceTypeList[0], ['tags', 'spaceone:icon'], '') };
    }),
    cloudServiceDetailMenuSet: computed<LSBItem[]>(() => {
        const results: LSBItem[] = [];
        cloudServiceDetailPageState.cloudServiceTypeList.forEach((d) => {
            results.push({
                type: 'item',
                label: d.name,
                id: d.cloud_service_type_key,
                to: getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME, params: { ...state.detailPageParams, name: d.name } }),
                favoriteOptions: {
                    type: FAVORITE_TYPE.CLOUD_SERVICE,
                    id: d.cloud_service_type_key,
                },
            });
        });
        return results;
    }),
    menuSet: computed<LSBMenu[]>(() => (state.isCloudServiceDetailPage ? state.cloudServiceDetailMenuSet : [])),
    favoriteOptions: computed<FavoriteOptions>(() => {
        if (!state.isCloudServiceDetailPage) return {} as FavoriteOptions;
        return {
            type: FAVORITE_TYPE.CLOUD_SERVICE,
            id: cloudServiceDetailPageState.selectedCloudServiceType?.cloud_service_type_key || '',
        };
    }),
});

const initCloudServiceDetailLSB = async (params: CloudServiceDetailPageParams) => {
    cloudServiceDetailPageStore.setProviderGroupName(params);
    await cloudServiceDetailPageStore.listCloudServiceTypeData();
};

const routeToFirstCloudServiceType = async (params: CloudServiceDetailPageParams) => {
    await vm.$router.replace(getProperRouteLocation({
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            provider: params.provider,
            group: params.group,
            name: cloudServiceDetailPageState.cloudServiceTypeList[0].name,
        },
        query: vm.$route.query,
    }));
    await cloudServiceDetailPageStore.setSelectedCloudServiceType();
};

/* Watchers */
watch(() => state.detailPageParams, async (params) => {
    if (!params) return;
    await initCloudServiceDetailLSB(params);
    if (!params.name) await routeToFirstCloudServiceType(params);
}, { immediate: true });
watch(() => state.favoriteOptions, (favoriteOptions) => {
    topBarHeaderStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });
</script>

<template>
    <l-s-b v-if="state.isCloudServiceDetailPage"
           :top-title="state.topTitle"
           :menu-set="state.menuSet"
    />
</template>
