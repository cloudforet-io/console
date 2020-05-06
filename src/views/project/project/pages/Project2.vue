<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div class="treeSidebar" :style="{width:width+'px'}">
                <div id="tree-header">
                    Project Group
                    <p-i name="ic_plus" color="transparent inherit"
                         width="1rem" height="1rem" class="add-btn"
                         @click="openProjectGroupForm(true)"
                    />
                </div>
                <p-tree
                    ref="treeRef"
                    v-bind="treeApiHandler.ts.state"
                    :select-mode="true"
                    :style="{width:width+'px'}"
                    @node:selected="selected"
                >
                    <template #icon="{node,isExpanded}">
                        <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_tree_project' :
                                 isExpanded ? 'ic_tree_folder--opened' : 'ic_tree_folder'"
                             color="transparent inherit"
                             width="1rem" height="1rem"
                        />
                    </template>
                    <template #extra="{node, hoveredNode}">
                        <span v-show="node===hoveredNode"
                              @mouseenter.stop="hovered(node)"
                              @click.stop="openProjectGroupForm(false)"
                        >
                            <div v-tooltip.bottom="{content: $t('TREE_TYPE.CREATE_GRP'), delay: {show: 300}}"
                                 class="text-base truncate leading-tight"
                            >
                                <p-i :name="'ic_plus'" color="transparent inherit"
                                     width="1rem" height="1rem" class="mt-1"
                                />
                            </div>
                        </span>
                    </template>
                </p-tree>
            </div>
        </template>
        <template #default>
            <div v-if="treeApiHandler.ts.metaState.firstSelectedNode">
                <p-toolbox-grid-layout
                    v-bind="apiHandler.gridTS.state"
                    card-height="16rem"
                    :this-page.sync="apiHandler.gridTS.syncState.thisPage"
                    :page-size.sync="apiHandler.gridTS.syncState.pageSize"
                    @changePageNumber="apiHandler.getData"
                    @changePageSize="apiHandler.getData"
                    @clickRefresh="apiHandler.getData"
                    @card:click.self="clickCard"
                >
                    <template #toolbox-top>
                        <div>
                            <p id="parent-project-grp">
                                {{ parentGroup }}
                            </p>
                            <p id="current-project-grp">
                                {{ currentGroup }}
                                <p-i v-if="!hasChildProjectGroup && !hasChildProject " name="ic_transhcan" color="transparent inherit"
                                     width="1.5rem" height="1.5rem" class="delete-btn"
                                     @click="openProjectGroupDeleteForm"
                                />
                            </p>
                        </div>
                    </template>
                    <template #toolbox-bottom>
                        <div class="flex flex-row xs:flex-col sm:flex-col md:flex-row lg:flex-row xl:flew-row tool">
                            <div class="flex flex-row flex-wrap w-full tool-left">
                                <div class="tool-left-btn">
                                    <p-button style-type="primary-dark" @click="openProjectForm">
                                        {{ $t('INVENTORY.CRT_PROJ') }}
                                    </p-button>
                                </div>
                                <div class="w-1/2 tool-left-search">
                                    <p-query-search-bar
                                        :search-text.sync="apiHandler.gridTS.querySearch.state.searchText"
                                        :autocomplete-handler="apiHandler.gridTS.querySearch.acHandler.value"
                                        @newQuery="apiHandler.gridTS.querySearch.addTag"
                                    />
                                </div>
                            </div>
                        </div>
                        <div v-if="apiHandler.gridTS.querySearch.tags.value.length !== 0" slot="toolbox-bottom">
                            <p-hr style="width: 100%;" />
                            <p-query-search-tags
                                class="py-2"
                                :tags="apiHandler.gridTS.querySearch.tags.value"
                                @deleteTag="apiHandler.gridTS.querySearch.deleteTag"
                                @deleteAllTags="apiHandler.gridTS.querySearch.deleteAllTags"
                            />
                        </div>
                        <div v-show="!hasChildProject" class="empty-project">
                            <img class="w-48 mx-auto pt-12 mb-4" src="@/assets/images/illust_astronaut_standing.svg">
                            <p>Looks like you don't have any Project.</p>
                        </div>
                    </template>
                    <template #card="{item}">
                        <div v-if="treeApiHandler.ts.metaState.firstSelectedNode && item">
                            <div class="project-description">
                                <div class="project">
                                    <div v-if="parentGroup" class="project-group-name">
                                        {{ parentGroup }} > {{ item.project_group_info.name }}
                                    </div>
                                    <p v-else-if="!parentGroup" class="project-group-name">
                                        {{ item.project_group_info.name }}
                                    </p>
                                    <p id="project-name">
                                        {{ item.name }}
                                    </p>
                                    <div v-if="item.force_console_data.providers.length == 0" class="empty-providers"
                                         @click="clickServiceAccount"
                                    >
                                        <p>
                                            <p-i :name="'btn_circle_plus_blue'"
                                                 width="24px" height="24px" class="btn_circle_plus_blue"
                                            />
                                            Add Service Account
                                        </p>
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
                                    <span class="summary-item-text">Cloud Service</span>   <span class="summary-item-num">{{ cardSummary[item.project_id].cloud_services }}</span><br>
                                    <span class="summary-item-text">Server</span>   <span class="summary-item-num">{{ cardSummary[item.project_id].servers_count }}</span><br>
                                    <span class="summary-item-text">Member</span>   <span class="summary-item-num">{{ cardSummary[item.project_id].member_count }}</span>
                                </div>
                                <div v-else class="loading">
                                    <div v-for="v in skeletons" :key="v" class="flex items-center p-2">
                                        <p-skeleton width="1.5rem" height="1.5rem" class="mr-4 flex-shrink-0" />
                                        <p-skeleton class="flex-grow" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </p-toolbox-grid-layout>
            </div>
            <div v-else class="empty">
                <img class="w-40 mx-auto mb-4 pt-8" src="@/assets/images/illust_astronaut_walking.svg">
                <div class="empty-project-grp">
                    <p class="title">
                        Let's begin your <br>
                        resource management!<br>
                    </p>
                    <p class="content">
                        Getting started with grouping your scattered resource and <br>
                        accounts with your own project.<br><br>
                    </p>
                    <p class="content-order">
                        1. Name your project group first. <br>
                        2. Register your project. <br>
                        3. Integrate with your resources.
                    </p>
                    <p-button style-type="primary-dark"
                              @click="openProjectGroupForm"
                    >
                        <p-i name="ic_plus" color="transparent inherit"
                             width="1rem" height="1rem" class="add-btn"
                        />
                        Create Project Group
                    </p-button>
                </div>
            </div>
            <SProjectGroupCreateFormModal v-if="projectGroupFormVisible" :visible.sync="projectGroupFormVisible"
                                          @confirm="projectGroupFormConfirm($event)"
            />
            <SProjectCreateFormModal v-if="projectFormVisible" :visible.sync="projectFormVisible"
                                     @confirm="projectFormConfirm($event)"
            />
            <p-button-modal
                :header-title="headerTitle"
                :centered="true"
                size="md"
                :fade="true"
                :backdrop="true"
                :visible.sync="projectGroupDeleteFormVisible"
                :theme-color="themeColor"
                :footer-confirm-button-bind="{
                    styleType: 'alert',
                }"
                @confirm="projectGroupDeleteFormConfirm"
            >
                <template #body>
                    <p class="delete-modal-content">
                        {{ modalContent }}
                    </p>
                </template>
            </p-button-modal>
        </template>
    </p-vertical-page-layout2>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import { ProjectTreeFluentAPI } from '@/lib/api/tree';
