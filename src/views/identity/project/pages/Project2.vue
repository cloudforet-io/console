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
<!--                <div v-if="treeApiHandler.ts.metaState.selectedNode">-->
<!--                    <pre>no data</pre>-->
<!--                </div>-->
                <p-toolbox-grid-layout
                    card-min-width="18.75rem"
                    card-height="15rem"
                    :items="cardItems"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    @changePageNumber="getData()"
                    @changePageSize="getData()"
                    @clickRefresh="getData()"
                >
                    <template #card="{item}">
                        <div class="project-description">
                            <div class="project">
                                <p id="project-group-name">
                                    {{ item.projectGroupName }}
                                </p>
                                <p id="project-name">
                                    {{ item.projectName }}
                                </p>
                                <div v-if="item.providers" class="providers">
                                    <img v-for="(url, index) in item.providers" :key="index" :src="url"
                                         class="provider-icon"
                                    >
                                    <span v-if="item.extraProviders"> + {{ item.extraProviders }}</span>
                                </div>
                            </div>
                        </div>
                        <hr class="solid">
                        <div class="project-summary">
                            <div v-if="item.summary" class="summary-item">
                                <span class="summary-item-text">Cloud Service</span>   <span class="summary-item-num">{{ item.summary.cloud_service }}</span><br>
                                <span class="summary-item-text">Server</span>   <span class="summary-item-num">{{ item.summary.server }}</span><br>
                                <span class="summary-item-text">Member</span>   <span class="summary-item-num">{{ item.summary.member }}</span>
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
    computed, defineComponent, getCurrentInstance, reactive, ref, toRefs,
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
import { ProjectModel } from '@/lib/fluent-api/identity/project';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store/toolset';
import { ProviderListResp } from '@/lib/fluent-api/identity/provider';
import config from '@/lib/config';
import { ProjectSummaryResp } from '@/lib/fluent-api/statistics';


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
        totalCount: number;
        thisPage: number;
        pageSize: number;
        allPage: number;
}

export default defineComponent({
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
        PEmpty,
        PGridLayout,
        PToolboxGridLayout,
    },
    setup(props, context) {
        const state: UnwrapRef<State> = reactive({
            item: [],
            items: [],
            thisPage: 1,
            totalCount: 0,
            pageSize: 12,
            allPage: 1,
            selectedId: '',
        });
        const summary = ref<Summary>({});

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

        const getSummary = (id: string) => {
            if (!summary.value[id]) {
                fluentApi.statistics().projectSummary().setId(id).execute()
                    .then((resp) => {
                        summary.value = {
                            ...summary.value,
                            [id]: resp.data,
                        };
                    });
            }
        };
        const getData = async () => {
            state.items = [];
            try {
                const res = await projectAPI.list()
                    .setThisPage(state.thisPage)
                    .setPageSize(state.pageSize)
                    .setFilter({
                        key: 'project_group_id',
                        value: state.selectedId,
                        operator: '=',
                    })
                    .setIncludeProvider()
                    .execute();
                state.items = res.data.results.map((it: ProjectModel) => {
                    const providers = (it.providers as string[]).map(name => _.get(provider.state.providers, [name, 'icon']));
                    const extraProviders = providers.length > 5 ? providers.length - 5 : 0;
                    return {
                        projectGroupName: it.project_group_info.name,
                        projectId: it.project_id,
                        projectName: it.name,
                        extraProviders,
                        providers: providers.splice(0, 5),
                    };
                });
                state.totalCount = res.data.total_count;
                state.items.forEach((it) => {
                    getSummary(it.projectId);
                });
            } catch (e) {
                state.items = [];
                state.allPage = 1;
                console.error(e);
            }
        };

        const selected = async (item) => {
            treeApiHandler.ts.getSelectedNode(item);
            state.selectedId = item.data.id;
            state.items = [];
            await getData();
        };

        const cardItems = computed(() => state.items.map((item) => {
            if (summary.value[item.projectId]) {
                item.summary = summary.value[item.projectId];
            }
            return item;
        }));
        return {
            treeRef: treeApiHandler.ts.treeRef,
            treeApiHandler,
            ...toRefs(state),
            selected,
            summary,
            cardItems,
            getData,
        };
    },
});
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
