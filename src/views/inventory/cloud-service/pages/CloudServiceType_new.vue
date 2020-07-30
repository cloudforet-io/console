<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <p-grid-layout
                class="provider-list"
                v-bind="providerListState.state"
                @card:click="selectProvider=$event.provider"
            >
                <template #card="{item}">
                    <div class="left">
                        <template>
                            <img v-if="item.icon"
                                 width="32px" height="32px"
                                 :src="item.icon"
                                 :alt="item.provider"
                            >
                            <p-i v-else name="ic_provider_other"
                                 width="32px"
                                 height="32px"
                            />
                        </template>
                        <div class="title">
                            {{ item.name }}
                        </div>
                    </div>
                    <div class="right">
                        <div
                            class="total-count"
                            :style="{'background-color': item.color||'#3C2C84','border-color': item.color||'#3C2C84'}"
                        >
                            {{ providerTotalCount[item.provider]||0 }}
                        </div>
                    </div>
                </template>
            </p-grid-layout>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="route" />
            </div>
            <p-page-title :title="selectProviderName" use-total-count :total-count="apiHandler.totalCount.value"
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
                    <!-- @card:click="clickCard"-->
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
                    <template #no-data>
                        <div v-if="apiHandler.gridTS.state.items.length === 0" class="text-center empty-project">
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
import { fluentApi } from '@/lib/fluent-api';
import { ProviderStoreType, useStore } from '@/store/toolset';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
import { StatQuerySearchGridFluentAPI } from '@/lib/api/grid';
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds,
    queryTagsToOriginal,
    queryTagsToQueryString,
    replaceQuery,
} from '@/lib/router-query-string';
import { GridLayoutState } from '@/components/molecules/layouts/grid-layout/PGridLayout.toolset';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { Location } from 'vue-router';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { makeKeyItems, makeValueHandlerMapWithReference } from '@/lib/component-utils/query-search';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';

export default {
    name: 'ServiceAccount',
    components: {
        PIconTextButton,
        PVerticalPageLayout,
        PQuerySearchTags,
        PQuerySearch,
        PI,
        PToolboxGridLayout,
        PGridLayout,
        PPageTitle,
        PSkeleton,
        PPageNavigation,
    },
    setup(props, context) {
        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;
        providerStore.getProvider();
        const providerTotalCount = ref<any>({ all: 0 });
        const cstCountName = 'cloud_service_type_count';
        const CountApi = fluentApi.statisticsTest().resource().stat()
            .setResourceType('identity.Provider')
            .addGroupKey('provider', 'provider')
            .setJoinResourceType('inventory.CloudServiceType')
            .setJoinKeys(['provider'])
            .addJoinGroupKey('provider', 'provider')
            .addJoinGroupField('cloud_service_type_count', STAT_OPERATORS.count);

        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;
        const selectProvider = ref('all');
        const providerListState = new GridLayoutState(
            {
                items: computed(() => {
                    const result = [{
                        provider: 'all', icon: '', color: '', name: 'All',
                    }];
                    if (providerStore.state.providers) {
                        result.push(...Object.entries(providerStore.state.providers).map(([key, value]) => ({ provider: key, ...value })));
                    }
                    return result;
                }),
                cardClass: (item) => {
                    const _class = ['provider-card-item', 'card-item'];
                    if (item.provider === selectProvider.value) {
                        _class.push('selected');
                    }
                    return _class;
                },
                cardMinWidth: '14.125rem',
                cardHeight: '3.5rem',
                columnGap: '0.5rem',
                rowGap: '0.5rem',
                fixColumn: 1,
            },
        );
        const selectProviderName = computed(() => _.find(providerListState.state.items, { provider: selectProvider.value }).name);
        const totalResourceCountName = 'cloud_service_count';
        const newResourceCountName = 'yesterday_cloud_service_count';

        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Cloud Service', path: '/inventory/cloud-service' }],
        });

        const listAction = fluentApi.statisticsTest().topic().cloudServiceType()
            .setStart(1)
            .setLimit(24)
            .showAll(true);

        const statData = ref<null|any>(null);

        const args = {
            keys: ['cloud_service_type', 'cloud_service_group', 'provider', 'cloud_service_id', 'project_id', 'data.region_name'],
        };

        const apiHandler = new StatQuerySearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['card-item', 'cst-card-item'],
                cardMinWidth: '28rem',
                cardHeight: '6rem',
                excelVisible: false,
            },
            undefined,
            {
                keyItems: makeKeyItems(args.keys),
                valueHandlerMap: {
                    ...makeValueHandlerMapWithReference(args.keys, 'inventory.CloudService'),
                },
            },
        );

        const clickCard = (item) => {
            vm.$router.push({
                name: 'cloudServicePage',
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: item.cloud_service_type,
                },
            });
        };

        const dataSource = [
            { name: 'provider', key: 'provider' },
            { name: 'group', key: 'group' },
            { name: 'name', key: 'name' },
        ];
        const exportAction = fluentApi.addons().excel().export().setDataSource(dataSource);
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);


        const requestProvider = async () => {
            const resp = await CountApi.execute();
            let total = 0;
            const data: any = { };
            resp.data.results.forEach((item) => {
                const count = item[cstCountName];
                total += count;
                data[item.provider] = count;
            });
            data.all = total;
            providerTotalCount.value = data;
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

        // const onSearch = (e) => { queryRefs.t_se.value = e || undefined; };

        /** Init */
        const init = async () => {
            await requestProvider();

            if (providerListState.state.items.length > 0) {
                // set selected provider
                const res = queryRefs.provider.value;
                selectProvider.value = res || providerListState.state.items[0].provider;

                watch(selectProvider, _.debounce(async (after) => {
                    if (!after) return;
                    if (after === 'all') apiHandler.action = listAction.setFixFilter();
                    else {
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

        return {
            ...toRefs(routeState),
            selectProvider,
            selectProviderName,
            apiHandler,
            clickCard,
            providerStore,
            statData,
            providerListState,
            providerTotalCount,
            exportToolSet,
            newResourceCountName,
            totalResourceCountName,
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
