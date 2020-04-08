<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <p-grid-layout class="provider-list" v-bind="providerListState.state">
                <template #card="{item}">
                    <img
                        width="32px" height="32px"
                        :src="item.icon"
                        :alt="item.provider"
                    >
                    <div>
                        {{ item.name }}
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
            >
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
                            <div v-else class="bg-gray-200 w-full h-full" />
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
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { fluentApi } from '@/lib/fluent-api';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import { SelectableListToolset } from '@/components/organisms/lists/selectable-list/SelectableList.toolset';
import { ProviderModel } from '@/lib/fluent-api/identity/provider';
import { ProviderStoreType, useStore } from '@/store/toolset';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { QuerySearchGridFluentAPI } from '@/lib/api/grid';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import PHr from '@/components/atoms/hr/Hr.vue';
import { AxiosResponse } from 'axios';
import CloudServiceType, { CloudServiceTypeListResp } from '@/lib/fluent-api/inventory/cloud-service-type';
import { CloudServiceListResp } from '@/lib/fluent-api/inventory/cloud-service';
import _ from 'lodash';
import construct from '@babel/runtime-corejs2/helpers/esm/construct';
import PI from '@/components/atoms/icons/PI.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import { GridLayoutState } from '@/components/molecules/layouts/grid-layout/toolset';

export default {
    name: 'ServiceAccount',
    components: {
        PVerticalPageLayout2,
        PButton,
        PDropdownMenuBtn,
        PEmpty,
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
        providerStore.getProvider();
        const vm = getCurrentInstance();
        const selectProvider = ref('aws');
        const providerListState = new GridLayoutState({
            items: computed(() => [
                ...Object.entries(providerStore.state.providers).map(([key, value]) => ({ provider: key, ...value })),
            ]),
            cardClass: () => ['provider-card-item'],
            cardMinWidth: '14.125rem',
            cardHeight: '3.5rem',
            columnGap: '0.5rem',
        });

        // providerListAPI.execute().then((resp) => {
        //     listToolset.state.items = resp.data.results;
        //     listToolset.syncState.selectedIndexes = [0];
        // });

        const metricAPI = fluentApi.inventory().cloudService().list().setCountOnly();
        // .setFixFilter({ key: 'created_at', operator: '>', value: '2222222222222' });
        const createdData = reactive({});
        const todayCreated = ref(createdData);
        const getMetric = (resp: AxiosResponse<CloudServiceTypeListResp>) => {
            const ids = resp.data.results.map(item => item.cloud_service_type_id);
            todayCreated.value = reactive(_.zipObject(ids));
            resp.data.results.forEach((item) => {
                const id = item.cloud_service_type_id;
                const setMetric = (count) => { todayCreated.value[id] = count; };
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
                cardClass: () => ['cst-card-item'],
                cardMinWidth: '19.125rem',
                cardHeight: '9rem',
                columnGap: '0.5rem',
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
                apiHandler.action = listAction.setFixFilter(
                    { key: 'provider', operator: '=', value: after },
                );
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
        // const items = computed(() => apiHandler.gridTS.state.items.map(item => ({
        //     ...item,
        //     todayCreat: todayCreated.value[item.cloud_service_type_id],
        // })));
        return {
            apiHandler,
            clickCard,
            providerStore,
            todayCreated,
            providerListState,
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
    .provider-list{
        @apply w-full px-4 pt-4;
    }
    >>> .provider-card-item{
        @apply px-4 py-3 flex justify-between;
    }
    >>> .cst-card-item{
        @apply p-6 flex flex-col justify-between;
        .top{
            @apply flex justify-between;
            .text-content{
                .sub-title{
                    @apply text-gray-500;
                    font-family: "Noto Sans";
                    font-size: 0.875rem;
                    line-height: 1.0625rem;
                }
                .title{
                    @apply font-bold;
                    font-family: "Noto Sans";
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
                @apply border-green-500 w-10 flex h-6 ml-2 justify-center items-center;
                border-radius: 6.25rem;
                border-width: 0.0625rem;
                .number{
                    @apply font-bold text-sm text-green-500 w-3 h-4 text-right;
                    font-family: "Noto Sans";
                    line-height: 1.0625rem;
                }
            }


        }

    }
</style>
