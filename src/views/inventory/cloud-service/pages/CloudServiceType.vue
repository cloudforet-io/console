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
                    {{ item.provider }} / {{ item.group }}<br>
                    {{ item.name }}<br>
                    {{ item.cloud_service_count }}<br>
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
        const { project } = useStore();
        project.getProject();
        const vm = getCurrentInstance();

        const listToolset = new SelectableListToolset<unknown, unknown, ProviderModel>();
        listToolset.state.mapper.iconUrl = 'tags.icon';
        listToolset.state.mapper.key = 'proivder';
        listToolset.state.mapper.title = 'name';

        const providerListAPI = fluentApi.identity().provider().list().setOnly(
            'name',
            'provider',
            'tags.icon',
            'template.service_account.schema',
            'capability.supported_schema',
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
        @apply p-6;
    }
</style>
