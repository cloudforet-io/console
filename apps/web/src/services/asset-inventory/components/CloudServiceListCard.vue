<script setup lang="ts">
import {
    computed, reactive, ref,
} from 'vue';
import type { Location } from 'vue-router';

import { cloneDeep } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { PLazyImg, PDivider, PTooltip } from '@cloudforet/mirinae';

import type { CloudServiceTypeModel } from '@/api-clients/inventory/cloud-service-type/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { arrayToQueryString, objectToQueryString } from '@/lib/router-query-string';

import { useTextOverflowState } from '@/common/composables/text-overflow-state';

import { useCloudServiceTypeListQuery } from '@/services/asset-inventory/composables/use-cloud-service-type-list-query';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceLSBStore } from '@/services/asset-inventory/stores/cloud-service-l-s-b-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { CloudServiceAnalyzeResult, CloudServiceAnalyzeResultResource } from '@/services/asset-inventory/types/cloud-service-card-type';
import type { CloudServiceDetailPageUrlQuery } from '@/services/asset-inventory/types/cloud-service-page-type';
import type { Period } from '@/services/asset-inventory/types/type';


interface Props {
    item: CloudServiceAnalyzeResult;
    searchFilters?: ConsoleFilter[];
    selectedRegions?: string[];
    period?: Period;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({}),
    searchFilters: () => ([]),
    selectedRegions: () => ([]),
    period: undefined,
});

const appContextStore = useAppContextStore();
const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.state;
const cloudServiceLSBStore = useCloudServiceLSBStore();

const referenceMap = useAllReferenceDataModel();
const providerMap = referenceMap.provider;

const { data: cloudServiceTypeList } = useCloudServiceTypeListQuery({
    params: computed(() => ({
        query: { only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'] },
    })),
});

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    cloudServiceTypeToItemMap: computed(() => {
        const res: Record<string, CloudServiceTypeModel> = {};
        cloudServiceTypeList.value?.forEach((item) => {
            res[`${item.provider}:${item.group}:${item.name}`] = item;
        });
        return res;
    }),
    slicedResources: computed<CloudServiceAnalyzeResultResource[]>(() => {
        const resources = props.item?.resources ?? [];
        resources.sort((a, b) => a.cloud_service_type?.localeCompare(b.cloud_service_type ?? '') ?? 0);
        return resources.slice(0, 2);
    }),
});
const cloudServiceDetailQueryHelper = new QueryHelper();
const getCloudServiceDetailLink = (item: CloudServiceAnalyzeResult, resource?: CloudServiceAnalyzeResultResource): Location|undefined => {
    const targetCloudServiceType = resource ?? item.resources?.[0];
    if (!item.provider || !item.cloud_service_group || !targetCloudServiceType?.cloud_service_type) {
        console.error(new Error(`Invalid cloud service item to generate link: ${item}`));
        return undefined;
    }

    // extract product filter
    let _searchFilters = cloneDeep(cloudServicePageState.searchFilters);
    _searchFilters = _searchFilters.filter((d) => d.k !== 'ref_cloud_service_type.service_code');

    cloudServiceDetailQueryHelper.setFilters(_searchFilters.filter((f: any) => f.k && ![
        'cloud_service_type',
        'cloud_service_group',
        'service_code',
    ].includes(f.k)));

    const query: CloudServiceDetailPageUrlQuery = {
        project: arrayToQueryString(cloudServiceLSBStore.getters.selectedProjects),
        service_account: arrayToQueryString(cloudServiceLSBStore.getters.selectedServiceAccounts),
        filters: cloudServiceDetailQueryHelper.rawQueryStrings,
        period: objectToQueryString(cloudServicePageState.period),
    };
    const res: Location = {
        name: state.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            provider: item.provider,
            group: item.cloud_service_group,
            name: targetCloudServiceType.cloud_service_type,
        },
        query,
    };
    return res;
};

const serviceTypeNameRef = ref<(HTMLElement|null)[]>([]);
const { getTextOverflowState } = useTextOverflowState({
    targetRef: serviceTypeNameRef,
    lineClamp: true,
});

