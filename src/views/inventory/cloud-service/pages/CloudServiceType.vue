<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <p class="sidebar-title">
                Service Providers
            </p>
            <p-hr class="sidebar-divider" />
            <div v-for="provider in providerState.items" :key="provider.provider" class="provider-list">
                <p-hr v-if="provider.provider && provider.provider !== 'all'" class="provider-divider" />
                <img v-if="provider.icon"
                     :src="provider.icon"
                     :alt="provider.provider"
                     class="provider-icon"
                >
                <p-i v-else name="ic_provider_other"
                     class="provider-icon"
                />
                <span class="provider-name">{{ provider.name }}</span>
                <p-radio v-model="selectedProvider" :value="provider.provider" class="provider-radio-btn" />
            </div>
            <p class="sidebar-title">
                Service Categories
            </p>
            <p-hr class="sidebar-divider" />
            <div v-for="(checked, service) in filterState.serviceCategories" :key="service"
                 :class="{selected: checked}"
                 class="service-categories" @click.stop="onClickService(service)"
            >
                <p-check-box :selected="filterState.serviceCategories[service]" :value="true"
                             @change="onClickService(service)"
                />
                <span class="service">{{ service }}</span>
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
                 class="region-list" @click.stop="onClickRegion(idx, region)"
            >
                <p-check-box :selected="filterState.selectedRegionIdx" :value="idx"
                             @change="onClickRegion(idx, region)"
                />
                <span class="region-type">[{{ region.region_type }}] {{ region.name }} <br> </span>
                <span class="region-code">{{ region.region_code }} </span>
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
                                <div class="w-12 h-12">
                                    <img v-if="item.icon"
                                         width="48px" height="48px"
                                         :src="item.icon"
                                         :alt="item.name"
                                    >
                                    <p-i v-else-if="providerStore.state.providers[item.provider] && item.icon === 0" name="ic_provider_other" width="48px"
                                         height="48px"
                                    />
                                    <img v-else-if="providerStore.state.providers[item.provider]"
                                         width="48px" height="48px"
                                         :src="providerStore.state.providers[item.provider].icon"
                                         :alt="item.provider"
                                    >
                                    <p-i v-else name="ic_provider_other" width="48px"
                                         height="48px"
                                    />
                                </div>
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
                <div v-if="!loading && items.length === 0" class="text-center empty-cloud-service">
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
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { ProviderStoreType, useStore } from '@/store/toolset';
import { zipObject, debounce, range } from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import {
    makeQueryStringComputed,
    queryStringToQueryTags,
    queryTagsToQueryString,
    replaceQuery,
} from '@/lib/router-query-string';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { Location } from 'vue-router';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import {
    makeQuerySearchHandlersWithSearchSchema,
} from '@/lib/component-utils/query-search';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { RegionModel } from '@/lib/fluent-api/inventory/region';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';

import PSearchGridLayout from '@/components/organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import {
    getFiltersFromQueryTags,
    parseTag,
} from '@/lib/api/query-search';
import router from '@/routes';
import PHr from '@/components/atoms/hr/PHr.vue';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { Filter } from '@/lib/space-connector/type';
import { KeyItem } from '@/components/organisms/search/query-search/type';
import axios, { AxiosRequestConfig, CancelToken, CancelTokenSource } from 'axios';
import { APIError } from '@/lib/space-connector/api';
import PPagination from '@/components/organisms/pagination/PPagination.vue';
import { getPageStart } from '@/lib/component-utils/pagination';

export type UrlQueryString = string | (string | null)[] | null | undefined;


