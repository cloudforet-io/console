<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <p class="sidebar-title">
                Service Providers
            </p>
            <p-hr class="sidebar-divider" />
            <div v-for="provider in providerState.items" :key="provider.provider" class="provider-list">
                <p-hr v-if="provider.provider && provider.provider !== 'all'" class="provider-divider" />
                <p-radio v-model="selectedProvider" :value="provider.provider">
                    <template #radio-left>
                        <img v-if="provider.icon"
                             :src="provider.icon"
                             :alt="provider.provider"
                             class="provider-icon"
                        >
                        <p-i v-else name="ic_provider_other"
                             class="provider-icon"
                        />
                        <span class="provider-name">{{ provider.label }}</span>
                    </template>
                    <template #icon="{ iconName }">
                        <p-i class="radio-icon float-right" width="1.25rem" height="1.25rem"
                             :name="iconName"
                        />
                    </template>
                </p-radio>
            </div>
            <p class="sidebar-title">
                Service Categories
            </p>
            <p-hr class="sidebar-divider" />
            <div v-for="(checked, service) in filterState.serviceCategories" :key="service"
                 :class="{selected: checked}"
                 class="service-categories"
            >
                <p-check-box :selected="filterState.serviceFilter" :value="service"
                             @change="onClickService(service, ...arguments)"
                >
                    <span class="service">{{ service }}</span>
                </p-check-box>
            </div>
            <p id="region-title">
                Regions
            </p>
            <p-hr class="sidebar-divider" />
            <div v-if="filterState.regionList.length === 0">
                <p class="no-region">
                    No Region
                </p>
            </div>
            <div v-for="(region, idx) in filterState.regionList" :key="idx"
                 :class="{selected: region}"
                 class="region-list"
            >
                <p-check-box :selected="filterState.regionFilter" :value="region.region_code"
                             @change="onClickRegion(region, ...arguments)"
                >
                    <span class="region-type">[{{ region.region_type }}] {{ region.name }} <br> </span>
                    <span class="region-code">{{ region.region_code }} </span>
                </p-check-box>
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="route" />
            </div>
            <p-page-title :title="selectedProviderName" use-total-count :total-count="totalCount"
                          class="page-title"
            />
            <p-hr class="cloud-service-divider" />
            <div class="cloud-services">
                <p-search-grid-layout
                    :items="items"
                    :card-class="cardClass"
                    :loading="loading"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    :total-count="totalCount"
                    :query-tags="tags"
                    :key-items="keyItems"
                    :value-handler-map="valueHandlerMap"
                    @change="onChange"
                    @refresh="onChange"
                >
                    <template #card="{item}">
                        <router-link :to="getToCloudService(item)">
                            <div class="left">
                                <p-lazy-img width="3rem" height="3rem"
                                            :src="item.icon || (providers[item.provider] ? providers[item.provider].icon : '')"
                                            error-icon="ic_provider_other"
                                            :alt="item.name"
                                />
                                <div class="text-content">
                                    <div class="title">
                                        {{ item.cloud_service_group }}
                                    </div>
                                    <div class="sub-title">
                                        <span class="sub-title-provider"> {{ item.provider }} </span>
                                        <span class="sub-title-divider">
                                            |
                                        </span>
                                        <span class="sub-title-name">{{ item.cloud_service_type }}</span>
                                        <span class="sub-title-count">
                                            {{ item.cloud_service_count }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                    </template>
                </p-search-grid-layout>
                <div v-if="!loading && !items && items.length === 0" class="text-center empty-cloud-service">
                    <img class="empty-cloud-service-img" src="@/assets/images/illust_satellite.svg">
                    <p class="text-primary2 mb-12">
                        We need your registration for monitoring cloud resources.
                    </p>
                    <router-link :to="`/identity/service-account/?provider=${selectedProvider}`">
                        <p-icon-text-button style-type="primary" name="ic_plus_bold"
                                            class="mx-auto text-center"
                        >
                            {{ $t('BTN.ADD_SERVICE_ACCOUNT') }}
                        </p-icon-text-button>
                    </router-link>
                </div>
                <div v-if="!loading && items.length > 0" class="pagination">
                    <p-pagination :total-count="totalCount"
                                  :this-page.sync="thisPage"
                                  :page-size.sync="pageSize"
                                  @prevPage="prevPage"
                                  @nextPage="nextPage"
                                  @clickPage="clickPage"
                    />
                </div>
            </div>
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, Ref, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import { zipObject, debounce, range } from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import {
    queryStringToQueryTags,
    queryTagsToQueryString,
    replaceQuery, RouteQueryString, queryStringToStringArray,
} from '@/lib/router-query-string';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { Location } from 'vue-router';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import {
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-utils/dynamic-layout';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';

import PSearchGridLayout from '@/components/organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import {
    getFiltersFromQueryTags,
} from '@/lib/component-utils/query-search-tags';
import PHr from '@/components/atoms/hr/PHr.vue';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { Filter } from '@/lib/space-connector/type';
import { KeyItem } from '@/components/organisms/search/query-search/type';
import axios, { CancelTokenSource } from 'axios';
import PPagination from '@/components/organisms/pagination/PPagination.vue';
import { getPageStart } from '@/lib/component-utils/pagination';
import { store } from '@/store';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import { Tags, TimeStamp } from '@/lib/fluent-api';

interface RegionModel extends Tags {
    region_id: string;
    state: string;
    name: string;
    created_at: TimeStamp;
    domain_id: string;
    deleted_at: TimeStamp;
    region_code: string;
    region_type: string;
    collection_info: object;
}

export default {
    name: 'CloudServiceType',
    components: {
        PLazyImg,
        PPagination,
        PHr,
        PSearchGridLayout,
        PRadio,
        PIconTextButton,
        PVerticalPageLayout,
        PI,
        PPageTitle,
        PPageNavigation,
        PCheckBox,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const selectedProvider: Ref<string> = ref('all');

        const providerState = reactive({
            items: computed(() => [
                {
                    provider: 'all', icon: '', color: '', label: 'All',
                },
                ...Object.keys(store.state.resource.provider.items).map(k => ({
                    provider: k,
                    ...store.state.resource.provider.items[k],
                })),
            ]),
        });
        const selectedProviderName = computed(() => store.state.resource.provider.items[selectedProvider.value]?.label || selectedProvider.value);
        const filterState = reactive({
            serviceCategories: zipObject([
                'Compute', 'Container', 'Database', 'Networking', 'Storage', 'Security', 'Analytics', 'Application Integration', 'Management',
            ], new Array(9).fill(false)),
            serviceFilter: [] as string[],
            regionList: [] as RegionModel[],
            selectedRegionIdx: [] as number[],
            regionFilter: [] as string[],
        });
        const handlers = makeQuerySearchPropsWithSearchSchema(
            {
                title: 'Properties',
                items: [
                    { key: 'cloud_service_type', name: 'Cloud Service Type' },
                    { key: 'cloud_service_group', name: 'Cloud Service Group' },
                    { key: 'project_id', name: 'Project', reference: 'identity.Project' },
                    { key: 'collection_info.service_accounts', name: 'Service Account', reference: 'identity.ServiceAccount' },
                    { key: 'collection_info.secrets', name: 'Secret', reference: 'secret.Secret' },
                ],
            },
            'inventory.CloudService',
        );

        const state = reactive({
            items: [] as any,
            providerName: 'All',
            cardClass: () => ['card-item', 'cloud-service-type-list'],
            loading: false,
            keyItems: handlers.keyItems as KeyItem[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryStringToQueryTags(vm.$route.query.filters, handlers.keyItems),
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
            providers: computed(() => store.state.resource.provider.items),
        });

        const getRegionQuery = (value) => {
            const regionQuery = new QueryHelper();
            regionQuery.setFilter({
                k: 'region_type',
                v: value,
                o: 'contain',
            });
            return regionQuery.data;
        };

        const listRegionByProvider = async (selectedProviderValue) => {
            try {
                if (selectedProviderValue === 'all') {
                    const res = await SpaceConnector.client.inventory.region.list();
                    filterState.regionList = res.results.map(d => ({ ...d }));
                } else if (selectedProviderValue) {
                    const res = await SpaceConnector.client.inventory.region.list({
                        query: getRegionQuery(selectedProviderValue),
                    });
                    filterState.regionList = res.results.map(d => ({ ...d }));
                }
            } catch (e) {
                console.error(e);
            }
        };
        const onClickService = async (region, res, isSelected) => {
            filterState.serviceFilter = res;
        };
        const onClickRegion = async (region, res, isSelected) => {
            filterState.regionFilter = res;
        };

        /**
         * Card click event
         * */
        const getToCloudService = (item) => {
            const filters: QueryTag[] = [];
            state.tags.forEach((tag: QueryTag) => {
                if (tag.key) {
                    if (tag.key.name === 'project_id') filters.push(tag);
                    if (tag.key.name === 'region_code') filters.push(tag);
                    if (tag.key.name === 'collection_info.service_accounts') filters.push(tag);
                }
            });
            const res: Location = {
                name: 'cloudServicePage',
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: item.cloud_service_type,
                },
                query: {
                    filters: queryTagsToQueryString(filters),
                },
            };
            return res;
        };

        const sidebarFilters = computed<{filters: Filter[]; labels: string[]}>(() => {
            const res = {
                filters: [] as Filter[],
                labels: [] as string[],
            };
            if (selectedProvider.value !== 'all') {
                res.filters.push({ k: 'provider', v: selectedProvider.value, o: 'eq' });
            }
            if (filterState.regionFilter.length > 0) {
                res.filters.push({ k: 'region_code', v: filterState.regionFilter, o: 'in' });
            }
            if (filterState.serviceFilter.length > 0) {
                res.labels = filterState.serviceFilter;
            }
            return res;
        });

        const getParams = (isTriggeredBySideFilter = false) => {
            const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(state.tags);

            const { filters, labels } = sidebarFilters.value;

            const query = new QueryHelper();
            query
                .setPageLimit(state.pageSize)
                .setKeyword(...keywords)
                .setFilterOr(...orFilters)
                .setFilter(...andFilters, ...filters);

            if (isTriggeredBySideFilter) state.thisPage = 1;
            else query.setPageStart(getPageStart(state.thisPage, state.pageSize));

            return {
                show_all: true,
                labels,
                query: query.data,
            };
        };

        // ajax request
        let listCloudServiceRequest: CancelTokenSource | undefined;
        const listCloudServiceType = async (isTriggeredBySideFilter = false) => {
            // if request is already exist, cancel the request
            if (listCloudServiceRequest) {
                listCloudServiceRequest.cancel('Next request has been called.');
                listCloudServiceRequest = undefined;
            }
            // create a new token for upcoming request (overwrite the previous one)
            listCloudServiceRequest = axios.CancelToken.source();
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceTypePage(
                    getParams(isTriggeredBySideFilter),
                    { cancelToken: listCloudServiceRequest.token },
                );
                state.items = res.results;
                state.totalCount = res.total_count || 0;
                state.loading = false;
                listCloudServiceRequest = undefined;
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) state.loading = false;
                else console.error(e);
            }
        };

        watch(() => sidebarFilters.value, async (after, before) => {
            if (after !== before) {
                // await listCloudServiceType(after);
                await listCloudServiceType(true);
                await replaceQuery('provider', selectedProvider.value);
                await replaceQuery('region', filterState.regionFilter);
                await replaceQuery('service', filterState.serviceFilter);
            }
        }, { immediate: false });

        const changeQueryString = async (options) => {
            await replaceQuery('filters', queryTagsToQueryString(options.queryTags));
        };

        const clickPage = async (page) => {
            state.thisPage = page;
            await listCloudServiceType();
        };

        const prevPage = async (page) => {
            state.thisPage = page - 1;
            if (state.thisPage <= 0) state.thisPage = 1;
            await listCloudServiceType();
        };

        const nextPage = async (page) => {
            state.thisPage = page + 1;
            await listCloudServiceType();
        };

        const onChange = async (options?: any) => {
            if (options) {
                state.tags = options.queryTags;
                state.pageSize = options.pageSize;
                state.thisPage = options.thisPage;
                await changeQueryString(options);
            }
            await listCloudServiceType();
        };

        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Cloud Service', path: '/inventory/cloud-service' }],
        });

        const checkProvider = async (queryStringForCheck) => {
            let providerQueryString = queryStringForCheck;
            const providerList = Object.keys(store.state.resource.provider.items);
            if (!providerList.includes(queryStringForCheck)) {
                providerQueryString = 'all';
            }
            return providerQueryString;
        };

        const initProvider = async () => {
            let queryString: RouteQueryString = vm.$route.query.provider;
            if (providerState.items.length > 0) {
                if (typeof queryString === 'undefined' || !queryString) queryString = 'all';
                if (typeof queryString === 'string') {
                    queryString = await checkProvider(queryString);
                }
            } else {
                queryString = 'all';
            }
            return queryString;
        };

        const init = async () => {
            await store.dispatch('resource/provider/load');
            const providerQueryString = await initProvider();
            if (providerQueryString) {
                selectedProvider.value = providerQueryString.toString();
                filterState.serviceFilter = queryStringToStringArray(vm.$route.query.service);
                filterState.regionFilter = queryStringToStringArray(vm.$route.query.region);
                watch<string, boolean>(() => selectedProvider.value, debounce((after) => {
                    if (!after) return;
                    if (after) {
                        listRegionByProvider(after);
                    }
                }, 50), { immediate: true });
                await listCloudServiceType();
            }
        };

        init();

        return {
            filterState,
            selectedProviderName,
            listRegionByProvider,
            onClickService,
            onClickRegion,
            ...toRefs(routeState),
            ...toRefs(state),
            selectedProvider,
            providerState,
            getToCloudService,
            skeletons: range(5),
            clickPage,
            prevPage,
            nextPage,
            onChange,
        };
    },

};

