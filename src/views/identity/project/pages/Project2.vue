<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{height}">
            <div class="treeSidebar">
                <div id="tree-header">
                    Project Group
                    <p-i name="ic_plus" color="transparent inherit"
                         width="1rem" height="1rem" class="add-btn"
                         @click="openProjectGroupForm()"
                    />
                </div>
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
                    <template #toolbox-top>
                        <p id="parent-project-grp">
                            project group
                        </p>
                        <p id="current-project-grp">
                            Current Project Group
                        </p>
                        <!--                        <p id="current-project-grp">{{ projectSummary[0].project_group_info.name}}</p>-->
                    </template>
                    <template #toolbox-bottom>
                        <div class="tool">
                            <div class="tool-left">
                                <div class="tool-left-btn">
                                    <p-button style-type="primary-dark" @click="openProjectForm()">
                                        {{ $t('INVENTORY.CRT_PROJ') }}
                                    </p-button>
                                </div>
                                <div class="tool-left-search">
                                    <p-query-search-bar
                                        :search-text.sync="apiHandler.gridTS.querySearch.state.searchText"
                                        :autocomplete-handler="apiHandler.gridTS.querySearch.acHandler.value"
                                        @newQuery="apiHandler.gridTS.querySearch.addTag"
                                    />
                                </div>
                            </div>
                            <div class="tool-right">
                                <div class="tool-right-checkbox" style="user-select: none">
                                    <PCheckBox :value="false" :disabled="true" />    Select All
                                </div>
                                <div class="tool-right-btn">
                                    <p-button outline style-type="alert">
                                        Delete
                                    </p-button>
                                </div>
                            </div>
                        </div>
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
                                <div v-if="item.force_console_data.providers.length == 0" class="empty-providers">
                                    <p id="empty-provider"></p>
                                </div>
                                <div v-else-if="item.force_console_data.providers" class="providers">
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
            <SProjectGroupCreateFormModal v-if="projectGroupFormVisible" :visible.sync="projectGroupFormVisible"
                                          @confirm="projectGroupFormConfirm($event)"
            />
            <SProjectCreateFormModal v-if="projectFormVisible" :visible.sync="projectFormVisible"
                                     @confirm="projectFormConfirm($event)"
            />
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
import _ from 'lodash';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { fluentApi } from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ProjectModel, ProjectListResp } from '@/lib/fluent-api/identity/project';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store/toolset';
import { ProviderListResp } from '@/lib/fluent-api/identity/provider';
import config from '@/lib/config';
import { ProjectSummaryResp } from '@/lib/fluent-api/statistics/identity/project-summary';
import { QuerySearchGridFluentAPI } from '@/lib/api/grid';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { GridLayoutState } from '@/components/molecules/layouts/grid-layout/toolset';
import SProjectCreateFormModal from '@/views/identity/project/modules/ProjectCreateFormModal.vue';
import SProjectGroupCreateFormModal from '@/views/identity/project/modules/ProjectGroupCreateFormModal.vue';


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

