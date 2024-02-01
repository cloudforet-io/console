<template>
    <div class="cloud-service-type-item">
        <router-link :to="getCloudServiceDetailLink(item)"
                     class="item-wrapper"
        >
            <div class="card-title-wrapper">
                <div class="provider-title-wrapper">
                    <span class="provider">{{ (item.provider && providers[item.provider]) ? providers[item.provider].label : item.provider }}</span>
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
                    v-for="(resource, idx) in slicedResources"
                >
                    <router-link
                        :key="`${resource}-${idx}`"
                        :to="getCloudServiceDetailLink(item, resource)"
                        class="service-type-item"
                        :style="{flexBasis: `${100 / slicedResources.length}%`}"
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
                        v-if="slicedResources.length > 1 && idx === 0"
                        :key="idx"
                        class="service-type-divider"
                        :vertical="true"
                    />
                </template>
            </div>
        </router-link>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, ref, toRefs,
} from 'vue';
import type { Location } from 'vue-router';

import { PLazyImg, PDivider, PTooltip } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { store } from '@/store';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { CloudServiceTypeReferenceMap, CloudServiceTypeReferenceItem } from '@/store/modules/reference/cloud-service-type/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { objectToQueryString } from '@/lib/router-query-string';

import { useTextOverflowState } from '@/common/composables/text-overflow-state';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { Period } from '@/services/asset-inventory/types/type';

import type { CloudServiceAnalyzeResult, CloudServiceAnalyzeResultResource } from '../types/cloud-service-card-type';


interface Props {
    item: CloudServiceAnalyzeResult;
    searchFilters: ConsoleFilter[];
    selectedRegions: string[];
    period?: Period;
}

export default defineComponent<Props>({
    name: 'CloudServiceListCard',
    components: {
        PLazyImg,
        PDivider,
        PTooltip,
    },
    props: {
        item: {
            type: Object as PropType<CloudServiceAnalyzeResult>,
            default: () => ({}),
        },
    },
    setup(props: Props) {
        const appContextStore = useAppContextStore();
        const cloudServicePageStore = useCloudServicePageStore();
        const cloudServicePageState = cloudServicePageStore.$state;

        const state = reactive({
            isAdminMode: computed(() => appContextStore.getters.isAdminMode),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            cloudServiceTypeToItemMap: computed(() => {
                const res: Record<string, CloudServiceTypeReferenceItem> = {};
                Object.entries(state.cloudServiceTypes).forEach(([, item]) => {
                    res[`${item.data.provider}:${item.data.group}:${item.name}`] = item;
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

            if (cloudServicePageStore.selectedRegions.length) {
                cloudServiceDetailQueryHelper.addFilter({ k: 'region_code', o: '=', v: cloudServicePageStore.selectedRegions });
            }

            const res: Location = {
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: targetCloudServiceType.cloud_service_type,
                },
                query: {
                    filters: cloudServiceDetailQueryHelper.rawQueryStrings,
                    period: objectToQueryString(cloudServicePageState.period),
                },
            };
            if (state.isAdminMode) {
                res.name = makeAdminRouteName(ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME);
            } else {
                res.name = ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME;
            }
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
                const icon = state.cloudServiceTypeToItemMap[key]?.icon;
                if (icon) return assetUrlConverter(icon);
            }

            if (provider) {
                const icon = state.providers[provider]?.icon;
                if (icon) return assetUrlConverter(icon);
            }

            return '';
        };

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/cloudServiceType/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            serviceTypeNameRef,
            getTextOverflowState,
            assetUrlConverter,
            getCloudServiceDetailLink,
            getImageUrl,
        };
    },
});
</script>

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
