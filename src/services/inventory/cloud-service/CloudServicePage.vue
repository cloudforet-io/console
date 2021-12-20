<template>
    <p-vertical-page-layout>
        <template #sidebar>
            <cloud-service-menu />
        </template>
        <template #default>
            <div class="page-wrapper">
                <div class="page-navigation">
                    <p-breadcrumbs :routes="routeState.route" />
                </div>
                <p-page-title :title="providers[selectedProvider] ? providers[selectedProvider].name : selectedProvider"
                              use-total-count
                              :total-count="totalCount"
                              class="page-title"
                />
                <p-divider class="cloud-service-divider" />
                <cloud-service-toolbox :total-count="totalCount"
                                       :filters="filters"
                                       :period.sync="period"
                                       :query-tags.sync="queryTags"
                                       @update-toolbox="handleToolbox"
                                       @delete-period="handleDeletePeriod"
                />
                <p-data-loader class="flex-grow" :data="items" :loading="loading">
                    <div class="cloud-service-type-wrapper">
                        <div v-for="(item, i) in items" :key="i" class="cloud-service-type-item">
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
                                    <router-link :to="getCloudServiceDetailLink(item)"
                                                 class="service-type-item"
                                    >
                                        <span class="service-type-name">{{ item.cloud_service_type }}</span>
                                        <span class="service-type-count">{{ item.count }}</span>
                                    </router-link>
                                </div>
                            </router-link>
                        </div>
                    </div>
                    <template #no-data>
                        <div class="text-center empty-cloud-service">
                            <img class="empty-cloud-service-img" src="@/assets/images/illust_satellite.svg">
                            <p class="text-primary2 mb-12">
                                {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.EMPTY_CLOUD_SERVICE') }}
                            </p>
                            <router-link :to="`/identity/service-account/?provider=${selectedProvider}`">
                                <p-icon-text-button style-type="primary" name="ic_plus_bold"
                                                    class="mx-auto text-center"
                                >
                                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.ADD_SERVICE_ACCOUNT') }}
                                </p-icon-text-button>
                            </router-link>
                        </div>
                    </template>
                </p-data-loader>
            </div>
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
import { Location } from 'vue-router';
import axios, { CancelTokenSource } from 'axios';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PDataLoader, PDivider, PIconTextButton, PLazyImg, PPageTitle,
} from '@spaceone/design-system';

import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import CloudServiceMenu from '@/services/inventory/cloud-service/modules/CloudServiceMenu.vue';
import CloudServiceToolbox from '@/services/inventory/cloud-service/modules/CloudServiceToolbox.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';

