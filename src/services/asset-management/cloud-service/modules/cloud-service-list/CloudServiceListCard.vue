<template>
    <div class="cloud-service-type-item">
        <router-link :to="getCloudServiceDetailLink(item)"
                     class="item-wrapper"
        >
            <div class="card-title-wrapper">
                <div class="provider-title-wrapper">
                    <span class="provider">{{ providers[item.provider] ? providers[item.provider].label : item.provider }}</span>
                </div>
                <div class="service-group-wrapper">
                    <p-lazy-img width="1.25rem" height="1.25rem"
                                :src="assetUrlConverter(item.icon) || (providers[item.provider] ? providers[item.provider].icon : '')"
                                error-icon="ic_provider_other"
                                :alt="item.name"
                                class="icon"
                    />
                    <span class="service-group">{{ item.cloud_service_group }}</span>
                </div>
            </div>
            <p-divider />
            <div class="service-type-list">
                <template
                    v-for="(cloudServiceType, idx) in slicedResources"
                >
                    <router-link
                        :key="`${cloudServiceType}-${idx}`"
                        :to="getCloudServiceDetailLink({ ...item, cloudServiceTypeName: cloudServiceType.cloud_service_type })"
                        class="service-type-item"
                    >
                        <span class="service-type-name">{{ cloudServiceType.cloud_service_type }} </span>
                        <span class="service-type-count">{{ cloudServiceType.count }}</span>
                    </router-link>
                    <p-divider
                        v-if="item.resources.length > 1 && idx === 0"
                        :key="idx"
                        :vertical="true"
                    />
                </template>
            </div>
        </router-link>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { Location } from 'vue-router';

import { PLazyImg, PDivider } from '@spaceone/design-system';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

import { store } from '@/store';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { ASSET_MANAGEMENT_ROUTE } from '@/services/asset-management/route-config';
import { Period } from '@/services/cost-explorer/type';
import { objectToQueryString } from '@/lib/router-query-string';

interface Props {
    item: any;
    queryFilters: QueryStoreFilter[];
    selectedRegions: string[];
    period?: Period;
}

export default {
    name: 'CloudServiceListCard',
    components: {
        PLazyImg,
        PDivider,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        queryFilters: {
            type: Array,
            default: () => [],
        },
        selectedRegions: {
            type: Array,
            default: () => [],
        },
        period: {
            type: Object,
            default: undefined,
        },
    },
    setup(props: Props) {
        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
            slicedResources: computed(() => props.item?.resources.slice(0, 2)),
        });
        const cloudServiceDetailQueryHelper = new QueryHelper();
        const getCloudServiceDetailLink = (item) => {
            cloudServiceDetailQueryHelper.setFilters(props.queryFilters.filter((f: any) => f.k && ![
                'cloud_service_type',
                'cloud_service_group',
                'service_code',
            ].includes(f.k)));

            if (props.selectedRegions.length) {
                cloudServiceDetailQueryHelper.addFilter({ k: 'region_code', o: '=', v: props.selectedRegions });
            }

            const res: Location = {
                name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: item.cloudServiceTypeName ?? item.resources[0].cloud_service_type,
                },
                query: {
                    filters: cloudServiceDetailQueryHelper.rawQueryStrings,
                    period: objectToQueryString(props.period),
                },
            };
            return res;
        };
        return {
            ...toRefs(state),
            assetUrlConverter,
            getCloudServiceDetailLink,
        };
    },
};
</script>

<style scoped lang="postcss">
.cloud-service-type-item {
    @apply bg-white border border-gray-200 rounded-lg;
    box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.06);

    &:hover {
        @apply border-l border-secondary border-gray-200 bg-blue-100;
        cursor: pointer;

        .favorite-btn:not(.active) {
            display: block;
        }
    }

    .item-wrapper {
        @apply flex flex-col w-full h-full;

        .icon {
            @apply overflow-hidden flex-shrink-0 rounded-md;
        }

        .card-title-wrapper {
            min-height: 5.5rem;
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
            padding: 0.75rem 0.25rem;

            .service-type-item {
                @apply flex w-full items-center;
                margin-left: 0.75rem;
                white-space: break-spaces;

                .service-type-name {
                    @apply text-sm text-gray-700;
                    max-width: 80%;
                    font-weight: 600;
                    line-height: 1.3;
                }
                .service-type-count {
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 1.3;
                }

                &:hover {
                    .service-type-name {
                        @apply text-blue-600 underline;
                    }

                    .service-type-count {
                        @apply text-blue-600 underline;
                    }
                }
            }
        }
    }

    .p-divider {
        &.vertical {
            @apply h-full;
        }
    }
}
</style>