export default {
    name: 'Project2',
    components: {
        PVerticalPageLayout2,
        PTree,
        PButton,
        PI,
        PQuerySearchBar,
        PQuerySearchTags,
        PCheckBox,
        PEmpty,
        PToolboxGridLayout,
        SProjectCreateFormModal,
        SProjectGroupCreateFormModal,
    },
    setup(props, context) {
        const state: UnwrapRef<State> = reactive({
            item: [],
            items: [],
            selectedId: '',
        });
        const { provider } = useStore();
        provider.getProvider();
        const vm = getCurrentInstance();

        /**
             Tree, Project, Statistics API Handler Declaration
         */
        const treeAction = fluentApi.identity().project().tree()
            .setSortBy('item_type')
            .setExcludeProject();
        const treeApiHandler = new ProjectTreeFluentAPI(treeAction, TreeToolSet);
        const projectAPI = fluentApi.identity().project();
        const statisticsAPI = fluentApi.statistics().projectSummary();

        /**
        * Make Card Data
        */
        const createdData = reactive({});
        const cardSummary = ref(createdData);
        const projectSummary = ref(createdData);

        // Get & Refine Card Data for setTransformer action in fluent API
        // First, Get statistics info of Project
        // Second, Get providers list from Provider store and save them to force_console_data
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
                if (providers.length == 0) {

                }
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
            projectSummary.value = resp.data.results;
            return resp;
        };

        // Use fluent API with multiple options(include setTransformer action) and Get project list
        const listAction = projectAPI.list().setTransformer(getCard).setIncludeProvider();

        /**
         * QuerySearch Grid Fluent API Declaration
         * QuerySearch Grid API : Grid layout with query search bar & List Action(with fluent API)
         */
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
        // Execute Api Handler above when Tree clicked
        watch(() => treeApiHandler.ts.metaState.firstSelectedNode, (after: any, before: any) => {
            if ((after && !before) || (after && after.data.id !== before.data.id)) {
                apiHandler.action = listAction.setFixFilter({
                    key: 'project_group_id',
                    value: after.data.id,
                    operator: '=',
                });
                apiHandler.resetAll();
                apiHandler.getData();
            }
        });

        /**
         * Click Tree Item
         */
        const selected = async (item) => {
            console.log('selected test', item);
            treeApiHandler.ts.getSelectedNode(item);
            state.selectedId = item.data.id;
            state.items = [];
        };

        /**
         * Click Card Item
         */
        const clickCard = (item) => {
            vm?.$router.push({
                name: 'projectDetail',
                params: {
                    id: item.project_id,
                    name: item.name,
                    project_group: item.project_group_info,
                    tags: item.tags,
                },
            });
            console.debug(item);
        };

        /**
         * Handling Form
         */
        // Make and Confirm Project Group Form
        const formState = reactive({
            projectGroupFormVisible: false,
            projectFormVisible: false,
        });
        const openProjectGroupForm = () => {
            formState.projectGroupFormVisible = true;
        };
        const projectGroupFormConfirm = (item) => {
            fluentApi.identity().projectGroup().create().setParameter({
                ...item,
            })
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Add Success',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Add Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .finally(() => {
                    fluentApi.identity().project().tree()
                        .setSortBy('item_type')
                        .setExcludeProject();
                });
            formState.projectGroupFormVisible = false;
        };

        // Make and Confirm Project Group Form
        const openProjectForm = () => {
            formState.projectFormVisible = true;
        };
        const projectFormConfirm = (item) => {
            fluentApi.identity().project().create().setParameter({
                project_group_id: state.selectedId,
                ...item,
            })
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Add Success',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Add Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .finally(() => {
                    apiHandler.getData();
                });
            formState.projectFormVisible = false;
        };

        return {
            treeRef: treeApiHandler.ts.treeRef,
            treeApiHandler,
            apiHandler,
            ...toRefs(state),
            ...toRefs(formState),
            selected,
            clickCard,
            cardSummary,
            projectSummary,
            openProjectForm,
            projectFormConfirm,
            openProjectGroupForm,
            projectGroupFormConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .treeSidebar {
        height: 100%;
    }

    #tree-header {
        @apply text-gray-500;
        margin-left: 1.25rem;
        margin-top: 1.5rem;
        margin-bottom: .8rem;
        font-weight: bold;
        font-size: 0.88rem;
    }

    .add-btn {
        cursor: pointer;
    }

    #parent-project-grp {
        font-size: .75rem;
        padding-top: .5rem;
    }

    #current-project-grp {
        padding-top: .7rem;
        padding-bottom: .5rem;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .empty {
        flex-direction: column;
        text-align: center;
        justify-content: flex-start;
    }

    .project-description {
        margin-left: 1.5rem;
        margin-right: 1.5rem;
        margin-top: 1.5rem;
    }

    #project-group-name {
        font-size: .75rem;
        margin-bottom: .25rem;
    }

    #project-name {
        font-size: 1.12rem;
        font-weight: bold;
        margin-bottom: 1.4rem;
    }

    .provider-icon {
        max-width: 2rem;
        max-height: 2rem;
        display: inline;
        margin-right: .5rem;
    }

    #empty-provider {
        padding-top: 1.2rem;
    }

    .solid {
        @apply border-l border-gray-100;
        margin-top: 1.2rem;
        margin-left: 0px;
    }

    .project-summary {
        margin-top: 0.87rem;
        margin-left: 1.5rem;
        margin-right: 1.5rem;
    }

    .summary-item-text {
        display: inline-block;
        font-size: 0.88rem;
        text-align: left;
        margin-bottom: .9rem;
    }

    .summary-item-num {
        @apply text-gray-500;
        display: inline-block;
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 0.75rem;
        text-align: right;
        float: right;
    }

    .tool {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        .tool-left {
            display: flex;
            .tool-left-btn {
                margin-right: 1rem;
            }
            .tool-left-search {
                width: auto;
            }
        }
        .tool-right {
            display: flex;
            justify-content: flex-end;
            .tool-right-checkbox {
                padding-top: .5rem;
            }
            .tool-right-btn {
                margin-left: 1rem;
            }
        }

    }

</style>
