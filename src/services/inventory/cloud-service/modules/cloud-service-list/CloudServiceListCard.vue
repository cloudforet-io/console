<template>
    <div class="cloud-service-type-item">
        <router-link :to="getCloudServiceDetailLink(item)"
                     class="item-wrapper"
        >
            <div class="provider-title-wrapper">
                <p-lazy-img width="1rem" height="1rem"
                            :src="providers[item.provider].icon"
                            error-icon="ic_provider_other"
                            :alt="item.name"
                            class="icon"
                />
                <span class="provider">{{ providers[item.provider] ? providers[item.provider].label : item.provider }}</span>
            </div>
            <div class="service-group-wrapper">
                <p-lazy-img width="1.5rem" height="1.5rem"
                            :src="assetUrlConverter(item.icon) || (providers[item.provider] ? providers[item.provider].icon : '')"
                            error-icon="ic_provider_other"
                            :alt="item.name"
                            class="icon"
                />
                <span class="service-group">{{ item.cloud_service_group }}</span>
            </div>
            <div class="service-type-list">
                <router-link v-for="(cloudServiceType, idx) in item.resources"
                             :key="`${cloudServiceType}-${idx}`"
                             :to="getCloudServiceDetailLink({ ...item, cloudServiceTypeName: cloudServiceType.cloud_service_type })"
                             class="service-type-item"
                >
                    <span class="service-type-name">{{ cloudServiceType.cloud_service_type }}</span>
                    <span class="service-type-count">{{ cloudServiceType.count }}</span>
                </router-link>
            </div>
        </router-link>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { Location } from 'vue-router';

import { PLazyImg } from '@spaceone/design-system';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

import { store } from '@/store';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';

interface Props {
    item: any;
    queryFilters: QueryStoreFilter[];
    selectedRegions: string[];
}

export default {
    name: 'CloudServiceListCard',
    components: {
        PLazyImg,
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
    },
    setup(props: Props) {
        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
        });
        const cloudServiceDetailQueryHelper = new QueryHelper();
        const getCloudServiceDetailLink = (item) => {
            cloudServiceDetailQueryHelper.setFilters(props.queryFilters.filter((f: any) => f.k && ![
                'cloud_service_type',
                'cloud_service_group',
            ].includes(f.k)));

            if (props.selectedRegions.length) {
                cloudServiceDetailQueryHelper.addFilter({ k: 'region_code', o: '=', v: props.selectedRegions });
            }

            const res: Location = {
                name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: item.cloudServiceTypeName ?? item.resources[0].cloud_service_type,
                },
                query: {
                    filters: cloudServiceDetailQueryHelper.rawQueryStrings,
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
    min-height: 9rem;
    filter: drop-shadow(0 2px 4px rgba(theme('colors.black'), 0.06));

    &:hover {
        @apply border-l border-secondary bg-blue-100;
        cursor: pointer;

        .favorite-btn:not(.active) {
            display: block;
        }
    }

    .item-wrapper {
        @apply flex flex-col w-full h-full flex-wrap gap-2 p-4;

        .icon {
            @apply overflow-hidden flex-shrink-0 rounded-md;
        }

        .provider-title-wrapper {
            @apply flex flex-wrap gap-1 items-center;
            margin: 0 0.5rem;

            .provider {
                @apply text-gray-700 text-sm;
                line-height: 150%;
            }
        }

        .service-group-wrapper {
            @apply w-full flex gap-2 items-center;
            padding: 0 0.5rem;

            .service-group {
                @apply inline-block font-bold text-lg text-gray-900 truncate;
                max-width: calc(100% - 1.5rem);
                line-height: 1.2;
            }
        }

        .service-type-list {
            @apply flex flex-wrap flex-col w-full;
            height: 3rem;
            gap: 0.125rem;
            .service-type-item {
                @apply flex justify-between w-full rounded;
                margin-top: auto;
                padding: 0.15rem 0.5rem;
                .service-type-name {
                    @apply text-sm text-gray-900 truncate;
                    max-width: 90%;
                }
                .service-type-count {
                    @apply text-gray-500;
                }

                &:hover {
                    @apply bg-blue-200;

                    .service-type-name {
                        @apply text-blue-500 underline;
                    }

                    .service-type-count {
                        @apply text-blue-500;
                    }
                }
            }
        }
    }
}
</style>
