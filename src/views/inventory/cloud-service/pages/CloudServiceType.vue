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
                <p-radio v-model="selectProvider" :value="provider.provider" class="provider-radio-btn" />
            </div>
            <p class="sidebar-title">
                Region
            </p>
            <p-hr class="sidebar-divider" />
            <div v-for="(region, idx) in filterState.regionList" :key="idx"
                 class="region-list"
            >
                <p-check-box :selected="filterState.selectedRegionIdx" :value="idx"
                             @change="onClickRegion(idx, region)"
                />
                <span class="region-type">[{{ region.region_type }}] {{ region.name }} <br> </span>
                <span class="region-code">/ {{ region.region_code }} </span>
            </div>
            <div id="service-category-title">Service Categories</div>
            <p-hr class="sidebar-divider" />
            <div v-for="(checked, service) in filterState.serviceCategories" :key="service"
                 class="service-categories" :class="{selected: checked}"
            >
                <p-check-box :selected="filterState.serviceCategories[service]" :value="true"
                             @change="onClickService(service)"
                />
                <span class="service">{{ service }}</span>
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="route" />
            </div>
            <p-page-title :title="selectProvider.toUpperCase()" use-total-count :total-count="totalCount"
                          class="page-title"
            />
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
                >
                    <template #no-data>
                        <div v-if="!items || items.length === 0" class="text-center empty-cloud-service">
                            <img class="empty-cloud-service-img" src="@/assets/images/illust_satellite.svg">
                            <p class="text-primary2 mb-12">
                                We need your registration for monitoring cloud resources.
                            </p>
                            <router-link :to="`/identity/service-account/?provider=${selectProvider}`">
                                <p-icon-text-button style-type="primary" name="ic_plus_bold"
                                                    class="mx-auto text-center"
                                >
                                    {{ $t('BTN.ADD_SERVICE_ACCOUNT') }}
                                </p-icon-text-button>
                            </router-link>
                        </div>
                    </template>
                    <template #loading>
                        <p-lottie name="spinner" :size="2"
                                  :auto="true"
                        />
                    </template>
                    <template #card="{item}">
                        <router-link :to="getToCloudService(item)">
                            <div class="left">
                                <div class="w-12 h-12">
                                    <img v-if="item.icon"
                                         width="48px" height="48px"
                                         :src="item.icon"
                                         :alt="item.name"
                                    >
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
            </div>
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { ProviderStoreType, useStore } from '@/store/toolset';
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds,
    queryTagsToOriginal,
    queryTagsToQueryString,
    replaceQuery,
} from '@/lib/router-query-string';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { Location } from 'vue-router';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import {
    makeQuerySearchHandlersWithSearchSchema,
} from '@/lib/component-utils/query-search';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import Region, { RegionModel } from '@/lib/fluent-api/inventory/region';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';

import PSearchGridLayout from '@/components/organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import { parseTag } from '@/lib/api/query-search';
import router from '@/routes';
import PHr from '@/components/atoms/hr/PHr.vue';

export type UrlQueryString = string | (string | null)[] | null | undefined;

