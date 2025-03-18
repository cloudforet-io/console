<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PDataLoader } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';


const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const gnbStore = useGnbStore();
const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const appContextStore = useAppContextStore();

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    loading: computed(() => securityPageGetters.loading),
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
    selectedCloudServiceType: computed(() => securityPageGetters.selectedCloudServiceType),
});
const state = reactive({
    currentPath: computed(() => route.fullPath),
    pageParams: computed<CloudServiceDetailPageParams|undefined>(() => route.params as unknown as CloudServiceDetailPageParams),
    menuSet: computed<LSBItem[]>(() => {
        const defaultMenuSet: LSBItem[] = [];
        storeState.cloudServiceTypeList?.forEach((d, index, array) => {
            defaultMenuSet.push({
                type: MENU_ITEM_TYPE.TOP_TITLE,
                label: d.group,
                titleIcon: d.items && assetUrlConverter(d.items[0].icon),
                id: d.group,
            });
            d.items?.forEach((i) => {
                defaultMenuSet.push({
                    type: MENU_ITEM_TYPE.ITEM,
                    label: `[${allReferenceGetters.provider[i.data.provider].label}] ${i.name}`,
                    id: i.key,
                    to: {
                        name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME : ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
                        params: { group: i.data.group, provider: i.data.provider, name: i.name },
                    },
                });
            });
            if (index !== array.length - 1) {
                defaultMenuSet.push({ type: MENU_ITEM_TYPE.DIVIDER });
            }
        });
        return defaultMenuSet;
    }),
    securityNavigation: computed(() => {
        if (state.pageParams.name) {
            return [
                { name: i18n.t('MENU.ASSET_INVENTORY'), to: { name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE._NAME : ASSET_INVENTORY_ROUTE._NAME } },
                { name: i18n.t('MENU.ASSET_INVENTORY_SECURITY'), to: { name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.SECURITY._NAME : ASSET_INVENTORY_ROUTE.SECURITY._NAME } },
                { name: state.pageParams.group || '', data: null },
                { name: `[${allReferenceGetters.provider[state.pageParams.provider || '']?.label}] ${state.pageParams.name || ''}` },
            ];
        }
        return [
            { name: i18n.t('MENU.ASSET_INVENTORY'), to: { name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE._NAME : ASSET_INVENTORY_ROUTE._NAME } },
            { name: i18n.t('MENU.ASSET_INVENTORY_SECURITY'), to: { name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.SECURITY._NAME : ASSET_INVENTORY_ROUTE.SECURITY._NAME } },
        ];
    }),
});

const routeToFirstCloudServiceType = async () => {
    const selectedCloudServiceType = storeState.selectedCloudServiceType;
    if (selectedCloudServiceType) {
        await router.replace({
            name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME : ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
            params: {
                provider: selectedCloudServiceType?.data.provider || '',
                group: selectedCloudServiceType?.data.group || '',
                name: selectedCloudServiceType?.name || '',
            },
            query: route.query,
        }).catch(() => {});
    }
};

/* Watchers */
watch([() => state.pageParams.name, () => state.pageParams.provider, () => state.pageParams.group], async ([name, provider, group]) => {
    if (name) {
        await securityPageStore.setSelectedCloudServiceType(group, name, provider);
        await cloudServiceDetailPageStore.setProviderGroupName(state.pageParams);
    }
});
watch(() => storeState.selectedCloudServiceType, () => {
    routeToFirstCloudServiceType();
});
watch(() => state.securityNavigation, async (securityNavigation) => {
    gnbStore.setBreadcrumbs(securityNavigation);
}, { immediate: true });
</script>

<template>
    <p-data-loader :loading="false"
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
    @apply relative;
    height: 100%;
    .no-data-scoped-notification {
        @apply absolute bg-violet-200 text-paragraph-md text-gray-900;
        top: 1.5rem;
        right: 1rem;
        left: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        .contents {
            @apply flex flex-col;
            gap: 0.25rem;
            text-align: start;
            .title {
                @apply text-label-lg text-violet-700;
            }
        }
    }
}
</style>
