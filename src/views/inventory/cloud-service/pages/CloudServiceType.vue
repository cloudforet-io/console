<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
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
                            {{ providerTotalCount[item.provider] }}
                        </div>
                    </div>
                </template>
            </p-grid-layout>
        </template>
        <template #default>
            <PToolboxGridLayout
                v-bind="apiHandler.gridTS.state"
                :this-page.sync="apiHandler.gridTS.syncState.thisPage"
                :page-size.sync="apiHandler.gridTS.syncState.pageSize"
                @changePageNumber="apiHandler.getData()"
                @changePageSize="apiHandler.getData()"
                @clickRefresh="apiHandler.getData()"
                @card:click="clickCard"
                @clickExcel="exportToolSet.getData()"
            >
                <template #toolbox-top>
                    <div class="cst-toolbox-top">
                        <div style="user-select: none">
                            <PCheckBox :value="false" :disabled="true" />  search all resource
                        </div>
                    </div>
                </template>
                <template #toolbox-left>
                    <p-query-search-bar
                        :search-text.sync="apiHandler.gridTS.querySearch.state.searchText"
                        :autocomplete-handler="apiHandler.gridTS.querySearch.acHandler.value"
                        @newQuery="apiHandler.gridTS.querySearch.addTag"
                    />
                </template>
                <template v-if="apiHandler.gridTS.querySearch.tags.value.length !== 0" slot="toolbox-bottom">
                    <p-hr style="width: 100%;" />
                    <p-query-search-tags
                        class="py-2"
                        :tags="apiHandler.gridTS.querySearch.tags.value"
                        @deleteTag="apiHandler.gridTS.querySearch.deleteTag"
                        @deleteAllTags="apiHandler.gridTS.querySearch.deleteAllTags"
                    />
                </template>
                <template #card="{item}">
                    <div class="top">
                        <div class="text-content">
                            <div class="sub-title">
                                {{ item.provider }} / {{ item.group }}
                            </div>
                            <div class="title">
                                {{ item.name }}
                            </div>
                        </div>
                        <div class="side-content">
                            <img v-if="item.tags.icon"
                                 width="48px" height="48px"
                                 :src="item.tags.icon"
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
                    </div>
                    <div class="bottom">
                        <div class="total-count">
                            {{ item.cloud_service_count }}
                        </div>
                        <div v-if="todayCreated[item.cloud_service_type_id]" class="today-created">
                            <p-i name="ic_list_increase" width="12px" height="12px" />
                            <div class="number">
                                {{ todayCreated[item.cloud_service_type_id] }}
                            </div>
                        </div>
                    </div>
                </template>
            </PToolboxGridLayout>
        </template>
    </p-vertical-page-layout2>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { fluentApi } from '@/lib/fluent-api';
import { ProviderStoreType, useStore } from '@/store/toolset';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { QuerySearchGridFluentAPI } from '@/lib/api/grid';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import PHr from '@/components/atoms/hr/Hr.vue';
import { AxiosResponse } from 'axios';
import { CloudServiceTypeListResp } from '@/lib/fluent-api/inventory/cloud-service-type';
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import { GridLayoutState } from '@/components/molecules/layouts/grid-layout/toolset';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';

