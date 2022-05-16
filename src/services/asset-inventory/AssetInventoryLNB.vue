<template>
    <l-n-b :header="header" :back-link="backLink" :top-title="topTitle"
           :menu-set="menuSet"
    />
</template>

<script lang="ts">
import { get } from 'lodash';
import {
    ComponentRenderProxy,
    computed,
    defineComponent,
    getCurrentInstance,
    reactive, toRefs,
    watch,
} from '@vue/composition-api';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import {
    BackLink, LNBItem, LNBMenu, TopTitle,
} from '@/common/modules/navigations/lnb/type';
import { MENU_ID } from '@/lib/menu/config';
import { assetInventoryStore } from '@/services/asset-inventory/store';
import {
    CloudServiceDetailPageParams,
    CloudServiceTypeInfo,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { store } from '@/store';


export default defineComponent({
    name: 'AssetInventoryLNB',
    components: { LNB },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            isCloudServiceDetailPage: computed(() => vm.$route.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME),
            detailPageParams: computed<CloudServiceDetailPageParams|undefined>(() => {
                if (state.isCloudServiceDetailPage) return vm.$route.params as unknown as CloudServiceDetailPageParams;
                return undefined;
            }),
            header: computed(() => MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY].label),
            backLink: computed<BackLink|undefined>(() => {
                if (!state.isCloudServiceDetailPage) return undefined;
                return { label: 'Cloud Service', to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME } };
            }),
            topTitle: computed<TopTitle|undefined>(() => {
                if (!state.detailPageParams) return undefined;
                return { label: state.detailPageParams.group, icon: get(state.cloudServiceTypeList[0], ['tags', 'spaceone:icon'], '') };
            }),
            cloudServiceTypeList: computed<CloudServiceTypeInfo[]>(() => assetInventoryStore.state.cloudServiceDetail.cloudServiceTypeList),
            selectedItem: computed(() => assetInventoryStore.state.cloudServiceDetail.selectedItem),
            cloudServiceDetailMenuItems: computed<LNBItem[]>(() => {
                const results: LNBItem[] = state.cloudServiceTypeList.map(d => (
                    {
                        type: 'item',
                        label: d.name,
                        id: d.cloud_service_type_key,
                        to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME, params: { ...state.detailPageParams, name: d.name } },
                        favoriteType: FAVORITE_TYPE.CLOUD_SERVICE,
                    }
                ));
                return results;
            }),
            menuSet: computed<LNBMenu[]>(() => {
                const menuItems: LNBMenu[] = [];
                if (state.isCloudServiceDetailPage) {
                    menuItems.push([...state.cloudServiceDetailMenuItems, { type: 'divider' }]);
                } else {
                    menuItems.push(
                        {
                            type: 'item', id: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, label: 'Cloud Service', to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
                        },
                    );
                }

                menuItems.push(
                    {
                        type: 'item', id: MENU_ID.ASSET_INVENTORY_SERVER, label: 'Server', to: { name: ASSET_INVENTORY_ROUTE.SERVER._NAME },
                    },
                    {
                        type: 'item', id: MENU_ID.ASSET_INVENTORY_COLLECTOR, label: 'Collector', to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME },
                    },
                    {
                        type: 'item', id: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT, label: 'Service Account', to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
                    },
                );
                return filterLNBMenuByPermission(menuItems, store.getters['user/pagePermissionList']);
            }),
        });

        const initCloudServiceDetailLNB = async (params: CloudServiceDetailPageParams) => {
            assetInventoryStore.dispatch('cloudServiceDetail/setProviderGroupName', params);
            await assetInventoryStore.dispatch('cloudServiceDetail/listCloudServiceTypeData');
        };

        const routeToFirstCloudServiceType = async (params: CloudServiceDetailPageParams) => {
            await vm.$router.replace({
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: params.provider,
                    group: params.group,
                    name: state.cloudServiceTypeList[0].name,
                },
                query: vm.$route.query,
            });
            assetInventoryStore.dispatch('cloudServiceDetail/setSelectedItem');
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
