<template>
    <div>
        <div class="page-wrapper">
            <div class="page-navigation">
                <p-breadcrumbs :routes="routeState.route" />
            </div>
            <p-page-title :title="providers[selectedProvider] ? providers[selectedProvider].name : selectedProvider"
                          class="page-title"
            >
                <template #extra>
                    <service-provider-dropdown class="provider-dropdown"
                                               :selected-provider="selectedProvider"
                                               :has-all="true"
                                               @update:selectedProvider="handleProviderSelect"
                    />
                </template>
            </p-page-title>
            <p-divider class="cloud-service-divider" />
            <cloud-service-toolbox :total-count="totalCount"
                                   :handlers="handlers"
                                   @update-pagination="handlePaginationUpdate"
            />

            <p-data-loader class="flex-grow" :data="items" :loading="loading">
                <div class="cloud-service-type-wrapper">
                    <cloud-service-list-card v-for="(item, idx) in items" :key="`${item.provider}-${item.cloud_service_group}-${idx}`"
                                             :item="item"
                                             :search-filters="searchFilters"
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
    </div>
</template>

<script lang="ts">
import axios, { CancelTokenSource } from 'axios';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PDataLoader, PDivider, PIconTextButton, PPageTitle,
} from '@spaceone/design-system';

import CloudServiceToolbox from '@/services/asset-inventory/cloud-service/modules/CloudServiceToolbox.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';

import {
    arrayToQueryString, objectToQueryString,
    primitiveToQueryString,
    queryStringToArray,
    queryStringToObject,
    queryStringToString,
    replaceUrlQuery,
} from '@/lib/router-query-string';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import CloudServiceListCard
    from '@/services/asset-inventory/cloud-service/modules/cloud-service-list/CloudServiceListCard.vue';
import dayjs from 'dayjs';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/console-core-lib/component-util/query-search/type';
import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@spaceone/console-core-lib/component-util/query-search';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import ServiceProviderDropdown from '@/common/modules/dropdown/service-provider-dropdown/ServiceProviderDropdown.vue';
import { assetInventoryStore } from '@/services/asset-inventory/store';
import {
    CloudServiceCategory, CloudServicePageUrlQuery,
    CloudServicePageUrlQueryValue,
    Period,
} from '@/services/asset-inventory/cloud-service/type';


export default {
    name: 'CloudServicePage',
    components: {
        CloudServiceListCard,
        CloudServiceToolbox,
        ServiceProviderDropdown,
        PDivider,
        PIconTextButton,
        PPageTitle,
        PBreadcrumbs,
        PDataLoader,
    },
    setup() {
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

        const searchQueryHelper = new QueryHelper();
        const state = reactive({
            // references
            providers: computed(() => store.state.reference.provider.items),
            // asset inventory store
            selectedProvider: computed(() => assetInventoryStore.state.cloudService.selectedProvider),
            period: computed(() => assetInventoryStore.state.cloudService.period),
            searchFilters: computed<QueryStoreFilter[]>(() => assetInventoryStore.state.cloudService.searchFilters),
            selectedCategories: computed<CloudServiceCategory[]>(() => assetInventoryStore.getters['cloudService/selectedCategories']),
            selectedRegions: computed<string[]>(() => assetInventoryStore.getters['cloudService/selectedRegions']),
            allFilters: computed<QueryStoreFilter[]>(() => assetInventoryStore.getters['cloudService/allFilters']),
            // list
            loading: true,
            items: undefined as any,
            totalCount: 0,
            // url query
            urlQueryString: computed<CloudServicePageUrlQuery>(() => ({
                provider: state.selectedProvider === 'all' ? null : primitiveToQueryString(state.selectedProvider),
                service: arrayToQueryString(state.selectedCategories),
                region: arrayToQueryString(state.selectedRegions),
                period: objectToQueryString(state.period),
                filters: searchQueryHelper.setFilters(state.searchFilters).rawQueryStrings,
            })),
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
                cloudServiceApiQueryHelper.setFilters(state.allFilters)
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
        // service provider dropdown events
        const handleProviderSelect = (selectedProvider: string) => {
            assetInventoryStore.dispatch('cloudService/setSelectedProvider', selectedProvider);
        };
        // cloud service toolbox events
        const handlePaginationUpdate = (options: ToolboxOptions) => {
            setApiQueryWithToolboxOptions(cloudServiceApiQueryHelper, options, { queryTags: true });
            listCloudServiceType();
        };

        /* Watchers */
        watch(() => state.urlQueryString, (urlQueryString) => {
            replaceUrlQuery(urlQueryString);
            listCloudServiceType();
        });

        /* Init */
        const init = async () => {
            /* load references */
            await store.dispatch('reference/provider/load');


            /* init states from url query */
            const currentQuery = SpaceRouter.router.currentRoute.query;
            const urlQueryValue: CloudServicePageUrlQueryValue = {
                provider: queryStringToString(currentQuery.provider),
                region: queryStringToArray(currentQuery.region),
                service: queryStringToArray<CloudServiceCategory>(currentQuery.service),
                period: queryStringToObject<Period>(currentQuery.period),
                filters: searchQueryHelper.setKeyItemSets(handlers.keyItemSets).setFiltersAsRawQueryString(currentQuery.filters).filters,
            };
            assetInventoryStore.dispatch('cloudService/setSelectedProvider', urlQueryValue.provider);
            assetInventoryStore.dispatch('cloudService/setSelectedRegions', urlQueryValue.region);
            assetInventoryStore.dispatch('cloudService/setSelectedCategories', urlQueryValue.service);
            assetInventoryStore.dispatch('cloudService/setPeriod', urlQueryValue.period);
            assetInventoryStore.dispatch('cloudService/setSearchFilters', searchQueryHelper.filters);

            /* list data */
            await listCloudServiceType();
        };

        (async () => {
            await init();
        })();

        return {
            ...toRefs(state),
            routeState,
            handlers,
            assetUrlConverter,
            handleProviderSelect,
            handlePaginationUpdate,
            ASSET_INVENTORY_ROUTE,
        };
    },
};

</script>

<style lang="postcss" scoped>
.p-page-title::v-deep {
    overflow: unset;
    .extra {
        @apply justify-between items-center;
    }
    .provider-dropdown {
        margin-left: 0.5rem;
    }
}

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
