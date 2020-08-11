<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div v-for="provider in providerState.items">
                <img v-if="provider.icon"
                     width="32px" height="32px"
                     :src="provider.icon"
                     :alt="provider.provider"
                >
                <p-i v-else name="ic_provider_other"
                     width="32px"
                     height="32px"
                />
                <span>{{ provider.name }}</span>
                <p-radio v-model="selectProvider" :value="provider.provider" />
            </div>

            <p class="region-list">
                Region
            </p>
            <div v-for="(region, idx) in filterState.regionList" :key="idx"
                 class="filter"
            >
                <p-check-box :selected="filterState.selectedRegionIdx" :value="idx"
                             @change="onClickRegion(idx, region)"
                />
                <span>[{{ region.region_type }}] {{ region.name }} <br>
                    / {{ region.region_code }} </span>
            </div>
            <p class="service-category">
                Service Categories
            </p>
            <div v-for="(checked, service) in filterState.serviceCategories" :key="service"
                 class="filter" :class="{selected: checked}"
            >
                <p-check-box :selected="filterState.serviceCategories[service]" :value="true"
                             @change="onClickService(service)"
                />
                {{ service }}
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="route" />
            </div>
            <p-page-title :title="selectProvider" use-total-count :total-count="apiHandler.totalCount.value"
                          class="pagetitle"
            />
            <div class="cloud-services">
                <p-toolbox-grid-layout
                    v-bind="apiHandler.gridTS.state"
                    :this-page.sync="apiHandler.gridTS.syncState.thisPage"
                    :page-size.sync="apiHandler.gridTS.syncState.pageSize"
                    :loading.sync="apiHandler.gridTS.syncState.loading"
                    @changePageNumber="apiHandler.getData()"
                    @changePageSize="apiHandler.getData()"
                    @clickRefresh="apiHandler.getData()"
                    @clickExcel="exportToolSet.getData()"
                >
                    <template slot="toolbox-bottom">
                        <div class="mb-6 search">
                            <p-query-search v-model="apiHandler.gridTS.querySearch.state.searchText"
                                            :key-items="apiHandler.gridTS.querySearch.state.keyItems"
                                            :value-handler-map="apiHandler.gridTS.querySearch.valueHandlerMap"
                                            @search="apiHandler.gridTS.querySearch.onSearch"
                            />
                        </div>
                        <div v-if="apiHandler.gridTS.querySearch.tags.value.length !== 0" class="cst-toolbox-bottom">
                            <p-query-search-tags
                                :tags="apiHandler.gridTS.querySearch.tags.value"
                                @delete:tag="apiHandler.gridTS.querySearch.deleteTag"
                                @delete:all="apiHandler.gridTS.querySearch.deleteAllTags"
                            />
                        </div>
                    </template>
                    <template #no-data>
                        <div v-if="!apiHandler.gridTS.state.items || apiHandler.gridTS.state.items.length === 0" class="text-center empty-project">
                            <img class="empty-project-img" src="@/assets/images/illust_satellite.svg">
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
                </p-toolbox-grid-layout>
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
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
import { StatQuerySearchGridFluentAPI } from '@/lib/api/grid';
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
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
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