const getImageUrl = (item: CloudServiceAnalyzeResult) => {
    const cloudServiceType = item.resources?.[0]?.cloud_service_type;
    const provider = item.provider;
    const group = item.cloud_service_group;

    if (cloudServiceType && provider && group) {
        const key = `${provider}:${group}:${cloudServiceType}`;
        const icon = state.cloudServiceTypeToItemMap[key]?.tags?.['spaceone:icon'];
        if (icon) return assetUrlConverter(icon);
    }

    if (provider) {
        const icon = providerMap[provider]?.icon;
        if (icon) return assetUrlConverter(icon);
    }

    return '';
};

</script>

<template>
    <div class="cloud-service-type-item">
        <router-link :to="getCloudServiceDetailLink(item)"
                     class="item-wrapper"
        >
            <div class="card-title-wrapper">
                <div class="provider-title-wrapper">
                    <span class="provider">{{ item.provider ? providerMap[item.provider]?.label || item.provider : '' }}</span>
                </div>
                <div class="service-group-wrapper">
                    <p-lazy-img width="1.25rem"
                                height="1.25rem"
                                :src="getImageUrl(item)"
                                error-icon="ic_cloud-filled"
                                :alt="item.cloud_service_group"
                                class="icon"
                    />
                    <span class="service-group">{{ item.cloud_service_group }}</span>
                </div>
            </div>
            <p-divider />
            <div class="service-type-list">
                <template
                    v-for="(resource, idx) in state.slicedResources"
                >
                    <router-link
                        :key="`${resource}-${idx}`"
                        :to="getCloudServiceDetailLink(item, resource)"
                        class="service-type-item"
                        :style="{flexBasis: `${100 / state.slicedResources.length}%`}"
                    >
                        <p-tooltip ref="serviceTypeNameRef"
                                   class="service-type-name"
                                   :contents="getTextOverflowState(idx) ? resource.cloud_service_type || '' : ''"
                        >
                            {{ resource.cloud_service_type }}
                        </p-tooltip>
                        <span class="service-type-count">{{ resource.value }}</span>
                    </router-link>
                    <p-divider
                        v-if="state.slicedResources.length > 1 && idx === 0"
                        :key="idx"
                        class="service-type-divider"
                        :vertical="true"
                    />
                </template>
            </div>
        </router-link>
    </div>
</template>

<style scoped lang="postcss">
.cloud-service-type-item {
    @apply bg-white border border-gray-200 rounded-lg;
    box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.06);

    @media (hover: hover) {
        &:hover {
            @apply border-l border-secondary border-gray-200 bg-blue-100;
            cursor: pointer;

            .favorite-btn:not(.active) {
                display: block;
            }
        }
    }

    .item-wrapper {
        @apply flex flex-col w-full h-full;

        .icon {
            @apply overflow-hidden flex-shrink-0 rounded-md;
        }

        .card-title-wrapper {
            min-height: 5.5rem;
            height: 100%;
            padding: 1rem 1rem 0.5rem;
        }

        .provider-title-wrapper {
            margin-bottom: 0.35rem;

            @apply flex flex-wrap gap-1 items-center;
            .provider {
                @apply text-gray-500 text-xs;
                line-height: 130%;
            }
        }

        .service-group-wrapper {
            @apply w-full flex gap-1 items-start;

            .service-group {
                @apply inline-block font-bold text-lg text-gray-900;
                max-width: calc(100% - 1rem);
                line-height: 1.2;
            }
        }

        .service-type-list {
            @apply flex w-full items-center;
            padding: 0.75rem 1rem;
            gap: 0.5rem;

            .service-type-item {
                @apply text-sm font-normal;
                display: flex;
                align-items: center;
                white-space: break-spaces;
                overflow: hidden;
                gap: 0.5rem;
                line-height: 1.25;

                .service-type-name {
                    @apply text-gray-600;
                    display: -webkit-box;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    white-space: normal;
                }
                .service-type-count {
                    @apply text-gray-800;
                    flex-shrink: 0;
                }

                @media (hover: hover) {
                    &:hover {
                        .service-type-name {
                            @apply text-blue-600 underline;
                        }

                        .service-type-count {
                            @apply text-blue-600;
                        }
                    }
                }
            }
        }
    }

    .p-divider {
        opacity: 0.7;
        &.vertical {
            @apply h-full;
        }
    }
}
</style>