import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import {
    arrayToQueryString,
    primitiveToQueryString,
    queryStringToArray,
    queryStringToObject,
    queryStringToString,
    replaceUrlQuery,
    RouteQueryString,
} from '@/lib/router-query-string';
import {
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-util/dynamic-layout';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { registerServiceStore } from '@/common/composables/register-service-store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { CloudServiceStoreState } from '@/services/inventory/cloud-service/store/type';
import cloudServiceStoreModule from '@/services/inventory/cloud-service/store';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';
import { store } from '@/store';
import { Period } from '@/services/billing/cost-management/type';


export default {
    name: 'CloudServicePage',
    components: {
        CloudServiceToolbox,
        PVerticalPageLayout,
        CloudServiceMenu,
        PLazyImg,
        PDivider,
        PIconTextButton,
        PPageTitle,
        PBreadcrumbs,
        PDataLoader,
    },
    setup() {
        registerServiceStore<CloudServiceStoreState>('cloudService', cloudServiceStoreModule);

        const vm = getCurrentInstance() as ComponentRenderProxy;

        const handlers = makeQuerySearchPropsWithSearchSchema(
            [{
                title: 'Properties',
                items: [
                    { key: 'cloud_service_type', name: 'Cloud Service Type' },
                    { key: 'cloud_service_group', name: 'Cloud Service Group' },
                    { key: 'project_id', name: 'Project', reference: 'identity.Project' },
                    { key: 'collection_info.service_accounts', name: 'Service Account', reference: 'identity.ServiceAccount' },
                    { key: 'collection_info.secrets', name: 'Secret', reference: 'secret.Secret' },
                ],
            }],
            'inventory.CloudService',
        );
        const queryHelper = new QueryHelper().setKeyItemSets(handlers.keyItemSets).setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            favoriteItems: computed(() => store.getters['favorite/cloudServiceType/sortedItems']),
            selectedProvider: computed(() => store.state.service.cloudService.selectedProvider),
            selectedCategories: computed(() => store.state.service.cloudService.selectedCategories),
            selectedRegions: computed(() => store.state.service.cloudService.selectedRegions),
            period: queryStringToObject(SpaceRouter.router.currentRoute.query?.period) as Period | undefined,
            //
            loading: true,
            items: [] as any[],
            keyItemSets: handlers.keyItemSets,
            valueHandlerMap: handlers.valueHandlerMap,
            queryTags: [] as QueryTag[],
            totalCount: 0,
            filters: computed<QueryStoreFilter[]>(() => {
                const filters: QueryStoreFilter[] = [];
                if (state.selectedProvider !== 'all') {
                    filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
                } if (state.selectedRegions.length) {
                    filters.push({ k: 'region_code', v: state.selectedRegions, o: '=' });
                }
                const queryFilters: QueryStoreFilter[] = queryHelper.setFiltersAsQueryTag(state.queryTags).filters;
                return [...filters, ...queryFilters];
            }),
        });

        const routeState = reactive({
            route: computed(() => ([
                { name: i18n.t('MENU.INVENTORY.INVENTORY'), path: '/inventory' },
                { name: i18n.t('MENU.INVENTORY.CLOUD_SERVICE') },
            ])),
        });

        /* util */
        const cloudServiceDetailQueryHelper = new QueryHelper();
        const getCloudServiceDetailLink = (item) => {
            const searchFilters = queryHelper.filters;
            cloudServiceDetailQueryHelper.setFilters(searchFilters.filter((f: any) => f.k && ![
                'cloud_service_type',
                'cloud_service_group',
            ].includes(f.k)));

            if (state.selectedRegions.length) {
                cloudServiceDetailQueryHelper.addFilter({ k: 'region_code', o: '=', v: state.selectedRegions });
            }

            const res: Location = {
                name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: item.cloud_service_type,
                },
                query: {
                    filters: cloudServiceDetailQueryHelper.rawQueryStrings,
                },
            };
            return res;
        };

        /* api */
        const cloudServiceApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(24)
            .setSort('count', true);
        let listCloudServiceRequest: CancelTokenSource | undefined;
        const listCloudServiceType = async () => {
            if (listCloudServiceRequest) {
                listCloudServiceRequest.cancel('Next request has been called.');
                listCloudServiceRequest = undefined;
            }
            listCloudServiceRequest = axios.CancelToken.source();
            try {
                state.loading = true;
                cloudServiceApiQueryHelper.setFilters(state.filters);
                const res = await SpaceConnector.client.statistics.topic.cloudServiceResources(
                    {
                        labels: state.selectedCategories,
                        query: cloudServiceApiQueryHelper.data,
                    },
                    { cancelToken: listCloudServiceRequest.token },
                );
                state.items = res.results;
                state.totalCount = res.total_count || 0;
                state.loading = false;
                listCloudServiceRequest = undefined;
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    state.items = [];
                    state.totalCount = 0;
                    state.loading = false;
                } else {
                    ErrorHandler.handleError(e);
                }
            }
        };

        /* event */
        const handleToolbox = async (options: ToolboxOptions) => {
            setApiQueryWithToolboxOptions(cloudServiceApiQueryHelper, options, { queryTags: true });
            if (options.queryTags !== undefined) {
                state.queryTags = options.queryTags;
                await replaceUrlQuery('filters', cloudServiceApiQueryHelper.rawQueryStrings);
            }
            await listCloudServiceType();
        };
        const handleDeletePeriod = async () => {
            await replaceUrlQuery('period', undefined);
            await listCloudServiceType();
        };

        /* Init */
        (async () => {
            await Promise.all([
                store.dispatch('resource/provider/load'),
                store.dispatch('resource/serviceAccount/load'),
                store.dispatch('resource/cloudServiceType/load'),
                store.dispatch('favorite/cloudServiceType/load'),
            ]);

            /* filter setting */
            const currentQuery = SpaceRouter.router.currentRoute.query;
            store.commit('service/cloudService/setSelectedRegions', queryStringToArray(currentQuery.region) || []);
            store.commit('service/cloudService/setSelectedCategories', queryStringToArray(currentQuery.service) || []);

            // init provider
            let provider: RouteQueryString = currentQuery.provider;
            if (Array.isArray(provider)) provider = queryStringToString(provider[0]);
            if (!provider || !state.providers[provider]) provider = 'all';
            store.commit('service/cloudService/setSelectedProvider', provider);

            if (currentQuery.provider !== primitiveToQueryString(provider)) {
                await replaceUrlQuery('provider', primitiveToQueryString(provider));
            }
            await listCloudServiceType();
        })();

        /* Watcher */
        watch(() => state.selectedProvider, async () => {
            await replaceUrlQuery('provider', primitiveToQueryString(state.selectedProvider));
            await listCloudServiceType();
        });
        watch(() => state.selectedCategories, async (after, before) => {
            if (after.length !== before.length) {
                await replaceUrlQuery('service', arrayToQueryString(state.selectedCategories));
                await listCloudServiceType();
            }
        });
        watch(() => state.selectedRegions, async (after, before) => {
            if (after.length !== before.length) {
                await replaceUrlQuery('region', arrayToQueryString(state.selectedRegions));
                await listCloudServiceType();
            }
        });

        return {
            ...toRefs(state),
            routeState,
            assetUrlConverter,
            getCloudServiceDetailLink,
            handleToolbox,
            handleDeletePeriod,
        };
    },
};

