<template>
    <l-n-b :header="header"
           :back-link="backLink"
           :top-title="topTitle"
           :menu-set="menuSet"
    />
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    getCurrentInstance,
    reactive, toRefs,
    watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { get } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import {
    filterLNBMenuByAccessPermission,
} from '@/lib/access-control/page-access-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type {
    BackLink, LNBItem, LNBMenu, TopTitle,
} from '@/common/modules/navigations/lnb/type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import type {
    CloudServiceDetailPageParams,
} from '@/services/asset-inventory/types/cloud-service-detail-page-type';


export default defineComponent({
    name: 'AssetInventoryLNB',
    components: { LNB },
    setup() {
        const { getProperRouteLocation, isAdminMode } = useProperRouteLocation();
        const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
        const cloudServiceDetailPageState = cloudServiceDetailPageStore.$state;

        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            isCloudServiceDetailPage: computed(() => vm.$route.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME),
            detailPageParams: computed<CloudServiceDetailPageParams|undefined>(() => {
                if (state.isCloudServiceDetailPage) return vm.$route.params as unknown as CloudServiceDetailPageParams;
                return undefined;
            }),
            header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY].translationId)),
            backLink: computed<BackLink|undefined>(() => {
                if (!state.isCloudServiceDetailPage) return undefined;
                return { label: i18n.t(MENU_INFO_MAP[MENU_ID.CLOUD_SERVICE].translationId), to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME } };
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
                        to: getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME, params: { ...state.detailPageParams, name: d.name } }),
                        favoriteOptions: {
                            type: FAVORITE_TYPE.CLOUD_SERVICE,
                            id: d.cloud_service_type_key,
                        },
                    });
                });
                results.push({ type: 'divider' });
                return results;
            }),
            userModeMenuSet: computed<LNBMenu[]>(() => [
                {
                    type: 'item',
                    id: MENU_ID.SERVER,
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.SERVER].translationId),
                    to: getProperRouteLocation({
                        name: ASSET_INVENTORY_ROUTE.SERVER._NAME,
                    }),
                },
                {
                    type: 'item',
                    id: MENU_ID.COLLECTOR,
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.COLLECTOR].translationId),
                    to: getProperRouteLocation({
                        name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
                    }),
                },
                {
                    type: 'item',
                    id: MENU_ID.SERVICE_ACCOUNT,
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.SERVICE_ACCOUNT].translationId),
                    to: getProperRouteLocation({
                        name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
                    }),
                },
            ]),
            adminModeMenuSet: computed<LNBMenu[]>(() => [
                {
                    type: 'item',
                    id: MENU_ID.COLLECTOR,
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.COLLECTOR].translationId),
                    to: getProperRouteLocation({
                        name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
                    }),
                },

            ]),
            menuSet: computed<LNBMenu[]>(() => {
                if (isAdminMode.value) return state.adminModeMenuSet;
                const menu: LNBMenu[] = (state.isCloudServiceDetailPage ? [] : [{
                    type: 'item',
                    id: MENU_ID.CLOUD_SERVICE,
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.CLOUD_SERVICE].translationId),
                    to: getProperRouteLocation({
                        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                    }),
                }]);
                const result = [
                    (state.isCloudServiceDetailPage ? state.cloudServiceDetailMenuSet : []),
                    ...filterLNBMenuByAccessPermission(menu.concat(state.userModeMenuSet), store.getters['user/pageAccessPermissionList']),
                ];
                return result;
            }),
        });

        const initCloudServiceDetailLNB = async (params: CloudServiceDetailPageParams) => {
            cloudServiceDetailPageStore.setProviderGroupName(params);
            cloudServiceDetailPageStore.listCloudServiceTypeData();
        };

        const routeToFirstCloudServiceType = async (params: CloudServiceDetailPageParams) => {
            await vm.$router.replace({
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: params.provider,
                    group: params.group,
                    name: cloudServiceDetailPageState.cloudServiceTypeList[0].name,
                },
                query: vm.$route.query,
            });
            await cloudServiceDetailPageStore.setSelectedCloudServiceType();
        };

        /* Watchers */
        watch(() => state.detailPageParams, async (params) => {
            if (!params) return;
            await initCloudServiceDetailLNB(params);
            if (!params.name) await routeToFirstCloudServiceType(params);
        }, { immediate: true });

        return {
            ...toRefs(state),
            FAVORITE_TYPE,
        };
    },
});

</script>
