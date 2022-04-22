<template>
    <l-n-b header="Asset Inventory" :back-link="backLink" :top-title="topTitle"
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
import { BackLink, LNBItem, TopTitle } from '@/common/modules/navigations/lnb/type';
import { MENU_ID } from '@/lib/router/type';
import { assetInventoryStore } from '@/services/asset-inventory/store';
import {
    CloudServiceDetailPageParams,
    CloudServiceTypeInfo,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';


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
            cloudServiceDetailMenuSet: computed<LNBItem[]>(() => {
                const results: LNBItem[] = state.cloudServiceTypeList.map(d => ({
                    type: 'item', label: d.name, id: d.name, to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME, params: { ...state.detailPageParams, name: d.name } },
                }));

                return results;
            }),
            menuSet: computed<LNBItem[][]>(() => {
                const menuItems: LNBItem[][] = [];
                if (state.isCloudServiceDetailPage) {
                    menuItems.push(state.cloudServiceDetailMenuSet);
                    // QUESTION: why divider requires id and label?
                    menuItems.push([{ type: 'divider', label: 'divider', id: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE }]);
                } else {
                    menuItems.push([
                        {
                            type: 'item', id: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, label: 'Cloud Service', to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
                        },
                    ]);
                }

                menuItems.push(
                    [{
                        type: 'item', id: MENU_ID.ASSET_INVENTORY_SERVER, label: 'Server', to: { name: ASSET_INVENTORY_ROUTE.SERVER._NAME },
                    }],
                    [{
                        type: 'item', id: MENU_ID.ASSET_INVENTORY_COLLECTOR, label: 'Collector', to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME },
                    }],
                    [{
                        type: 'item', id: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT, label: 'Service Account', to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
                    }],
                );
                return menuItems;
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
        };
    },
});

</script>
