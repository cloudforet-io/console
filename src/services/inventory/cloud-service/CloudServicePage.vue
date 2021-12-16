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
                <p-toolbox filters-visible
                           exportable
                           search-type="query"
                           :page-size.sync="pageSize"
                           :total-count="totalCount"
                           :query-tags="tags"
                           :key-item-sets="keyItemSets"
                           :value-handler-map="valueHandlerMap"
                           @change="handleChange"
                           @refresh="handleChange()"
                           @export="handleExport"
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
    PBreadcrumbs, PDataLoader, PDivider, PIconTextButton,
    PLazyImg, PPageTitle, PToolbox,
} from '@spaceone/design-system';

import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import CloudServiceMenu from '@/services/inventory/cloud-service/modules/CloudServiceMenu.vue';

import {
    dynamicFieldsToExcelDataFields,
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-util/dynamic-layout';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import {
    arrayToQueryString, primitiveToQueryString, queryStringToArray,
    RouteQueryString,
} from '@/lib/router-query-string';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';

import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';
import { store } from '@/store';
import { ExcelDataField } from '@/store/modules/file/type';
import { ExcelPayload } from '@/store/modules/file/actions';
import { registerServiceStore } from '@/common/composables/register-service-store';
import { CloudServiceStoreState } from '@/services/inventory/cloud-service/store/type';
import cloudServiceStoreModule from '@/services/inventory/cloud-service/store';