import TreeItem, { TreeState } from '@/components/molecules/tree-new/ToolSet';
import _ from 'lodash';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import { fluentApi } from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ProjectListResp } from '@/lib/fluent-api/identity/project';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store/toolset';
import { ProjectSummaryResp } from '@/lib/fluent-api/statistics';
import { QuerySearchGridFluentAPI } from '@/lib/api/grid';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import SProjectCreateFormModal from '@/views/project/project/modules/ProjectCreateFormModal.vue';
import SProjectGroupCreateFormModal from '@/views/project/project/modules/ProjectGroupCreateFormModal.vue';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import { tree } from '@/lib/api';

    interface ProjectCardData{
        projectGroupName: string;
        projectId: string;
        projectName: string;
        providers: string[];
        extraProviders: number;
        summary?: ProjectSummaryResp;
    }

    interface State {
        // item: any;
        items: ProjectCardData[];
        hoveredId: string;
        hoveredNode: any;
        hasChildProject: boolean;
        hasChildProjectGroup: boolean;
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
        PSkeleton,
        PToolboxGridLayout,
        PButtonModal,
        SProjectCreateFormModal,
        SProjectGroupCreateFormModal,
    },
    setup(props, context) {
        const state: UnwrapRef<State> = reactive({
            // item: [],
            items: [],
            hoveredId: '',
            hoveredNode: {},
            hasChildProject: true,
            hasChildProjectGroup: true,
        });
        const projectState = reactive({
            parentGroup: '',
            currentGroup: '',
        });
        const treeState = new TreeState().state;
        const formState = reactive({
            projectGroupFormVisible: false,
            projectFormVisible: false,
            projectGroupDeleteFormVisible: false,
            isRoot: false,
            headerTitle: '',
            themeColor: '',
            modalContent: '',
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
        const treeApiHandler = new ProjectTreeFluentAPI(treeAction);
        const projectAPI = fluentApi.identity().project();
        const projectGroupAPI = fluentApi.identity().projectGroup();
        const statisticsAPI = fluentApi.statisticsTest().resource().stat()
            .setResourceType('identity.Project')
            .addGroupKey('project_id', 'project_id')

            .setJoinResourceType('inventory.Server')
            .addJoinKey('project_id')
            .addJoinGroupKey('project_id', 'project_id')
            .addJoinGroupField('servers_count', STAT_OPERATORS.count)

            .setJoinResourceType('inventory.CloudService', 1)
            .addJoinKey('project_id', 1)
            .addJoinGroupKey('project_id', 'project_id', 1)
            .addJoinGroupField('cloud_services', STAT_OPERATORS.count, undefined, 1)

            .setJoinResourceType('identity.Project', 2)
            .addJoinKey('project_id', 2)
            .addJoinGroupKey('project_id', 'project_id', 2)
            .addJoinGroupField('member_count', STAT_OPERATORS.size, 'project_member.user', 2);

        /**
        * Make Card Data
        */
        const createdData = reactive({});
        const cardSummary = ref(createdData);
        const projectSummary = ref(createdData);
        //@ts-ignore
        const getSubProject = (action: any) => action.setFilter({ key: 'project_group_id', operator: '=', value: treeApiHandler.ts.metaState.firstSelectedNode.data.id });

        const getCard = (resp: AxiosResponse<ProjectListResp>) => {
            if (resp.data.results.length !== 0) {
                const ids = resp.data.results.map(item => item.project_id);
                cardSummary.value = reactive(_.zipObject(ids));
                const setCard = (items) => {
                    items.forEach((item) => {
                        const project_id = item.project_id;
                        item.cloud_services = item?.cloud_services || 0;
                        item.servers_count = item?.servers_count || 0;
                        cardSummary.value[project_id] = item;
                    });
                };
                getSubProject(statisticsAPI).execute().then((rp) => {
                    if (rp.data?.results) {
                        setCard(rp.data.results);
                    }
                });
            }
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
            projectSummary.value = resp.data.results;
            return resp;
        };

        const listAction = projectAPI.list().setTransformer(getCard).setIncludeProvider();

        /**
         * QuerySearch Grid Fluent API Declaration
         * QuerySearch Grid API : Grid layout with query search bar & List Action(with fluent API)
         */
        const apiHandler = new QuerySearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['card-item', 'project-card-item'],
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
            computed(() => treeApiHandler.ts.metaState.firstSelectedNode),
        );

        watch(() => treeApiHandler.ts.metaState.firstSelectedNode, async (after: any, before: any) => {
            if ((after && !before) || (after && after.data.id !== before.data.id)) {
                apiHandler.action = listAction.setFixFilter({
                    key: 'project_group_id',
                    value: after.data.id,
                    operator: '=',
                });
                apiHandler.resetAll();
                const resp = await apiHandler.getData();
                const projectTotal = resp?.data?.total_count;
                if (projectTotal > 0) state.hasChildProject = true;
                else state.hasChildProject = false;
            }
        });

        /**
         * Dec Child Project Group or Child Project
         */

        /**
         * Click or Hover Tree Item
         */
        const selected = async (item) => {
            formState.isRoot = false;
            treeApiHandler.ts.getSelectedNode(item);
            projectState.currentGroup = item.data.name;
            if (item.parent) { projectState.parentGroup = item.parent.data.name; } else { projectState.parentGroup = ''; }
            state.hasChildProjectGroup = true;
            //@ts-ignore
            const res = await projectGroupAPI.list().setFilter({ key: 'parent_project_group_id', operator: '=', value: treeApiHandler.ts.metaState.firstSelectedNode.data.id }).execute();
            if (res.data.total_count === 0) state.hasChildProjectGroup = false;
            else state.hasChildProjectGroup = true;
            state.items = [];
        };

        const hovered = async (item) => {
            formState.isRoot = false;
            state.hoveredId = item.data.id;
            state.hoveredNode = item;
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
        };

        const clickServiceAccount = () => {
            vm?.$router.push({
                name: 'serviceAccount',
            });
        };

        /**
         * Handling Form
         */
        const openProjectGroupDeleteForm = () => {
            formState.projectGroupDeleteFormVisible = true;
            formState.headerTitle = 'Delete Project Group';
            formState.themeColor = 'alert';
            formState.modalContent = 'Are you sure you want to delete this Project group?';
        };

        const projectGroupDeleteFormConfirm = () => {
            // @ts-ignore
            fluentApi.identity().projectGroup().delete().setId(treeApiHandler.ts.metaState.firstSelectedNode.data.id)
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Delete Project Group',
                        duration: 2000,
                        speed: 1000,
                    });
                    treeApiHandler.ts.treeRef.value.deleteNode(treeApiHandler.ts.metaState.firstSelectedNode);
                    treeApiHandler.ts.metaState.selectedNode = null;
                })
                .catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: 'Delete Request Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                });
            formState.projectGroupDeleteFormVisible = false;
        };

        const openProjectGroupForm = (isRoot) => {
            if (isRoot) {
                formState.isRoot = true;
            }
            formState.projectGroupFormVisible = true;
        };

        const projectGroupFormConfirm = (item) => {
            let projectGroupId;
            if (formState.isRoot) projectGroupId = null;
            else projectGroupId = state.hoveredId;
            // treeApiHandler.ts.metaState.firstSelectedNode.data.id
            fluentApi.identity().projectGroup().create().setParameter({
                parent_project_group_id: projectGroupId,
                ...item,
            })
                .execute()
                .then((resp) => {
                    console.debug('success resp', resp);
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Create Project Group',
                        duration: 2000,
                        speed: 1000,
                    });
                    item.id = resp.data.project_group_id;
                    item.item_type = 'PROJECT_GROUP';
                    const newNode = new TreeItem(item.name, item, undefined, undefined, undefined, true);
                    if (formState.isRoot) treeApiHandler.ts.treeRef.value.addNode(undefined, newNode);
                    if (!formState.isRoot && !state.hoveredNode.isBatch) treeApiHandler.ts.treeRef.value.addNode(state.hoveredNode, newNode);
                })
                .catch((resp) => {
                    console.debug(resp);
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Add Fail',
                        text: 'Request Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                });
            formState.projectGroupFormVisible = false;
        };

        const openProjectForm = () => {
            formState.projectFormVisible = true;
        };
        const projectFormConfirm = (item) => {
            fluentApi.identity().project().create().setParameter({
                //@ts-ignore
                project_group_id: treeApiHandler.ts.metaState.firstSelectedNode.data.id,
                ...item,
            })
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Create Project',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: 'Request Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .finally(() => {
                    state.hasChildProject = true;
                    apiHandler.getData();
                });
            formState.projectFormVisible = false;
        };

        return {
            treeRef: treeApiHandler.ts.treeRef,
            treeApiHandler,
            treeState,
            ...toRefs(state),
            ...toRefs(projectState),
            ...toRefs(formState),
            skeletons: _.range(3),
            selected,
            hovered,
            clickCard,
            clickServiceAccount,
            cardSummary,
            projectSummary,
            openProjectForm,
            apiHandler,
            openProjectGroupDeleteForm,
            projectGroupDeleteFormConfirm,
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
        overflow-x: hidden;
        .add-btn {
            cursor: pointer;
        }
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
        .delete-btn {
            cursor: pointer;
        }
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
        .project-group-name {
            @apply text-gray-500;
            font-size: .75rem;
            margin-bottom: .25rem;
        }
        #project-name {
            font-size: 1.12rem;
            font-weight: bold;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-bottom: 1.3rem;
        }
        .provider-icon {
            max-width: 1.5rem;
            max-height: 1.5rem;
            display: inline;
            margin-right: .5rem;
        }

        .empty-providers {
            p {
                @apply text-secondary;
                font-size: 0.87rem;
            }
            .btn_circle_plus_blue {
                margin-right: 0.5rem;
            }
        }
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
    }

    .tool {
        justify-content: space-between;
        margin-bottom: 1.5rem;
        .tool-left {
            .tool-left-btn {
                margin-right: 1rem;
            }
        }
    }

    .empty-project {
        @apply text-gray-300 text-center;
        font-size: 1rem;
    }

    .empty-project-grp {
        .title {
            @apply text-primary-dark;
            font-weight: bold;
            font-size: 1.5rem;
            padding-top: 2rem;
            padding-bottom: 1rem;
            line-height: 120%;
        }
        .content {
            font-size: .9rem;
            padding-bottom: 1rem;
            line-height: 150%;
        }
        .content-order {
            font-size: .9rem;
            padding-bottom: 2.5rem;
            line-height: 180%;
        }
    }

</style>
