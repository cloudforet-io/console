<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { get } from 'lodash';

import {
    PRadioGroup, PRadio, PLazyImg,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type {
    LSBItem, LSBMenu,
} from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import CloudServiceLSBDropdownMenuItem from '@/services/asset-inventory/components/CloudServiceLSBDropdownMenuItem.vue';
import {
    CLOUD_SERVICE_FILTER_KEY,
    CLOUD_SERVICE_GLOBAL_FILTER_KEY, UNIDENTIFIED_PROVIDER,
} from '@/services/asset-inventory/constants/cloud-service-constant';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const PROJECT_MENU_ID = 'project';
const SERVICE_ACCOUNT_MENU_ID = 'service-account';
const PROVIDER_MENU_ID = 'provider';
const CATEGORY_MENU_ID = 'category';
const REGION_MENU_ID = 'region';


const appContextStore = useAppContextStore();
const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const cloudServiceDetailPageState = cloudServiceDetailPageStore.$state;
const allReferenceStore = useAllReferenceStore();
const authorizationStore = useAuthorizationStore();

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentGrantInfo: computed(() => authorizationStore.state.currentGrantInfo),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
});
const state = reactive({
    currentPath: computed(() => route.fullPath),
    isCloudServiceDetailPage: computed(() => route.name === ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME
        || route.name === ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME),
    detailPageParams: computed<CloudServiceDetailPageParams|undefined>(() => {
        if (state.isCloudServiceDetailPage) return route.params as unknown as CloudServiceDetailPageParams;
        return undefined;
    }),
    cloudServiceMainMenuSet: computed<LSBItem[]>(() => ([
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.PROVIDER'),
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: PROVIDER_MENU_ID,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: UNIDENTIFIED_PROVIDER,
        },
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_CATEGORY'),
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: CATEGORY_MENU_ID,
        },
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.REGION'),
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: REGION_MENU_ID,
        },
    ])),
    cloudServiceDetailMenuSet: computed<LSBItem[]>(() => {
        const selectedItem = cloudServiceDetailPageState.cloudServiceTypeList[0];
        const results: LSBItem[] = [
            {
                type: MENU_ITEM_TYPE.DIVIDER,
            },
            {
                type: MENU_ITEM_TYPE.BUTTON_TITLE,
                label: state.detailPageParams.group,
                id: selectedItem?.group,
                isBackLink: true,
                to: { name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
                titleIcon: get(selectedItem, ['tags', 'spaceone:icon'], ''),
            },
        ];
        cloudServiceDetailPageState.cloudServiceTypeList.forEach((d) => {
            results.push({
                type: MENU_ITEM_TYPE.ITEM,
                label: d.name,
                id: d.cloud_service_type_key,
                to: {
                    name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    params: { ...state.detailPageParams, name: d.name },
                },
            });
        });
        return results;
    }),
    menuSet: computed<LSBMenu[]>(() => [
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.PROJECT'),
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: PROJECT_MENU_ID,
        },
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_ACCOUNT'),
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: SERVICE_ACCOUNT_MENU_ID,
        },
        ...state.isCloudServiceDetailPage ? state.cloudServiceDetailMenuSet : state.cloudServiceMainMenuSet,
    ]),
});
const providerState = reactive({
    contextMenuItems: computed(() => [
        { name: 'all', label: 'All', icon: undefined },
        ...Object.keys(storeState.providers).map((k) => ({
            label: storeState.providers[k].label,
            name: storeState.providers[k].key,
        })),
    ]),
    selectedItem: computed(() => {
        if (UNIDENTIFIED_PROVIDER === cloudServicePageState.selectedProvider) return UNIDENTIFIED_PROVIDER;
        const item = storeState.providers[cloudServicePageState.selectedProvider];
        if (item) {
            return storeState.providers[cloudServicePageState.selectedProvider].key;
        } return 'all';
    }),
});