export default {
    name: 'CloudServiceType',
    components: {
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
        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;
        providerStore.getProvider();
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const selectedProvider: Ref<string> = ref('all');

        const providerState = reactive({
            items: computed(() => {
                const result = [{
                    provider: 'all', icon: '', color: '', name: 'All',
                }];
                if (providerStore.state.providers) {
                    result.push(...Object.entries(providerStore.state.providers).map(([key, value]) => ({ provider: key, ...value })));
                }
                return result;
            }),
        });
        const selectedProviderName = computed(() => {
            let name = '';
            providerState.items.forEach((d) => {
                if (d.provider === selectedProvider.value) {
                    name = d.name;
                }
            });
            return name;
        });
        const filterState = reactive({
            serviceCategories: zipObject([
                'Compute', 'Container', 'Database', 'Networking', 'Storage', 'Security', 'Analytics', 'Application Integration', 'Management',
            ], new Array(9).fill(false)),
            serviceFilter: [] as string[],
            regionList: [] as RegionModel[],
            selectedRegionIdx: [] as number[],
            regionFilter: [] as string[],
        });
        const handlers = makeQuerySearchHandlersWithSearchSchema(
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
            tags: [],
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
        });

        const listRegionByProvider = async (selectedProviderValue) => {
            try {
                if (selectedProviderValue === 'all') {
                    const res = await fluentApi.inventory().region().list()
                        .execute();
                    filterState.regionList = res.data.results.map(d => ({ ...d }));
                } else if (selectedProviderValue) {
                    const res = await fluentApi.inventory().region().list().setFixFilter({
                        key: 'region_type',
                        value: selectedProviderValue,
                        operator: FILTER_OPERATOR.contain,
                    })
                        .execute();
                    filterState.regionList = res.data.results.map(d => ({ ...d }));
                }
            } catch (e) {
                console.error(e);
            }
        };
        const onClickService = async (val) => {
            filterState.serviceCategories[val] = !filterState.serviceCategories[val];
            if (filterState.serviceFilter.includes(val)) {
                const idx = filterState.serviceFilter.indexOf(val);
                if (idx > -1) {
                    filterState.serviceFilter.splice(idx, 1);
                }
            } else if (!filterState.serviceFilter.includes(val)) filterState.serviceFilter.push(val);
        };
        const onClickRegion = async (val, region) => {
            if (filterState.selectedRegionIdx.includes(val)) {
                const idx = filterState.selectedRegionIdx.indexOf(val);
                if (idx > -1) {
                    filterState.selectedRegionIdx.splice(idx, 1);
                    filterState.regionFilter.splice(idx, 1);
                }
            } else if (!filterState.selectedRegionIdx.includes(val)) {
                filterState.selectedRegionIdx.push(val);
                filterState.regionFilter.push(region.region_code);
            }
        };

        /**
         * Card click event
         * */
        const getToCloudService = (item) => {
            const filters: QueryTag[] = [];
            state.tags.forEach((tag: QueryTag) => {
                if (tag.key) {
                    if (tag.key.name === 'project_id') filters.push(tag);
                }
            });
            filterState.regionFilter.forEach((d) => {
                filters.push({ key: { name: 'data.region_name', label: 'region' }, value: { name: d, label: d }, operator: FILTER_OPERATOR.in });
            });
            const res: Location = {
                name: 'cloudServicePage',
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: item.cloud_service_type,
                },
                query: {
                    f: queryTagsToQueryString(filters),
                },
            };
            return res;
        };

        const searchTagsToUrlQueryString = (tags: QueryTag[]): UrlQueryString => {
            if (Array.isArray(tags)) {
                return tags.map((tag) => {
                    let item;
                    if (tag.key) item = `${tag.key.name}:${tag.operator}${tag.value?.name}`;
                    else item = `${tag.value?.name}`;
                    return item;
                });
            }
            return null;
        };

        const urlQueryStringToSearchTags = (urlQueryString: UrlQueryString): QueryTag[] => {
            if (!urlQueryString) return [];
            if (Array.isArray(urlQueryString)) {
                return urlQueryString.reduce((res, qs) => {
                    if (qs) res.push(parseTag(qs));
                    return res;
                }, [] as QueryTag[]);
            }
            return [parseTag(urlQueryString as string)];
        };
        const setSearchTags = () => {
            // @ts-ignore
            state.tags = urlQueryStringToSearchTags(vm.$route.query.f);
        };
        const queryRefs = {
            // @ts-ignore
            f: makeQueryStringComputed(state.tags,
                {
                    key: 'f',
                    setter: queryStringToQueryTags,
                    getter: queryTagsToQueryString,
                }),
            provider: makeQueryStringComputed(selectedProvider, { key: 'provider', disableAutoReplace: true }),
            // ...makeQueryStringComputeds(state, {
            //     pageSize: { key: 'g_ps', setter: Number },
            //     thisPage: { key: 'g_p', setter: Number },
            // }),
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
                res.filters.push({ k: 'data.region_name', v: filterState.regionFilter, o: 'in' });
            }
            if (filterState.serviceFilter.length > 0) {
                res.labels = filterState.serviceFilter;
            }
            return res;
        });

        const getParams = (isTriggeredBySideFilter = false) => {
            const { and, or } = getFiltersFromQueryTags(state.tags);

            const { filters, labels } = sidebarFilters.value;

            const query = new QueryHelper();
            query
                .setPageLimit(state.pageSize)
                .setKeyword(...or)
                .setFilter(...and, ...filters);
            if (!isTriggeredBySideFilter) {
                query.setPageStart(getPageStart(state.thisPage, state.pageSize));
            }

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
            }
        }, { immediate: false });

        const changeQueryString = async (options) => {
            const urlQueryString = searchTagsToUrlQueryString(options.queryTags);
            const newQuery = {
                // g_ps: Number(options.pageSize),
                // g_p: Number(options.thisPage),
                f: urlQueryString,
            };
                // eslint-disable-next-line no-empty-function
            await vm.$router.replace({ query: { ...router.currentRoute.query, ...newQuery } }).catch(() => {
            });
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

        const init = async () => {
            if (providerState.items.length > 0) {
                // set selected provider
                const res = queryRefs.provider.value;
                selectedProvider.value = res || providerState.items[0].provider;
                setSearchTags();
                watch<string, boolean>(selectedProvider, debounce(async (after) => {
                    if (!after) return;
                    if (after) {
                        await listRegionByProvider(after);
                    }
                    await replaceQuery('provider', after);
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
            providerStore,
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
        }
        .provider-icon {
            @apply inline justify-start;
            width: 1.5rem;
            height: 1.5rem;
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