</script>

<style lang="postcss" scoped>
    .sidebar-title {
        @apply text-gray-500 text-sm font-bold;
        padding-top: 2rem;
        padding-left: 1rem;
    }
    #region-title {
        @apply text-gray-500 text-sm font-bold;
        padding-top: 1.375rem;
        padding-left: 1rem;
    }
    .sidebar-divider {
        @apply w-full;
        padding-left: 0;
        margin-top: 0.5625rem;
        margin-bottom: 1rem;
    }

    .provider-list {
        @apply justify-between text-sm;
        padding-left: 1rem;
        padding-right: 1.1875rem;
        line-height: 1.5rem;
        .provider-divider {
            @apply bg-gray-100;
            margin-top: 0.625rem;
            margin-bottom: 0.5625rem;
        }
        .provider-name {
            display: inline-block;
            cursor: pointer;
        }
        .provider-icon {
            @apply inline justify-start;
            width: 1.5rem;
            height: 1.5rem;
            cursor: pointer;
            margin-right: 0.5625rem;
        }
        .provider-radio-btn {
            @apply float-right;
        }
    }
    .no-region {
        @apply text-gray-400 text-sm;
        padding-left: 1rem;
    }
    .region-list {
        @apply text-sm;
        margin-left: 1rem;
        margin-bottom: 0.875rem;
        &:hover {
            @apply text-secondary cursor-pointer;
        }
        .region-type {
            padding-left: 0.25rem;
        }
        .region-code {
            @apply text-gray-400;
            padding-left: 1.5rem;
        }
    }
    .service-categories {
        @apply text-sm;
        margin-left: 1rem;
        padding-bottom: 0.625rem;
        .service {
            padding-left: 0.25rem;
            &:hover {
                @apply text-secondary cursor-pointer;
            }
        }
    }
    .cloud-service-divider {
        @apply w-full;
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
    }
    .cloud-services {
        >>> .cloud-service-type-list {
            @apply border border-gray-200 rounded overflow-visible;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

            a {
                @apply px-6 py-6 pb-5 bg-white flex flex-row justify-between items-center rounded overflow-hidden;

                &:hover {
                    @apply bg-blue-100;
                    cursor: pointer;
                }
            }

            .left {
                @apply inline-flex items-center;

                img {
                    @apply rounded-sm overflow-hidden;
                }

                .text-content {
                    @apply ml-4;

                    .title {
                        padding-bottom: 0.3rem;
                        font-size: 1rem;
                        line-height: 120%;
                    }

                    .sub-title {
                        @apply text-gray-500;
                        font-size: 0.875rem;
                        line-height: 150%;

                        .sub-title-provider {
                            @apply text-gray-300;
                        }

                        .sub-title-divider {
                            @apply text-gray-200;
                        }

                        .sub-title-name {
                            @apply text-gray-500;
                        }

                        .sub-title-count {
                            @apply font-bold text-base;
                            line-height: 150%;
                        }
                    }
                }
            }

            &:hover {
                @apply border-gray-200 bg-blue-100;
                cursor: pointer;
            }
        }
    }
    .page-title {
        margin-bottom: 0;
    }
    .empty-cloud-service {
        .empty-cloud-service-img {
            @apply w-48 mx-auto pt-19 mb-8;
        }
    }
    .pagination {
        text-align: center;
        padding-top: 1.5rem;
        bottom: 0;
    }
</style>
