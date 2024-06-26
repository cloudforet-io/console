<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PRadioGroup, PRadio, PLazyImg,
} from '@spaceone/design-system';
import { get } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type {
    LSBItem, LSBMenu, TopTitle,
} from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import CloudServiceLSBToggleMenuItem from '@/services/asset-inventory/components/CloudServiceLSBToggleMenuItem.vue';
import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/constants/cloud-service-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const PROVIDER_MENU_ID = 'provider';
const CATEGORY_MENU_ID = 'category';
const REGION_MENU_ID = 'region';

const { getProperRouteLocation } = useProperRouteLocation();
const gnbStore = useGnbStore();
const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const cloudServiceDetailPageState = cloudServiceDetailPageStore.$state;
const allReferenceStore = useAllReferenceStore();

const route = useRoute();
const router = useRouter();

const state = reactive({
    currentGrantInfo: computed(() => store.getters['user/getCurrentGrantInfo']),
    isCloudServiceDetailPage: computed(() => route.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME
        || route.name === makeAdminRouteName(ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME)),
    detailPageParams: computed<CloudServiceDetailPageParams|undefined>(() => {
        if (state.isCloudServiceDetailPage) return route.params as unknown as CloudServiceDetailPageParams;
        return undefined;
    }),
    topTitle: computed<TopTitle|undefined>(() => {
        if (!state.detailPageParams) return undefined;
        return { label: state.detailPageParams.group, icon: get(cloudServiceDetailPageState.cloudServiceTypeList[0], ['tags', 'spaceone:icon'], '') };
    }),
    cloudServiceMainMenuSet: computed<LSBItem[]>(() => ([
        {
            type: MENU_ITEM_TYPE.COLLAPSIBLE,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.PROVIDER'),
            id: PROVIDER_MENU_ID,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_CATEGORY'),
            id: CATEGORY_MENU_ID,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.REGION'),
            id: REGION_MENU_ID,
        },
    ])),
    cloudServiceDetailMenuSet: computed<LSBItem[]>(() => {
        const results: LSBItem[] = [];
        cloudServiceDetailPageState.cloudServiceTypeList.forEach((d) => {
            results.push({
                type: MENU_ITEM_TYPE.ITEM,
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
    menuSet: computed<LSBMenu[]>(() => (state.isCloudServiceDetailPage ? state.cloudServiceDetailMenuSet : state.cloudServiceMainMenuSet)),
    favoriteOptions: computed<FavoriteOptions>(() => {
        if (!state.isCloudServiceDetailPage) {
            return {
                type: FAVORITE_TYPE.MENU,
                id: 'cloud_service',
            };
        }
        return {
            type: FAVORITE_TYPE.CLOUD_SERVICE,
            id: cloudServiceDetailPageState.selectedCloudServiceType?.cloud_service_type_key || '',
        };
    }),
});
const filterState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    contextMenuItems: computed(() => [
        { name: 'all', label: 'All', icon: undefined },
        ...Object.keys(filterState.providers).map((k) => ({
            label: filterState.providers[k].label,
            name: filterState.providers[k].key,
        })),
    ]),
    selectedItem: computed(() => {
        const item = filterState.providers[cloudServicePageState.selectedProvider];
        if (item) {
            return filterState.providers[cloudServicePageState.selectedProvider].key;
        } return 'all';
    }),
    filters: cloudServicePageState.additionalFilters,
});

const initCloudServiceDetailLSB = async (params: CloudServiceDetailPageParams) => {
    cloudServiceDetailPageStore.setProviderGroupName(params);
    await cloudServiceDetailPageStore.listCloudServiceTypeData();
};

const routeToFirstCloudServiceType = async (params: CloudServiceDetailPageParams) => {
    await router.replace(getProperRouteLocation({
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            provider: params.provider,
            group: params.group,
            name: cloudServiceDetailPageState.cloudServiceTypeList[0].name,
        },
        query: route.query,
    }));
    await cloudServiceDetailPageStore.setSelectedCloudServiceType();
};
const handleSelectProvider = (selected: string) => {
    if (!selected) return;
    cloudServicePageStore.setSelectedProvider(selected);
};

/* Watchers */
watch([() => state.detailPageParams, () => state.currentGrantInfo.scope], async ([params, scope]) => {
    if (scope === 'USER') return;
    if (!params) return;
    await initCloudServiceDetailLSB(params);
    if (!params.name) await routeToFirstCloudServiceType(params);
}, { immediate: true });
watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });
</script>

<template>
    <l-s-b :menu-set="state.menuSet"
           :top-title="state.topTitle"
           class="cloud-service-l-s-b"
    >
        <template #collapsible-contents-provider>
            <p-radio-group direction="vertical"
                           class="provider-radio-group"
            >
                <p-radio v-for="(item, idx) in filterState.contextMenuItems"
                         :key="idx"
                         :selected="filterState.selectedItem"
                         :value="item.name"
                         class="provider-item"
                         @change="handleSelectProvider"
                >
                    <span class="selected-wrapper">
                        <p-lazy-img width="1rem"
                                    height="1rem"
                                    error-icon="ic_cloud-filled"
                                    :src="filterState.providers[item.name]?.icon"
                                    class="mr-1"
                        /><span>{{ item.label }}</span>
                    </span>
                </p-radio>
            </p-radio-group>
        </template>
        <template #slot-category>
            <cloud-service-l-s-b-toggle-menu-item :type="CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY"
                                                  :label="$t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_CATEGORY')"
            />
        </template>
        <template #slot-region>
            <cloud-service-l-s-b-toggle-menu-item :type="CLOUD_SERVICE_FILTER_KEY.REGION"
                                                  :label="$t('INVENTORY.CLOUD_SERVICE.MAIN.REGION')"
            />
        </template>
    </l-s-b>
</template>

<style lang="postcss" scoped>
.cloud-service-l-s-b {
    .provider-radio-group {
        .provider-item {
            @apply flex items-center;
            gap: 0.25rem;
            padding-left: 0.25rem;
            .selected-wrapper {
                @apply flex items-center;
            }
        }
    }
}
</style>
