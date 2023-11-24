<template>
    <div class="page-wrapper">
        <p-heading :title="title"
                   class="page-title"
        >
            <template #title-right-extra>
                <service-provider-dropdown class="provider-dropdown"
                                           :has-all="true"
                />
            </template>
        </p-heading>
        <p-divider class="cloud-service-divider" />
        <cloud-service-toolbox :has-next-page="hasNextPage"
                               :handlers="handlerState"
                               :period="cloudServicePageState.period"
                               :page-size="pageLimit"
                               @update-pagination="handlePaginationUpdate"
        />

        <p-data-loader class="flex-grow"
                       :data="items"
                       :loading="loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <div class="cloud-service-type-wrapper">
                <cloud-service-list-card v-for="(item, idx) in items"
                                         :key="`${item.provider || ''}-${item.cloud_service_group || ''}-${idx}`"
                                         :item="item"
                />
            </div>
            <template #no-data>
                <p-empty
                    show-image
                    image-size="md"
                    :show-button="!Object.keys(storeState.serviceAccounts).length"
                >
                    <template #image>
                        <img v-if="!Object.keys(storeState.serviceAccounts).length"
                             alt="empty-cloud-service-img"
                             src="@/assets/images/illust_satellite.svg"
                        >
                        <img v-else
                             alt="empty-cloud-service-img"
                             src="@/assets/images/illust_microscope.svg"
                        >
                    </template>
                    <template #button>
                        <router-link
                            :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.ADD._NAME, params: { provider: cloudServicePageState.selectedProvider}}"
                        >
                            <p-button style-type="substitutive"
                                      icon-left="ic_plus_bold"
                                      class="mx-auto text-center"
                                      :disabled="!hasManagePermission"
                            >
                                {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.ADD_SERVICE_ACCOUNT') }}
                            </p-button>
                        </router-link>
                    </template>
                    {{ Object.keys(storeState.serviceAccounts).length ? $t('COMMON.WIDGETS.CLOUD_SERVICE.NO_DATA')
                        : $t('INVENTORY.CLOUD_SERVICE.MAIN.EMPTY_CLOUD_SERVICE')
                    }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import {
    PDataLoader, PDivider, PButton, PHeading, PEmpty,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';

import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import type { ToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

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
    from '@/services/asset-inventory/components/CloudServiceListCard.vue';
import CloudServiceToolbox from '@/services/asset-inventory/components/CloudServiceToolbox.vue';
import { getCloudServiceAnalyzeQuery } from '@/services/asset-inventory/helpers/cloud-service-analyze-query-helper';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { CloudServiceAnalyzeResult } from '@/services/asset-inventory/types/cloud-service-card-type';
import type {
    CloudServiceCategory, CloudServicePageUrlQuery,
    CloudServicePageUrlQueryValue,
} from '@/services/asset-inventory/types/cloud-service-page-type';
import type { Period } from '@/services/asset-inventory/types/type';


interface Response {
    results: CloudServiceAnalyzeResult[];
    more: boolean;
}
export default {
    name: 'CloudServicePage',
    components: {
        CloudServiceListCard,
        CloudServiceToolbox,
        ServiceProviderDropdown,
        PDivider,
        PButton,
        PHeading,
        PDataLoader,
        PEmpty,
    },
    setup() {
        const cloudServicePageStore = useCloudServicePageStore();
        const cloudServicePageState = cloudServicePageStore.$state;

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
            title: computed<string>(() => {
                if (!isEmpty(storeState.providers[cloudServicePageState.selectedProvider])) {
                    return storeState.providers[cloudServicePageState.selectedProvider].name;
                }
                return cloudServicePageState.selectedProvider;
            }),
            // list
            loading: true,
            items: undefined as CloudServiceAnalyzeResult[]|undefined,
            hasNextPage: false,
            pageStart: 1,
            pageLimit: 24,
            // url query
            urlQueryString: computed<CloudServicePageUrlQuery>(() => ({
                provider: cloudServicePageState.selectedProvider === 'all' ? null : primitiveToQueryString(cloudServicePageState.selectedProvider),
                service: arrayToQueryString(cloudServicePageStore.selectedCategories),
                region: arrayToQueryString(cloudServicePageStore.selectedRegions),
                period: objectToQueryString(cloudServicePageState.period),
                filters: searchQueryHelper.setFilters(cloudServicePageState.searchFilters).rawQueryStrings,
            })),
        });

        /* api */
        const fetcher = getCancellableFetcher<Response>(SpaceConnector.clientV2.inventory.cloudService.analyze);

        const listCloudServiceType = async () => {
            try {
                state.loading = true;

                const { status, response } = await fetcher({
                    query: getCloudServiceAnalyzeQuery(
                        cloudServicePageStore.allFilters,
                        { start: state.pageStart, limit: state.pageLimit },
                        cloudServicePageState.period,
                    ),
                });
                if (status === 'succeed') {
                    state.items = response.results;
                    state.hasNextPage = response.more ?? false;
                    state.loading = false;
                }
            } catch (e) {
                state.items = [];
                state.hasNextPage = false;
                state.loading = false;
                ErrorHandler.handleError(e);
            }
        };

        /* event */
        // cloud service toolbox events
        const handlePaginationUpdate = (options: ToolboxOptions) => {
            console.debug('options', options);
            if (options.pageLimit !== undefined) {
                state.pageLimit = options.pageLimit;
            }
            if (options.pageStart !== undefined) {
                state.pageStart = options.pageStart;
            }
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
            cloudServicePageStore.setSelectedProvider(urlQueryValue.provider);
            cloudServicePageStore.setSelectedRegionsToFilters(urlQueryValue.region);
            cloudServicePageStore.setSelectedCategoriesToFilters(urlQueryValue.service);
            cloudServicePageStore.$patch((_state) => {
                _state.period = urlQueryValue.period;
                _state.searchFilters = searchQueryHelper.filters as ConsoleFilter[];
            });

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
            // urlQueryString watcher is referencing cloudServicePageStore which is destroyed on unmounted. so urlQueryString watcher must be destroyed on unmounted too.
            if (urlQueryStringWatcherStop) urlQueryStringWatcherStop();
        });

        return {
            ...toRefs(state),
            storeState,
            handlerState,
            cloudServicePageState,
            assetUrlConverter,
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

/* custom design-system component - p-empty */
:deep(.p-empty) {
    @apply w-full h-full;
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
