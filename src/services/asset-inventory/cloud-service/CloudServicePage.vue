<template>
    <div class="page-wrapper">
        <p-page-title :title="storeState.providers[selectedProvider] ? storeState.providers[selectedProvider].name : selectedProvider"
                      class="page-title"
        >
            <template #title-right-extra>
                <service-provider-dropdown class="provider-dropdown"
                                           :selected-provider="selectedProvider"
                                           :has-all="true"
                                           @update:selectedProvider="handleProviderSelect"
                />
            </template>
        </p-page-title>
        <p-divider class="cloud-service-divider" />
        <cloud-service-toolbox :total-count="totalCount"
                               :handlers="handlerState"
                               @update-pagination="handlePaginationUpdate"
        />

        <p-data-loader class="flex-grow"
                       :data="items"
                       :loading="loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <div class="cloud-service-type-wrapper">
                <cloud-service-list-card v-for="(item, idx) in items"
                                         :key="`${item.provider}-${item.cloud_service_group}-${idx}`"
                                         :item="item"
                                         :search-filters="searchFilters"
                                         :selected-regions="selectedRegions"
                                         :period="period"
                />
            </div>
            <template #no-data>
                <div class="text-center empty-cloud-service">
                    <img v-if="!Object.keys(storeState.serviceAccounts).length"
                         class="empty-cloud-service-img"
                         src="@/assets/images/illust_satellite.svg"
                    >
                    <img v-else
                         class="empty-cloud-service-img"
                         src="@/assets/images/illust_microscope.svg"
                    >
                    <p class="text-primary2 mb-12">
                        {{ Object.keys(storeState.serviceAccounts).length ? $t('COMMON.WIDGETS.CLOUD_SERVICE.NO_DATA')
                            : $t('INVENTORY.CLOUD_SERVICE.MAIN.EMPTY_CLOUD_SERVICE')
                        }}
                    </p>
                    <router-link
                        v-if="!Object.keys(storeState.serviceAccounts).length"
                        :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.ADD._NAME, params: { provider: selectedProvider}}"
                    >
                        <p-button style-type="primary"
                                  icon-left="ic_plus_bold"
                                  class="mx-auto text-center"
                                  :disabled="!hasManagePermission"
                        >
                            {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.ADD_SERVICE_ACCOUNT') }}
                        </p-button>
                    </router-link>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import {
    PDataLoader, PDivider, PButton, PPageTitle,
} from '@spaceone/design-system';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';

import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import {
    arrayToQueryString, objectToQueryString,
    primitiveToQueryString,
    queryStringToArray,
    queryStringToObject,
    queryStringToString,
    replaceUrlQuery,
} from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import ServiceProviderDropdown from '@/common/modules/dropdown/service-provider-dropdown/ServiceProviderDropdown.vue';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import CloudServiceListCard
    from '@/services/asset-inventory/cloud-service/modules/cloud-service-list/CloudServiceListCard.vue';
import CloudServiceToolbox from '@/services/asset-inventory/cloud-service/modules/CloudServiceToolbox.vue';
import type {
    CloudServiceCategory, CloudServicePageUrlQuery,
    CloudServicePageUrlQueryValue,
    Period,
} from '@/services/asset-inventory/cloud-service/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { assetInventoryStore } from '@/services/asset-inventory/store';

export default {
    name: 'CloudServicePage',
    components: {
        CloudServiceListCard,
        CloudServiceToolbox,
        ServiceProviderDropdown,
        PDivider,
        PButton,
        PPageTitle,
        PDataLoader,
    },
    setup() {
        const storeState = reactive({
            projects: computed(() => store.getters['reference/projectItems']),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
            serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
        });
        const handlerState = reactive({
            keyItemSets: computed<KeyItemSet[]>(() => [{
                title: 'Properties',
                items: [
                    { name: 'cloud_service_type', label: 'Cloud Service Type' },
                    { name: 'cloud_service_group', label: 'Cloud Service Group' },
                    { name: 'service_code', label: 'Product' },
                    { name: 'project_group_id', label: 'Project Group', valueSet: storeState.projectGroups },
                    { name: 'project_id', label: 'Project', valueSet: storeState.projects },
                    { name: 'collection_info.service_account_id', label: 'Service Account', valueSet: storeState.serviceAccounts },
                    { name: 'account', label: 'Account ID' },
                ],
            }]),
            valueHandlerMap: {
                cloud_service_type: makeDistinctValueHandler('inventory.CloudService', 'cloud_service_type'),
                cloud_service_group: makeDistinctValueHandler('inventory.CloudService', 'cloud_service_group'),
                service_code: makeDistinctValueHandler('inventory.CloudServiceType', 'service_code'),
                project_group_id: makeReferenceValueHandler('identity.ProjectGroup'),
                project_id: makeReferenceValueHandler('identity.Project'),
                'collection_info.service_account_id': makeReferenceValueHandler('identity.ServiceAccount'),
                account: makeDistinctValueHandler('inventory.CloudService', 'account'),
            } as ValueHandlerMap,
        });

        const searchQueryHelper = new QueryHelper();
        const state = reactive({
            hasManagePermission: useManagePermissionState(),
            // asset inventory store
            selectedProvider: computed(() => assetInventoryStore.state.cloudService.selectedProvider),
            period: computed(() => assetInventoryStore.state.cloudService.period),
            searchFilters: computed<ConsoleFilter[]>(() => assetInventoryStore.state.cloudService.searchFilters),
            selectedCategories: computed<CloudServiceCategory[]>(() => assetInventoryStore.getters['cloudService/selectedCategories']),
            selectedRegions: computed<string[]>(() => assetInventoryStore.getters['cloudService/selectedRegions']),
            allFilters: computed<ConsoleFilter[]>(() => assetInventoryStore.getters['cloudService/allFilters']),
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
            } catch (e: any) {
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

        /* Init */
        let urlQueryStringWatcherStop;
        const init = async () => {
            /* load references */
            await Promise.allSettled([store.dispatch('reference/provider/load'), store.dispatch('reference/serviceAccount/load')]);

            /* init states from url query */
            const currentQuery = SpaceRouter.router.currentRoute.query;
            const urlQueryValue: CloudServicePageUrlQueryValue = {
                provider: queryStringToString(currentQuery.provider),
                region: queryStringToArray(currentQuery.region),
                service: queryStringToArray<CloudServiceCategory>(currentQuery.service),
                period: queryStringToObject<Period>(currentQuery.period),
                filters: searchQueryHelper.setKeyItemSets(handlerState.keyItemSets).setFiltersAsRawQueryString(currentQuery.filters).filters,
            };
            assetInventoryStore.dispatch('cloudService/setSelectedProvider', urlQueryValue.provider);
            assetInventoryStore.dispatch('cloudService/setSelectedRegions', urlQueryValue.region);
            assetInventoryStore.dispatch('cloudService/setSelectedCategories', urlQueryValue.service);
            assetInventoryStore.dispatch('cloudService/setPeriod', urlQueryValue.period);
            assetInventoryStore.dispatch('cloudService/setSearchFilters', searchQueryHelper.filters);

            // LOAD REFERENCE STORE
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/serviceAccount/load'),
            ]);

            /* register urlQueryString watcher after initiating states from url query */
            urlQueryStringWatcherStop = watch(() => state.urlQueryString, (urlQueryString) => {
                replaceUrlQuery(urlQueryString);
                listCloudServiceType();
            });

            /* list data */
            await listCloudServiceType();
        };

        (async () => {
            await init();
        })();

        onUnmounted(() => {
            // urlQueryString watcher is referencing assetInventoryStore which is destroyed on unmounted. so urlQueryString watcher must be destroyed on unmounted too.
            if (urlQueryStringWatcherStop) urlQueryStringWatcherStop();
        });

        return {
            ...toRefs(state),
            storeState,
            handlerState,
            assetUrlConverter,
            handleProviderSelect,
            handlePaginationUpdate,
            ASSET_INVENTORY_ROUTE,
            BACKGROUND_COLOR,
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