</script>

<style lang="postcss" scoped>
.page-wrapper {
    @apply flex flex-col w-full h-full;
}
.show-all {
    @apply text-sm mr-2;
    line-height: 2rem;
}
.cloud-service-divider {
    @apply w-full;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}
.cloud-service-type-wrapper {
    @apply grid w-full;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
}
.cloud-service-type-item {
    @apply p-4 bg-white border border-gray-200 rounded-lg;
    height: 9rem;
    filter: drop-shadow(0 2px 4px rgba(theme('colors.black'), 0.06));
    .favorite-btn {
        @apply ml-2;
        flex-shrink: 0;
        &:not(.active) {
            display: none;
        }
    }
    &:hover {
        @apply border-l border-secondary bg-blue-100;
        cursor: pointer;
        .favorite-btn:not(.active) {
            display: block;
        }
    }
    .item-wrapper {
        @apply flex flex-col w-full h-full flex-wrap gap-2;
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
            @apply flex flex-wrap gap-2 items-center;
            padding: 0 0.5rem;

            .service-group {
                @apply font-bold text-lg text-gray-900;
            }
        }
        .service-type-list {
            @apply flex flex-wrap flex-col-reverse;
            height: 3rem;
            gap: 0.125rem;
            .service-type-item {
                @apply flex justify-between rounded;
                padding: 0.15rem 0.5rem;
                .service-type-name {
                    @apply text-sm text-gray-900;
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
.page-title {
    @apply capitalize;
    margin-bottom: 0;
}
.empty-cloud-service {
    @apply w-full h-full;
    .empty-cloud-service-img {
        @apply w-48 mx-auto pt-19 mb-8;
    }
}
</style>