export default {
    name: 'CloudServiceType',
    components: {
        PHr,
        PSearchGridLayout,
        PRadio,
        PIconTextButton,
        PVerticalPageLayout,
        PI,
        PLottie,
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
        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;

        const selectProvider = ref('all');
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

        const filterState = reactive({
            serviceCategories: _.zipObject([
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
                    { key: 'data.region_name', name: 'Region' },
                ],
            },
            'inventory.CloudService',
        );

        const state = reactive({
            items: [] as any,
            cardClass: () => ['card-item', 'cloud-service-type-list'],
            loading: false,
            keyItems: handlers.keyItems,
            valueHandlerMap: handlers.valueHandlerMap,
            tags: [] as any,
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
        });

        const listRegionByProvider = async (selectedProvider) => {
            try {
                if (selectedProvider === 'all') {
                    const res = await fluentApi.inventory().region().list()
                        .execute();
                    filterState.regionList = res.data.results.map(d => ({ ...d }));
                } else if (selectedProvider) {
                    const res = await fluentApi.inventory().region().list().setFixFilter({
                        key: 'region_type',
                        value: selectedProvider,
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
            state.tags.forEach((tag) => {
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
            state.tags = urlQueryStringToSearchTags(vm.$route.query.f);
        };
        const queryRefs = {
            f: makeQueryStringComputed(state.tags,
                {
                    key: 'f',
                    setter: queryTagsToOriginal,
                    getter: queryTagsToQueryString,
                }),
            provider: makeQueryStringComputed(selectProvider, { key: 'provider', disableAutoReplace: true }),
            ...makeQueryStringComputeds(state, {
                pageSize: { key: 'g_ps', setter: Number },
                thisPage: { key: 'g_p', setter: Number },
            }),
        };

        const onChange = async (options) => {
            state.tags = options.queryTags;
            const urlQueryString = searchTagsToUrlQueryString(options.queryTags);
            // eslint-disable-next-line no-empty-function
            await vm.$router.replace({ query: { ...router.currentRoute.query, f: urlQueryString } }).catch(() => {});
            state.pageSize = options.pageSize;
            state.thisPage = options.thisPage;
        };

        const filters = computed(() => [
            { key: 'provider', operator: '=', value: selectProvider.value },
            { key: 'data.region_name', operator: '=', value: filterState.regionFilter },
            { key: 'labels', operator: FILTER_OPERATOR.in, value: filterState.serviceFilter },
            state.thisPage,
            state.pageSize,
            state.tags,
        ]);

        const handleNullValuesForFilter = (value) => {
            if (value[0].value === 'all') value[0].value = '';
            if (value[1].value.length === 0) value[1].value = [''];
            if (value[2].value.length === 0) value[2].value = '';
            return value;
        };

        watch(() => filters.value, async (after, before) => {
            if (after !== before) {
                state.loading = true;
                handleNullValuesForFilter(after);
                const [providerFilter, region, label, pageStart, pageSize] = [after[0].value, after[1].value, after[2].value, after[3], after[4]];
                try {
                    const res = await fluentApi.statisticsTest().topic().cloudServiceType()
                        .setStart(((pageStart - 1) * pageSize) + 1)
                        .setLimit(pageSize)
                        .setFilter(
                            { key: 'provider', operator: FILTER_OPERATOR.contain, value: providerFilter },
                            { key: 'data.region_name', operator: FILTER_OPERATOR.contain, value: region },
                            ...state.tags.map(v => ({ key: v.key.name, value: v.value.name, operator: FILTER_OPERATOR.in })),
                        )
                        .setLabels(label)
                        .showAll(true)
                        .execute();
                    state.items = res.data.results;
                    state.totalCount = res.data.total_count || 0;
                    state.loading = false;
                } catch (e) {
                    console.error(e);
                }
            }
        });

        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Cloud Service', path: '/inventory/cloud-service' }],
        });

        const init = async () => {
            if (providerState.items.length > 0) {
                // set selected provider
                const res = queryRefs.provider.value;
                selectProvider.value = res || providerState.items[0].provider;
                await setSearchTags();
                watch(selectProvider, _.debounce(async (after) => {
                    if (!after) return;
                    if (after === 'all') {
                        await listRegionByProvider(after);
                    } else {
                        await listRegionByProvider(after);
                    }
                    await replaceQuery('provider', after);
                }, 50));
            }
        };

        init();

        return {
            filterState,
            // filters,
            listRegionByProvider,
            onClickService,
            onClickRegion,
            ...toRefs(routeState),
            ...toRefs(state),
            selectProvider,
            providerStore,
            providerState,
            getToCloudService,
            skeletons: _.range(5),
            onChange,
        };
    },

};

</script>

<style lang="postcss" scoped>
    .sidebar-title {
        @apply text-gray-500 text-sm font-bold;
        padding-top: 2.25rem;
        padding-left: 1rem;
    }
    #service-category-title {
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
        .provider-divider {
            @apply bg-gray-100;
            margin-top: 0.625rem;
            margin-bottom: 0.5625rem;
        }
        .provider-icon {
            @apply inline justify-start;
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.5625rem;
        }
        .provider-name {
            /*&:hover {*/
            /*    @apply text-secondary;*/
            /*}*/
        }
        .provider-radio-btn {
            @apply float-right;
        }
    }
    .region-list {
        @apply text-sm;
        margin-left: 1rem;
        margin-bottom: 0.875rem;
        .region-type {
            padding-left: 0.75rem;
        }
        .region-code {
            @apply text-gray-400;
            padding-left: 2rem;
        }
    }

    .service-categories {
        @apply text-sm;
        margin-left: 1rem;
        padding-bottom: 0.625rem;
        .service {
            padding-left: 0.75rem;
        }
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
                        @apply px-2 text-gray-200;
                    }
                    .sub-title-name {
                        @apply text-gray-500;
                    }
                    .sub-title-count {
                        @apply ml-2 font-bold text-base;
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
</style>