const initCloudServiceDetailLSB = async (params: CloudServiceDetailPageParams) => {
    cloudServiceDetailPageStore.setProviderGroupName(params);
    await cloudServiceDetailPageStore.listCloudServiceTypeData();
};

const routeToFirstCloudServiceType = async (params: CloudServiceDetailPageParams) => {
    await router.replace({
        name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            provider: params.provider,
            group: params.group,
            name: cloudServiceDetailPageState.cloudServiceTypeList[0].name,
        },
        query: route.query,
    }).catch(() => {
    });
    await cloudServiceDetailPageStore.setSelectedCloudServiceType();
};
const handleSelectProvider = (selected: string) => {
    if (!selected) return;
    cloudServicePageStore.setSelectedProvider(selected);
};

/* Watchers */
watch([() => state.detailPageParams, () => storeState.currentGrantInfo], async ([params, grantInfo]) => {
    if (grantInfo?.scope === 'USER') return;
    if (!params) return;
    await initCloudServiceDetailLSB(params);
    if (!params.name) await routeToFirstCloudServiceType(params);
}, { immediate: true });
</script>

<template>
    <l-s-b :menu-set="state.menuSet"
           class="cloud-service-l-s-b"
           :class="{'is-admin-mode': storeState.isAdminMode, 'is-detail-page': state.isCloudServiceDetailPage}"
    >
        <template #slot-project>
            <cloud-service-l-s-b-dropdown-menu-item class="collapsible-item"
                                                    is-global-filter
                                                    :type="CLOUD_SERVICE_GLOBAL_FILTER_KEY.PROJECT"
                                                    :label="$t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_CATEGORY')"
            />
        </template>
        <template #slot-service-account>
            <cloud-service-l-s-b-dropdown-menu-item class="collapsible-item"
                                                    is-global-filter
                                                    :type="CLOUD_SERVICE_GLOBAL_FILTER_KEY.SERVICE_ACCOUNT"
                                                    :label="$t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_CATEGORY')"
            />
        </template>
        <template #slot-provider>
            <p-radio-group direction="vertical"
                           class="provider-radio-group"
            >
                <p-radio v-for="(item, idx) in providerState.contextMenuItems"
                         :key="idx"
                         :selected="providerState.selectedItem"
                         :value="item.name"
                         class="provider-item"
                         @change="handleSelectProvider"
                >
                    <span class="selected-wrapper">
                        <p-lazy-img width="1rem"
                                    height="1rem"
                                    error-icon="ic_cloud-filled"
                                    :src="storeState.providers[item.name]?.icon"
                                    class="mr-1"
                        /><span>{{ item.label }}</span>
                    </span>
                </p-radio>
            </p-radio-group>
        </template>
        <template #slot-Unidentified>
            <p-radio :key="UNIDENTIFIED_PROVIDER"
                     class="provider-item mb-3 mx-1"
                     :value="UNIDENTIFIED_PROVIDER"
                     :selected="providerState.selectedItem"
                     @change="handleSelectProvider"
            >
                Unidentified assets
            </p-radio>
        </template>
        <template #slot-category>
            <cloud-service-l-s-b-dropdown-menu-item class="collapsible-item"
                                                    :type="CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY"
                                                    :label="$t('INVENTORY.CLOUD_SERVICE.MAIN.SERVICE_CATEGORY')"
            />
        </template>
        <template #slot-region>
            <cloud-service-l-s-b-dropdown-menu-item class="collapsible-item"
                                                    :type="CLOUD_SERVICE_FILTER_KEY.REGION"
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
    &.is-admin-mode:not(&.is-detail-page) {
        &:deep(.menu-wrapper) {
            padding-top: 0.5rem;
        }
    }
    &:deep(.l-s-b-collapsible-menu-item) {
        margin-top: 0.5rem;
    }

    .collapsible-item {
        width: 100%;
        margin: 0 0.375rem 0.75rem 0.375rem;
    }
}
</style>