export default {
    name: 'CloudServiceType',
    components: {
        PRadio,
        PIconTextButton,
        PVerticalPageLayout,
        PQuerySearchTags,
        PQuerySearch,
        PI,
        PLottie,
        PToolboxGridLayout,
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

        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Cloud Service', path: '/inventory/cloud-service' }],
        });

        const listAction = fluentApi.statisticsTest().topic().cloudServiceType()
            .setStart(1)
            .setLimit(24)
            .showAll(true);

        const apiHandler = new StatQuerySearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['card-item', 'cst-card-item'],
                cardMinWidth: '28rem',
                cardHeight: '6rem',
                excelVisible: false,
            },
            undefined,
            makeQuerySearchHandlersWithSearchSchema(
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
            ),
        );

        const listCloudServiceFilteredByServices = async (filter) => {
            if (filter.length > 0) {
                apiHandler.action = listAction.setFixFilter({
                    key: 'labels', operator: FILTER_OPERATOR.in, value: filterState.serviceFilter,
                });
                await apiHandler.getData();
            }
            if (filter.length === 0) {
                apiHandler.action = listAction.setFixFilter();
                await apiHandler.getData();
            }
        };

        const listRegion = async (selectedProvider) => {
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

        const listFilteredRegion = async (filter) => {
            if (filter.length > 0) {
                apiHandler.action = listAction.setFixFilter({
                    key: 'data.region_name', operator: FILTER_OPERATOR.in, value: filterState.regionFilter,
                });
                await apiHandler.getData();
            }
            if (filter.length === 0) {
                apiHandler.action = listAction.setFixFilter();
                await apiHandler.getData();
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
            await listCloudServiceFilteredByServices(filterState.serviceFilter);
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
            await listFilteredRegion(filterState.regionFilter);
        };

        const dataSource = [
            { name: 'provider', key: 'provider' },
            { name: 'group', key: 'group' },
            { name: 'name', key: 'name' },
        ];
        const exportAction = fluentApi.addons().excel().export().setDataSource(dataSource);
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);

        const getToCloudService = (item) => {
            const filters: QueryTag[] = [];
            apiHandler.gridTS.querySearch.tags.value.forEach((tag) => {
                if (tag.key) {
                    if (tag.key.name === 'project_id') filters.push(tag);
                    else if (tag.key.name === 'data.region_name') filters.push(tag);
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
                    f: queryTagsToQueryString(filters),
                },
            };
            return res;
        };

        /** Query String */
        const queryRefs = {
            f: makeQueryStringComputed(apiHandler.gridTS.querySearch.tags,
                {
                    key: 'f',
                    setter: queryTagsToOriginal,
                    getter: queryTagsToQueryString,
                }),
            provider: makeQueryStringComputed(selectProvider, { key: 'provider', disableAutoReplace: true }),
            ...makeQueryStringComputeds(apiHandler.gridTS.syncState, {
                pageSize: { key: 'g_ps', setter: Number },
                thisPage: { key: 'g_p', setter: Number },
            }),
        };

        const init = async () => {
            if (providerState.items.length > 0) {
                // set selected provider
                const res = queryRefs.provider.value;
                selectProvider.value = res || providerState.items[0].provider;
                watch(selectProvider, _.debounce(async (after) => {
                    if (!after) return;
                    if (after === 'all') {
                        await listRegion(after);
                        apiHandler.action = listAction.setFixFilter();
                    } else {
                        await listRegion(after);
                        apiHandler.action = listAction.setFixFilter(
                            { key: 'provider', operator: '=', value: after },
                        );
                    }
                    await apiHandler.getData();
                    await replaceQuery('provider', after);
                }, 50));
            }
        };

        init();

        return {
            filterState,
            listRegion,
            onClickService,
            onClickRegion,
            ...toRefs(routeState),
            selectProvider,
            apiHandler,
            providerStore,
            providerState,
            exportToolSet,
            getToCloudService,
            skeletons: _.range(5),
        };
    },

};

</script>

<style lang="postcss" scoped>
    .cst-toolbox-bottom {
        @apply flex flex-col-reverse items-start justify-between w-full;

        @screen lg {
            @apply flex-row items-center;
        }
        .search-bar {
            @apply flex-1;

            @screen lg {
                @apply max-w-1/2;
            }
        }
        .checkbox {
            @apply whitespace-no-wrap;
        }
    }
    .provider-list {
        @apply w-full px-4 pt-6;
    }
    >>> .provider-card-item {
        @apply px-4 py-3 flex items-center justify-between bg-transparent;

        .left {
            @apply flex items-center;
            .title {
                @apply ml-4;
            }
        }
        .right {
            .total-count {
                @apply w-10 flex h-6 ml-2 justify-center items-center text-white;
                border-radius: 6.25rem;
                border-width: 0.0625rem;
            }
        }
        &.selected {
            @apply border-secondary bg-blue-200 text-secondary;
            .left {
                .title {
                    @apply text-secondary;
                }
            }
        }
    }

    >>> .cst-card-item {
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
        .right {
            @apply inline-flex items-center;
            .total-count {
                @apply font-bold text-2xl;
            }
        }
        &:hover {
            @apply border-gray-200 bg-blue-100;
            cursor: pointer;
        }
    }
    .pagetitle {
        margin-bottom: 0;
    }

    .empty-project {
        .empty-project-img {
            @apply w-48 mx-auto pt-19 mb-8;
        }
    }
</style>