export default {
    name: 'ServiceAccount',
    components: {
        PVerticalPageLayout2,
        PButton,
        PDropdownMenuBtn,
        PEmpty,
        PCheckBox,
        PI,
        PHr,
        PQuerySearchBar,
        PQuerySearchTags,
        PToolboxGridLayout,
        PGridLayout,
    },
    setup(props, context) {
        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;
        const providerTotalCount = ref<any>(null);
        const resourceCountAPI = fluentApi.inventory().cloudServiceType().list().setCountOnly();
        onMounted(async () => {
            await providerStore.getProvider();
            const prs = Object.keys(providerStore.state.providers);
            providerTotalCount.value = reactive<any>(_.zipObject(
                ['all', ...prs],
                Array(prs.length),
            ));

            resourceCountAPI.execute().then((resp) => {
                providerTotalCount.value.all = resp.data.total_count;
            });
            prs.forEach((key) => {
                resourceCountAPI.setFilter({ key: 'provider', operator: '=', value: key }).execute().then((resp) => {
                    providerTotalCount.value[key] = resp.data.total_count;
                });
            });
        });
        const vm = getCurrentInstance();
        const selectProvider = ref('all');
        const providerListState = new GridLayoutState({
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
        });

        const metricAPI = fluentApi.inventory().cloudService().list().setCountOnly();
        const createdData = reactive({});
        const todayCreated = ref(createdData);
        const getMetric = (resp: AxiosResponse<CloudServiceTypeListResp>) => {
            const ids = resp.data.results.map(item => item.cloud_service_type_id);
            todayCreated.value = reactive(_.zipObject(ids));
            resp.data.results.forEach((item) => {
                const id = item.cloud_service_type_id;
                const setMetric = (count) => {
                    todayCreated.value[id] = count;
                };
                metricAPI.setFilter(
                    { key: 'provider', operator: '=', value: item.provider },
                    { key: 'cloud_service_group', operator: '=', value: item.group },
                    { key: 'cloud_service_type', operator: '=', value: item.name },
                ).execute().then((rp) => {
                    if (rp.data.total_count) {
                        setMetric(rp.data.total_count);
                    }
                });
            });
            return resp;
        };
        const listAction = fluentApi.inventory().cloudServiceType().list()
            .setOnly('provider', 'group', 'name', 'tags.icon', 'cloud_service_type_id')
            .setTransformer(getMetric)
            .setCloudServiceCount();

        const apiHandler = new QuerySearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['card-item', 'cst-card-item'],
                cardMinWidth: '19.125rem',
                cardHeight: '9rem',
                columnGap: '0.5rem',
                excelVisible: true,
            },
            undefined,
            {
                handlerClass: QuerySearchTableACHandler,
                args: {
                    keys: ['name', 'group'],
                    suggestKeys: [],
                },
            },
        );
        watch(selectProvider, (after, before) => {
            if (after && after !== before) {
                if (after === 'all') {
                    apiHandler.action = listAction.setFixFilter();
                } else {
                    apiHandler.action = listAction.setFixFilter(
                        { key: 'provider', operator: '=', value: after },
                    );
                }
                apiHandler.resetAll();
                apiHandler.getData();
            }
        });
        const clickCard = (item) => {
            vm?.$router.push({
                name: 'cloudServicePage',
                params: {
                    provider: item.provider,
                    group: item.group,
                    name: item.name,
                },
            });
            console.debug(item);
        };
        const dataSource = [
            { name: 'provider', key: 'provider' },
            { name: 'group', key: 'group' },
            { name: 'name', key: 'name' },
        ];
        const exportAction = fluentApi.addons().excel().export().setDataSource(dataSource);
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);
        return {
            selectProvider,
            apiHandler,
            clickCard,
            providerStore,
            todayCreated,
            providerListState,
            providerTotalCount,
            exportToolSet,
        };
    },

};

</script>

<style lang="postcss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }
    .cst-toolbox-top{
        @apply flex justify-between items-center w-full mb-4;
    }
    .provider-list{
        @apply w-full px-4 pt-4;

    }
    >>> .provider-card-item{
        @apply px-4 py-3 flex items-center justify-between bg-transparent;

        .left{
            @apply flex items-center;
            .title{
                @apply ml-4 text-base;
                font-family: "Noto Sans";

            }
        }
        .right{
            .total-count{
                @apply w-10 flex h-6 ml-2 justify-center items-center text-white;
                border-radius: 6.25rem;
                border-width: 0.0625rem;

            }
        }
        &.selected{
            @apply border-blue-600 bg-blue-200 text-blue-600;
            .left{
                .title{
                    @apply text-blue-600;
                }
            }
        }

    }

    >>> .cst-card-item{
        @apply p-6 flex flex-col justify-between;

        .top{
            @apply flex justify-between;
            .text-content{
                .sub-title{
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 1.0625rem;
                }
                .title{
                    @apply font-bold;
                    font-size: 1.125rem;
                    line-height: 1.375rem;

                }
            }
            .side-content{
                @apply w-12 h-12 flex justify-around content-around;
            }

        }
        .bottom{
            @apply flex items-center;
            .total-count {
                @apply font-bold text-4xl;
                font-family: "Noto Sans";
            }
            .today-created{
                @apply border-green-500 flex h-6 ml-2 justify-center items-center;
                border-radius: 6.25rem;
                border-width: 0.0625rem;
                min-width: 2.5rem;
                .number{
                    @apply font-bold text-sm text-green-500 w-auto h-4 text-right;
                    font-family: "Noto Sans";
                    line-height: 1.0625rem;
                }
            }


        }

    }
</style>
