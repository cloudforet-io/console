<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <PSelectableList
                class="w-full"
                v-bind="listToolset.state"
                :selected-indexes.sync="listToolset.syncState.selectedIndexes"
            />
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
import { useStore } from '@/store/toolset';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { QuerySearchGridFluentAPI } from '@/lib/api/grid';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import PHr from '@/components/atoms/hr/Hr.vue';

export default {
    name: 'ServiceAccount',
    components: {
        PVerticalPageLayout2,
        PButton,
        PDropdownMenuBtn,
        PEmpty,
        PHr,
        PQuerySearchBar,
        PQuerySearchTags,
        PToolboxGridLayout,
        PSelectableList,
    },
    setup(props, context) {
        const {
            provider,
        } = useStore();
        const providerStore = provider;
        providerStore.getProvider();
        const vm = getCurrentInstance();

        const listToolset = new SelectableListToolset<unknown, unknown, ProviderModel>();
        listToolset.state.mapper.iconUrl = 'tags.icon';
        listToolset.state.mapper.key = 'proivder';
        listToolset.state.mapper.title = 'name';

        const providerListAPI = fluentApi.identity().provider().list().setOnly(
            'name',
            'provider',
            'tags.icon',
        );

        providerListAPI.execute().then((resp) => {
            listToolset.state.items = resp.data.results;
            listToolset.syncState.selectedIndexes = [0];
        });
        const listAction = fluentApi.inventory().cloudServiceType().list()
            .setOnly('provider', 'group', 'name', 'tags.icon')
            .setCloudServiceCount();

        const apiHandler = new QuerySearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['cst-card-item'],
                cardMinWidth: '19.125rem',
                cardHeight: '9rem',

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
        watch(() => listToolset.selectState.firstSelectItem, (after, before) => {
            if (after && after !== before) {
                apiHandler.action = listAction.setFixFilter(
                    { key: 'provider', operator: '=', value: after.provider },
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
        return {
            listToolset,
            apiHandler,
            clickCard,
            providerStore,
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
            @apply flex ;
            .total-count {
                @apply font-bold text-4xl;
                font-family: "Noto Sans";
            }

        }

    }
</style>
