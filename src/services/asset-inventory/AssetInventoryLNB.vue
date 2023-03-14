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


export default defineComponent({
    name: 'AssetInventoryLNB',
    components: { LNB },
    setup() {
        const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
        const cloudServiceDetailPageState = cloudServiceDetailPageStore.state;

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
                return { label: i18n.t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE].translationId), to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME } };
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
                    label: i18n.t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE].translationId),
                    to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
                }]);
                return [
                    (state.isCloudServiceDetailPage ? state.cloudServiceDetailMenuSet : []),
                    ...filterLNBMenuByPermission(menu.concat([
                        {
                            type: 'item',
                            id: MENU_ID.ASSET_INVENTORY_SERVER,
                            label: i18n.t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_SERVER].translationId),
                            to: { name: ASSET_INVENTORY_ROUTE.SERVER._NAME },
                        },
                        {
                            type: 'item',
                            id: MENU_ID.ASSET_INVENTORY_COLLECTOR,
                            label: i18n.t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_COLLECTOR].translationId),
                            to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME },
                        },
                        {
                            type: 'item',
                            id: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT,
                            label: i18n.t(MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT].translationId),
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
            await vm.$router.replace({
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: params.provider,
                    group: params.group,
                    name: cloudServiceDetailPageState.cloudServiceTypeList[0].name,
                },
                query: vm.$route.query,
            });
            cloudServiceDetailPageStore.setSelectedCloudServiceType();
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
