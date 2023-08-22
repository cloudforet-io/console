<script lang="ts" setup>
import { get } from 'lodash';
import {
    computed,
    reactive,
    watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type {
    BackLink, LNBItem, LNBMenu, TopTitle,
} from '@/common/modules/navigations/lnb/type';

import type {
    CloudServiceDetailPageParams,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/store/cloud-service-detail-page-store';

const router = useRouter();
const route = useRoute();
const store = useStore();
const { t } = useI18n();

const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const cloudServiceDetailPageState = cloudServiceDetailPageStore.$state;

const state = reactive({
    isCloudServiceDetailPage: computed(() => route.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME),
    detailPageParams: computed<CloudServiceDetailPageParams|undefined>(() => {
        if (state.isCloudServiceDetailPage) return route.params as unknown as CloudServiceDetailPageParams;
        return undefined;
    }),
    header: computed(() => t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY].translationId)),
    backLink: computed<BackLink|undefined>(() => {
        if (!state.isCloudServiceDetailPage) return undefined;
        return { label: t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE].translationId), to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME } };
    }),
    topTitle: computed<TopTitle|undefined>(() => {
        if (!state.detailPageParams) return undefined;
        return { label: state.detailPageParams.group, icon: get(cloudServiceDetailPageState.cloudServiceTypeList[0], ['tags', 'spaceone:icon'], '') };
    }),
    cloudServiceDetailMenuSet: computed<LNBItem[]>(() => {
        const results: LNBItem[] = [];
        cloudServiceDetailPageState.cloudServiceTypeList.forEach((d) => {
            results.push({
                type: 'item',
                label: d.name,
                id: d.cloud_service_type_key,
                to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME, params: { ...state.detailPageParams, name: d.name } },
                favoriteType: FAVORITE_TYPE.CLOUD_SERVICE,
            });
        });
        results.push({ type: 'divider' });
        return results;
    }),
    menuSet: computed<LNBMenu[]>(() => {
        const menu: LNBMenu[] = (state.isCloudServiceDetailPage ? [] : [{
            type: 'item',
            id: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE,
            label: t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE].translationId),
            to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
        }]);
        return [
            (state.isCloudServiceDetailPage ? state.cloudServiceDetailMenuSet : []),
            ...filterLNBMenuByPermission(menu.concat([
                // TODO: need to implement type assertion
                {
                    type: 'item',
                    id: MENU_ID.ASSET_INVENTORY_SERVER,
                    label: t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_SERVER].translationId),
                    to: { name: ASSET_INVENTORY_ROUTE.SERVER._NAME },
                },
                {
                    type: 'item',
                    id: MENU_ID.ASSET_INVENTORY_COLLECTOR,
                    label: t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_COLLECTOR].translationId),
                    to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME },
                },
                {
                    type: 'item',
                    id: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT,
                    label: t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT].translationId),
                    to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
                },
            ]), store.getters['user/pagePermissionList']),
        ];
    }),
});

const initCloudServiceDetailLNB = async (params: CloudServiceDetailPageParams) => {
    cloudServiceDetailPageStore.setProviderGroupName(params);
    cloudServiceDetailPageStore.listCloudServiceTypeData();
};

const routeToFirstCloudServiceType = async (params: CloudServiceDetailPageParams) => {
    await router.replace({
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            provider: params.provider,
            group: params.group,
            name: cloudServiceDetailPageState.cloudServiceTypeList[0].name,
        },
        query: route.query,
    });
    await cloudServiceDetailPageStore.setSelectedCloudServiceType();
};

/* Watchers */
watch(() => state.detailPageParams, async (params) => {
    if (!params) return;
    await initCloudServiceDetailLNB(params);
    if (!params.name) await routeToFirstCloudServiceType(params);
}, { immediate: true });

</script>

<template>
    <l-n-b :header="state.header"
           :back-link="state.backLink"
           :top-title="state.topTitle"
           :menu-set="state.menuSet"
    />
</template>
