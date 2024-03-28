<template>
    <div class="page-wrapper">
        <p-heading :title="$t('INVENTORY.CLOUD_SERVICE.MAIN.TITLE')"
                   class="page-title"
        />
        <p-divider class="cloud-service-divider" />
        <cloud-service-toolbox :has-next-page="hasNextPage"
                               :handlers="handlerState"
                               :period="cloudServicePageState.period"
                               :page-size="pageLimit"
                               @update-pagination="handlePaginationUpdate"
                               @refresh="handleRefresh"
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
                    :show-button="emptyData.to"
                >
                    <template #image>
                        <img v-if="isNoServiceAccounts"
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
                            :to="emptyData.to"
                        >
                            <p-button style-type="substitutive"
                                      icon-left="ic_plus_bold"
                                      class="mx-auto text-center"
                            >
                                {{ emptyData.buttonText }}
                            </p-button>
                        </router-link>
                    </template>
                    {{ emptyData.desc }}
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
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import { isEmpty } from 'lodash';

import {
    makeDistinctValueHandler,
    makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { SpaceRouter } from '@/router';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

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
import type { EmptyData, Period } from '@/services/asset-inventory/types/type';


interface Response {
    results: CloudServiceAnalyzeResult[];
    more: boolean;
}
export default {
    name: 'CloudServicePage',
    components: {
        CloudServiceListCard,
        CloudServiceToolbox,
        PDivider,
        PButton,
        PHeading,
        PDataLoader,
        PEmpty,
    },
    setup() {
        const allReferenceStore = useAllReferenceStore();
        const cloudServicePageStore = useCloudServicePageStore();
        const cloudServicePageState = cloudServicePageStore.$state;

        const storeState = reactive({
            projects: computed(() => allReferenceStore.getters.project),
            projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
            serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceStore.getters.serviceAccount),
            providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
            collectors: computed<CollectorReferenceMap>(() => allReferenceStore.getters.collector),
        });
        const handlerState = reactive({
            keyItemSets: computed<KeyItemSet[]>(() => [{
                title: 'Properties',
                items: [
                    { name: 'cloud_service_group', label: 'Cloud Service Group' },
                    { name: 'ref_cloud_service_type.service_code', label: 'Product' },
                    { name: 'project_id', label: 'Project', valueSet: storeState.projects },
                    { name: 'project_group_id', label: 'Project Group', valueSet: storeState.projectGroups },
                    { name: 'collection_info.service_account_id', label: 'Service Account', valueSet: storeState.serviceAccounts },
                    { name: 'account', label: 'Account ID' },
                ],
            }]),
            valueHandlerMap: {
                cloud_service_group: makeDistinctValueHandler('inventory.CloudService', 'cloud_service_group'),
                'ref_cloud_service_type.service_code': makeDistinctValueHandler('inventory.CloudServiceType', 'service_code'),
                project_id: makeReferenceValueHandler('identity.Project'),
                project_group_id: makeReferenceValueHandler('identity.ProjectGroup'),
                'collection_info.service_account_id': makeReferenceValueHandler('identity.ServiceAccount'),
                account: makeDistinctValueHandler('inventory.CloudService', 'account'),
            } as ValueHandlerMap,
        });

        const searchQueryHelper = new QueryHelper();
        const state = reactive({
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
            isNoServiceAccounts: computed(() => !Object.keys(storeState.serviceAccounts).length),
            emptyData: computed<EmptyData>(() => {
                let result = {} as EmptyData;
                if (!Object.keys(storeState.serviceAccounts).length) {
                    result = {
                        to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
                        buttonText: i18n.t('INVENTORY.ADD_SERVICE_ACCOUNT') as string,
                        desc: i18n.t('INVENTORY.EMPTY_CLOUD_SERVICE') as string,
                    };
                } else {
                    if (!Object.keys(storeState.collectors).length) {
                        result = {
                            to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME },
                            buttonText: i18n.t('INVENTORY.CREATE_COLLECTOR') as string,
                            desc: i18n.t('INVENTORY.EMPTY_CLOUD_SERVICE_RESOURCE') as string,
                        };
                    }
                    result = {
                        to: undefined,
                        buttonText: undefined,
                        desc: i18n.t('COMMON.ERROR.NO_RESOURCE_TITLE') as string,
                    };
                }
                return result;
            }),
        });

        /* api */
        const fetcher = getCancellableFetcher<CloudServiceAnalyzeParameters, Response>(SpaceConnector.clientV2.inventory.cloudService.analyze);

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
            if (options.pageLimit !== undefined) {
                state.pageLimit = options.pageLimit;
            }
            if (options.pageStart !== undefined) {
                state.pageStart = options.pageStart;
            }
            listCloudServiceType();
        };

        const handleRefresh = () => {
            listCloudServiceType();
        };

        /* Init */
        let urlQueryStringWatcherStop;
        const init = async () => {
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
            handleRefresh,
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