export default {
    name: 'CloudServiceType',
    components: {
        PVerticalPageLayout,
        CloudServiceMenu,
        PLazyImg,
        PDivider,
        PIconTextButton,
        PPageTitle,
        PBreadcrumbs,
        PToolbox,
        PDataLoader,
    },
    setup(props, { root }) {
        registerServiceStore<CloudServiceStoreState>('cloudService', cloudServiceStoreModule);

        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
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

        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            favoriteItems: computed(() => store.getters['favorite/cloudServiceType/sortedItems']),
            //
            loading: true,
            selectedProvider: computed(() => store.state.service.cloudService.selectedProvider),
            selectedCategories: computed(() => store.state.service.cloudService.selectedCategories),
            selectedRegions: computed(() => store.state.service.cloudService.selectedRegions),
            //
            items: undefined as any,
            keyItemSets: handlers.keyItemSets,
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
            filters: computed<QueryStoreFilter[]>(() => {
                const filters: QueryStoreFilter[] = [];
                if (state.selectedProvider !== 'all') {
                    filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
                } if (state.selectedRegions.length) {
                    filters.push({ k: 'region_code', v: state.selectedRegions, o: '=' });
                }
                return filters;
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
            .setPageStart(1).setPageLimit(state.pageSize)
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
                cloudServiceApiQueryHelper.setFilters(state.filters).addFilter(...queryHelper.filters);
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

        /* excel */
        const cloudServiceResourcesApiQueryHelper = new ApiQueryHelper()
            .setPageLimit(0).setPageStart(1)
            .setSort('count', true);
        const getCloudServiceResources = async () => {
            try {
                cloudServiceResourcesApiQueryHelper
                    .setFilters(state.filters)
                    .addFilter(...queryHelper.filters);
                const { results } = await SpaceConnector.client.statistics.topic.cloudServiceResources(
                    {
                        labels: state.selectedCategories,
                        query: cloudServiceResourcesApiQueryHelper.data,
                    },
                );
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const getExcelFields = async (data): Promise<ExcelDataField[]> => {
            let schema: DynamicLayout;
            let excelField;
            if (data.resource_type === 'inventory.Server') {
                try {
                    schema = await SpaceConnector.client.addOns.pageSchema.get({
                        resource_type: 'inventory.Server',
                        schema: 'table',
                    });
                    if (schema.options) {
                        excelField = dynamicFieldsToExcelDataFields(schema.options.fields);
                    }
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            } else {
                try {
                    schema = await SpaceConnector.client.addOns.pageSchema.get({
                        resource_type: 'inventory.CloudService',
                        schema: 'table',
                        options: {
                            provider: data.provider,
                            cloud_service_group: data.cloud_service_group,
                            cloud_service_type: data.cloud_service_type,
                        },
                    });
                    if (schema.options) {
                        excelField = dynamicFieldsToExcelDataFields(schema.options.fields);
                    }
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }
            return excelField;
        };
        const excelApiQueryHelper = new ApiQueryHelper();
        const getExcelQuery = (data, field) => {
            excelApiQueryHelper
                .setFilters(state.filters)
                .addFilter({ k: 'provider', o: '=', v: data.provider })
                .addFilter({ k: 'cloud_service_group', o: '=', v: data.cloud_service_group })
                .addFilter({ k: 'cloud_service_type', o: '=', v: data.cloud_service_type })
                .addFilter(...queryHelper.filters);
            const fields = field;
            if (fields) {
                excelApiQueryHelper.setOnly(...fields.map(d => d.key));
            }
            return excelApiQueryHelper.data;
        };
        const getCloudServiceResourcesPayload = (): ExcelPayload => {
            const excelFields = [
                { key: 'provider', name: 'Provider', reference: { reference_key: 'provider', resource_type: 'identity.Provider' } },
                { key: 'cloud_service_type', name: 'Cloud Service Type' },
                { key: 'cloud_service_group', name: 'Cloud Service Group' },
                { key: 'count', name: 'Count' },
            ];
            excelApiQueryHelper.setFilters([]);
            return {
                url: '/statistics/topic/cloud-service-resources',
                param: {
                    query: excelApiQueryHelper.data,
                    labels: state.selectedCategories,
                },
                fields: excelFields,
                sheet_name: 'Summary',
                header_message: {
                    title: 'Summary',
                },
                file_name_prefix: FILE_NAME_PREFIX.cloudService,
            };
        };
        const getExcelPayloadList = async (): Promise<ExcelPayload[]> => {
            const excelPayloadList: ExcelPayload[] = [];
            const excelItems = await getCloudServiceResources();
            const excelFieldList: Array<ExcelDataField[]> = await Promise.all(excelItems.map(d => getExcelFields(d)));

            excelFieldList.forEach((excelField, idx) => {
                const provider = excelItems[idx].provider;
                const providerName = state.providers[provider]?.label || provider;
                let sheetName = `${idx}.${providerName}.${excelItems[idx].cloud_service_group}.${excelItems[idx].cloud_service_type}`;
                const headerMessage = {
                    title: `[${providerName}] ${excelItems[idx].cloud_service_group} ${excelItems[idx].cloud_service_type}`,
                };
                if (sheetName.length > 30) sheetName = sheetName.substr(0, 30);

                let excelApiUrl;
                if (excelItems[idx].resource_type === 'inventory.Server') {
                    excelApiUrl = '/inventory/server/list';
                } else {
                    excelApiUrl = '/inventory/cloud-service/list';
                }
                excelPayloadList.push({
                    url: excelApiUrl,
                    param: {
                        query: getExcelQuery(excelItems[idx], excelField),
                    },
                    fields: excelField,
                    sheet_name: sheetName,
                    header_message: headerMessage,
                });
            });
            return excelPayloadList;
        };
        const handleExport = async () => {
            try {
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);

                const cloudServiceResourcesPayload = getCloudServiceResourcesPayload();
                const excelPayloadList = await getExcelPayloadList();
                await store.dispatch('file/downloadExcel', [
                    cloudServiceResourcesPayload,
                    ...excelPayloadList,
                ]);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* event */
        const handleChange = async (options: any = {}) => {
            setApiQueryWithToolboxOptions(cloudServiceApiQueryHelper, options, { queryTags: true });
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

            // init provider // todo: array로 넘어오는 경우 있음
            let provider: RouteQueryString = currentQuery.provider;
            if (Array.isArray(provider)) provider = provider[0];
            if (!provider || !state.providers[provider]) provider = 'all';
            store.commit('service/cloudService/setSelectedProvider', provider);

            await listCloudServiceType();
        })();

        /* Watcher */
        watch([() => state.selectedProvider, () => state.selectedCategories, () => state.selectedRegions], async () => {
            const newQuery = {
                provider: primitiveToQueryString(state.selectedProvider),
                service: arrayToQueryString(state.selectedCategories),
                region: arrayToQueryString(state.selectedRegions),
            };
            const currentQuery = SpaceRouter.router.currentRoute.query;
            if (JSON.stringify(newQuery) !== JSON.stringify(currentQuery)) {
                await SpaceRouter.router.replace({ query: newQuery });
            }
            state.thisPage = 1;
            await listCloudServiceType();
        }, { immediate: false });


        return {
            ...toRefs(state),
            routeState,
            assetUrlConverter,
            getCloudServiceDetailLink,
            handleChange,
            handleExport,
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
