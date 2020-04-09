<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{height}">
            <div class="treeSidebar" @click.right.stop.prevent="treeClickedRight">
                <p-tree
                    ref="treeRef"
                    v-bind="treeApiHandler.ts.state"
                    :select-mode="true"
                    @node:selected="selected"
                >
                    <template #icon="{node,isExpanded}">
                        <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_tree_project' :
                                 isExpanded ? 'ic_tree_folder--opened' : 'ic_tree_folder'"
                             color="transparent inherit"
                             width="1rem" height="1rem"
                        />
                    </template>
                </p-tree>
            </div>
        </template>
        <template #default>
            <div v-if="treeApiHandler.ts.metaState.firstSelectedNode">
                <p-toolbox-grid-layout
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
                        <div class="project-description">
                            <div class="project">
                                <p id="project-group-name">
                                    {{ item.project_group_info.name }}
                                </p>
                                <p id="project-name">
                                    {{ item.name }}
                                </p>
                                <div v-if="item.force_console_data.providers" class="providers">
                                    <img v-for="(url, index) in item.force_console_data.providers" :key="index" :src="url"
                                         class="provider-icon"
                                    >
                                    <span v-if="item.force_console_data.extraProviders"> + {{ item.force_console_data.extraProviders }}</span>
                                </div>
                            </div>
                        </div>
                        <hr class="solid">
                        <div class="project-summary">
                            <div v-if="cardSummary[item.project_id]" class="summary-item">
                                <span class="summary-item-text">Cloud Service</span>   <span class="summary-item-num">{{ cardSummary[item.project_id].cloud_service }}</span><br>
                                <span class="summary-item-text">Server</span>   <span class="summary-item-num">{{ cardSummary[item.project_id].server }}</span><br>
                                <span class="summary-item-text">Member</span>   <span class="summary-item-num">{{ cardSummary[item.project_id].member }}</span>
                            </div>
                            <div v-else class="loading">
                                loading
                            </div>
                        </div>
                    </template>
                </p-toolbox-grid-layout>
            </div>
            <p-empty v-else class="empty">
                <p-i :width="'14rem'" :height="'14rem'" :name="'ic_no_selected_proj'" />
                <div class="empty-msg">
                    No Selected Project<br>
                    Please, Click an item from left table.
                </div>
            </p-empty>
        </template>
    </p-vertical-page-layout2>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, defineComponent, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import { ProjectTreeFluentAPI } from '@/lib/api/tree';
import TreeItem, { TreeItemInterface, TreeState, TreeToolSet } from '@/components/molecules/tree-new/ToolSet';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import _ from 'lodash';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import fluentApi from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ProjectModel, ProjectListResp } from '@/lib/fluent-api/identity/project';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store/toolset';
import { ProviderListResp } from '@/lib/fluent-api/identity/provider';
import config from '@/lib/config';
import { ProjectSummaryResp } from '@/lib/fluent-api/statistics';
import { QuerySearchGridFluentAPI } from '@/lib/api/grid';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { GridLayoutState } from '@/components/molecules/layouts/grid-layout/toolset';


    interface Summary {
        [id: string]: ProjectSummaryResp;
    }

    interface ProjectCardData{
        projectGroupName: string;
        projectId: string;
        projectName: string;
        providers: string[];
        extraProviders: number;
        summary?: ProjectSummaryResp;
    }

    interface State {
        item: any;
        items: ProjectCardData[];
        selectedId: string;
    }

export default{
    name: 'Project2',
    components: {
        PVerticalPageLayout2,
        PLazyImg,
        PTree,
        PTab,
        PHorizontalLayout,
        PDynamicView,
        PDynamicDetails,
        PI,
        PQuerySearchBar,
        PQuerySearchTags,
        PEmpty,
        PGridLayout,
        PToolboxGridLayout,
    },
    setup(props, context) {
        const state: UnwrapRef<State> = reactive({
            item: [],
            items: [],
            selectedId: '',
        });
        const { provider } = useStore();
        provider.getProvider();

        /**
             Api Handler
             */
        const treeAction = fluentApi.identity().project().tree()
            .setSortBy('item_type')
            .setExcludeProject();
        const treeApiHandler = new ProjectTreeFluentAPI(treeAction, TreeToolSet);
        const projectAPI = fluentApi.identity().project();
        const statisticsAPI = fluentApi.statistics().projectSummary();

        const createdData = reactive({});
        const cardSummary = ref(createdData);
        const getCard = (resp: AxiosResponse<ProjectListResp>) => {
            const ids = resp.data.results.map(item => item.project_id);
            cardSummary.value = reactive(_.zipObject(ids));
            resp.data.results.forEach((item) => {
                const id = item.project_id;
                const setCard = (items) => { cardSummary.value[id] = items; };
                statisticsAPI.setId(id).execute().then((rp) => {
                    if (rp.data) {
                        setCard(rp.data);
                    }
                });
            });
            const temp = resp.data.results.map((it) => {
                const providers = (it.providers as string[]).map(name => _.get(provider.state.providers, [name, 'icon']));
                const extraProviders = providers.length > 5 ? providers.length - 5 : 0;
                return {
                    ...it,
                    force_console_data: {
                        extraProviders,
                        providers: providers.splice(0, 5),
                    },
                };
            });
            resp.data.results = temp;
            return resp;
        };

        const listAction = projectAPI.list().setTransformer(getCard).setIncludeProvider();

        const apiHandler = new QuerySearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['project-card-item'],
                cardMinWidth: '18.75rem',
                cardHeight: '15rem',
            },
            undefined,
            {
                handlerClass: QuerySearchTableACHandler,
                args: {
                    keys: ['name'],
                    suggestKeys: [],
                },
            },
        );

        watch(() => treeApiHandler.ts.metaState.firstSelectedNode, (after: any, before: any) => {
            if ((after && !before) || (after && after.data.id !== before.data.id)) {
                console.debug(after);
                apiHandler.action = listAction.setFixFilter({
                    key: 'project_group_id',
                    value: after.data.id,
                    operator: '=',
                });
                apiHandler.resetAll();
                apiHandler.getData();
            }
        });

        const selected = async (item) => {
            console.log('selected test', item);
            treeApiHandler.ts.getSelectedNode(item);
            state.selectedId = item.data.id;
            state.items = [];
        };

        const clickCard = (item) => {
            console.log('click card');
        };
        return {
            treeRef: treeApiHandler.ts.treeRef,
            treeApiHandler,
            apiHandler,
            ...toRefs(state),
            selected,
            clickCard,
            cardSummary,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .treeSidebar {
        height: 100%;
    }

    /*.right-container {*/
    /*    width: 100%;*/
    /*}*/

    .empty {
        flex-direction: column;
        text-align: center;
        justify-content: flex-start;
    }

    .project-description {
        margin-left: 24px;
        margin-right: 24px;
        margin-top: 24px;
    }

    #project-group-name {
        font-size: 12px;
        margin-bottom: 4px;
    }

    #project-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 22.4px;
    }

    .provider-icon {
        max-width: 2rem;
        max-height: 2rem;
        display: inline;
        margin-right: .5rem;
    }

    .solid {
        @apply border-l border-gray-100;
        margin-top: 19.6px;
        margin-left: 0px;
    }

    .project-summary {
        margin-top: 14px;
        margin-left: 24px;
        margin-right: 24px;
    }

    .summary-item-text {
        display: inline-block;
        font-size: 14px;
        text-align: left;
        margin-bottom: 15px;
    }

    .summary-item-num {
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 12px;
        text-align: right;
        float: right;
        color: #0069CC;
    }
</style>
