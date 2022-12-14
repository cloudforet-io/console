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
                                       :handlers="handlers"
                                       :query-tags.sync="queryTags"
                                       @update-toolbox="handleToolbox"
                >
                    <template #period>
                        <cloud-service-period-filter :period.sync="period"
                                                     @delete-period="handleDeletePeriod"
                        />
                    </template>
                </cloud-service-toolbox>
                <p-data-loader class="flex-grow" :data="items" :loading="loading">
                    <div class="cloud-service-type-wrapper">
                        <cloud-service-list-card v-for="(item, idx) in items" :key="`${item.provider}-${item.cloud_service_group}-${idx}`"
                                                 :item="item"
                                                 :query-filters="queryFilters"
                                                 :selected-regions="selectedRegions"
                                                 :period="period"
                        />
                    </div>
                    <template #no-data>
                        <div class="text-center empty-cloud-service">
                            <img class="empty-cloud-service-img" src="@/assets/images/illust_satellite.svg">
                            <p class="text-primary2 mb-12">
                                {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.EMPTY_CLOUD_SERVICE') }}
                            </p>
                            <router-link :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.ADD._NAME, params: { provider: selectedProvider}}">
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
import axios, { CancelTokenSource } from 'axios';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PDataLoader, PDivider, PIconTextButton, PPageTitle,
} from '@spaceone/design-system';

import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import CloudServiceMenu from '@/services/asset-inventory/cloud-service/modules/CloudServiceMenu.vue';
import CloudServiceToolbox from '@/services/asset-inventory/cloud-service/modules/CloudServiceToolbox.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';

import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import {
    arrayToQueryString,
    primitiveToQueryString,
    queryStringToArray,
    queryStringToObject,
    queryStringToString,
    replaceUrlQuery,
    RouteQueryString,
} from '@/lib/router-query-string';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { registerServiceStore } from '@/common/composables/register-service-store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { CloudServiceStoreState } from '@/services/asset-inventory/cloud-service/store/type';
import cloudServiceStoreModule from '@/services/asset-inventory/cloud-service/store';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { Period } from '@/services/cost-explorer/type';
import CloudServiceListCard
    from '@/services/asset-inventory/cloud-service/modules/cloud-service-list/CloudServiceListCard.vue';
import dayjs from 'dayjs';
import CloudServicePeriodFilter from '@/services/asset-inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/console-core-lib/component-util/query-search/type';
import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@spaceone/console-core-lib/component-util/query-search';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';


export default {
    name: 'CloudServicePage',
    components: {
        CloudServicePeriodFilter,
        CloudServiceListCard,
        CloudServiceToolbox,
        PVerticalPageLayout,
        CloudServiceMenu,
        PDivider,
        PIconTextButton,
        PPageTitle,
        PBreadcrumbs,
        PDataLoader,
    },
    setup() {
        registerServiceStore<CloudServiceStoreState>('cloudService', cloudServiceStoreModule);

        const vm = getCurrentInstance() as ComponentRenderProxy;

        const handlers = {
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'cloud_service_type', label: 'Cloud Service Type' },
                    { name: 'cloud_service_group', label: 'Cloud Service Group' },
                    { name: 'service_code', label: 'Product' },
                    { name: 'project_group_id', label: 'Project Group' },
                    { name: 'project_id', label: 'Project' },
                    { name: 'collection_info.service_accounts', label: 'Service Account' },
                    { name: 'account', label: 'Account ID' },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: {
                cloud_service_type: makeDistinctValueHandler('inventory.CloudService', 'cloud_service_type'),
                cloud_service_group: makeDistinctValueHandler('inventory.CloudService', 'cloud_service_group'),
                service_code: makeDistinctValueHandler('inventory.CloudServiceType', 'service_code'),
                project_group_id: makeReferenceValueHandler('identity.ProjectGroup'),
                project_id: makeReferenceValueHandler('identity.Project'),
                'collection_info.service_accounts': makeReferenceValueHandler('identity.ServiceAccount'),
                account: makeDistinctValueHandler('inventory.CloudService', 'account'),
            } as ValueHandlerMap,
        };

        const queryHelper = new QueryHelper().setKeyItemSets(handlers.keyItemSets).setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            providers: computed(() => store.state.reference.provider.items),
            serviceAccounts: computed(() => store.state.reference.serviceAccount.items),
            favoriteItems: computed(() => store.getters['favorite/cloudServiceType/sortedItems']),
            selectedProvider: computed(() => store.state.service.cloudService.selectedProvider),
            selectedCategories: computed(() => store.state.service.cloudService.selectedCategories),
            selectedRegions: computed(() => store.state.service.cloudService.selectedRegions),
            period: queryStringToObject(SpaceRouter.router.currentRoute.query?.period) as Period | undefined,
            //
            loading: true,
            items: undefined as any,
            queryTags: queryHelper.queryTags as QueryTag[],
            totalCount: 0,
            filters: computed<QueryStoreFilter[]>(() => {
                const filters: QueryStoreFilter[] = [];
                if (state.selectedProvider !== 'all') {
                    filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
                } if (state.selectedRegions.length) {
                    filters.push({ k: 'region_code', v: state.selectedRegions, o: '=' });
                } if (state.selectedCategories.length) {
                    filters.push({ k: 'labels', v: state.selectedCategories, o: '=' });
                }
                const queryFilters: QueryStoreFilter[] = queryHelper.setFiltersAsQueryTag(state.queryTags).filters;
                return [...filters, ...queryFilters];
            }),
            queryFilters: queryHelper.filters,
        });

        const routeState = reactive({
            route: [
                { name: 'Asset Inventory', to: { name: ASSET_INVENTORY_ROUTE._NAME } },
                { name: 'Cloud Service' },
            ],
        });

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
                cloudServiceApiQueryHelper.setFilters(state.filters)
                    .setMultiSort([{ key: 'is_primary', desc: true }, { key: 'name', desc: false }]);
                const res = await SpaceConnector.client.inventory.cloudServiceType.analyze({
                    labels: state.selectedCategories,
                    ...cloudServiceApiQueryHelper.data,
                    ...(state.period && {
                        date_range: {
                            start: dayjs.utc(state.period.start).format('YYYY-MM-DD'),
                            end: dayjs.utc(state.period.end).add(1, 'day').format('YYYY-MM-DD'),
                        },
                    }),
                });
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
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('favorite/cloudServiceType/load'),
            ]);

            /* filter setting */
            const currentQuery = SpaceRouter.router.currentRoute.query;
            store.commit('service/cloudService/setSelectedRegions', queryStringToArray(currentQuery.region) || []);
            store.commit('service/cloudService/setSelectedCategories', queryStringToArray(currentQuery.service) || []);

            // init provider
            let provider: RouteQueryString = currentQuery.provider;
            if (Array.isArray(provider)) provider = queryStringToString(provider[0]);
            else provider = queryStringToString(provider);
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
            handlers,
            assetUrlConverter,
            handleToolbox,
            handleDeletePeriod,
            ASSET_INVENTORY_ROUTE,
        };
    },
};

</script>

<style lang="postcss" scoped>
.page-wrapper {
    @apply flex flex-col w-full h-full;
}
.cloud-service-divider {
    @apply w-full;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}
.cloud-service-type-wrapper {
    @apply grid w-full;
    grid-template-columns: repeat(auto-fill, minmax(16.5rem, 1fr));
    gap: 1rem;
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

@screen tablet {
    .cloud-service-type-wrapper {
        grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    }
}

@screen mobile {
    .cloud-service-type-wrapper {
        grid-template-columns: 100%;
    }
}
</style>
