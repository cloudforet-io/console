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
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const { getProperRouteLocation } = useProperRouteLocation();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const gnbStore = useGnbStore();
const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();

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
watch(() => state.pageParams, async (pageParams) => {
    if (pageParams?.name) {
        await securityPageStore.setSelectedCloudServiceType(pageParams.group, pageParams.name);
        await cloudServiceDetailPageStore.setProviderGroupName(pageParams);
    } else {
        await securityPageStore.setSelectedCloudServiceType();
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
                   :data="storeState.loading ? true : storeState.cloudServiceTypeList"
                   :loader-backdrop-color="BACKGROUND_COLOR"
                   class="security-l-s-b"
    >
        <l-s-b :menu-set="state.menuSet" />
        <template #no-data>
            <div class="no-data-scoped-notification">
                <p class="contents">
                    <strong class="title">{{ $t('INVENTORY.SECURITY.NOTIFICATION_TITLE') }}</strong>
                    <span class="desc">{{ $t('INVENTORY.SECURITY.NOTIFICATION_DESC') }}</span>
                </p>
            </div>
        </template>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.security-l-s-b {
    height: 100%;
    .no-data-scoped-notification {
        @apply bg-violet-200 text-paragraph-md text-gray-900;
        margin: 1.5rem 1rem 3.75rem 1rem;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        .contents {
            @apply flex flex-col break-all;
            gap: 0.25rem;
            text-align: start;
            .title {
                @apply text-label-lg text-violet-700;
            }
        }
    }
}
</style>
