<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div class="h-full treeSidebar">
                <div class="tree-header flex">
                    PROJECT GROUP
                    <p-i name="ic_plus" color="transparent inherit"
                         width="1rem" height="1rem" class="ml-2 cursor-pointer add-btn"
                         @click="openProjectGroupForm(true)"
                    />
                </div>
                <p-hr style="width:100%;" />
                <p-tree-node v-for="(node, idx) in treeApiHandler.ts.metaState.nodes" :key="idx"
                             v-bind="treeApiHandler.ts.state"
                             :data.sync="node.data"
                             :children.sync="node.children"
                             :state.sync="node.state"
                             @toggle:click="treeApiHandler.toggle"
                             @node:click="treeApiHandler.ts.setSelectedNodes"
                             @row:mouseenter="hovered(...arguments, true)"
                             @row:mouseleave="hovered(...arguments, false)"
                >
                    <template #data="{data}">
                        {{ data.name }}
                    </template>
                    <template #toggle="{state, toggleSize}">
                        <p-i v-if="state.loading" name="ic_working" :width="toggleSize"
                             :height="toggleSize"
                        />
                    </template>
                    <template #toggle-right>
                        <p-i name="ic_tree_project-group" class="project-group-icon"
                             width="0.9rem"
                        />
                    </template>
                    <template #right-extra="{data}">
                        <div v-if="data.id === hoveredId && isHover">
                            <div v-tooltip.top="{content: $t('TREE_TYPE.CREATE_GRP'), delay: {show: 500}}"
                                 class="float-right text-base truncate leading-tight"
                            >
                                <p-icon-button :name="'ic_plus'" class="group-add-btn"
                                               width="1rem" height="1rem"
                                               @click.stop="openProjectGroupForm(false)"
                                />
                            </div>
                        </div>
                    </template>
                </p-tree-node>
            </div>
        </template>
        <template #default>
            <div v-if="treeApiHandler.ts.metaState.firstSelectedNode" class="pb-8 grid-layout">
                <p-toolbox-grid-layout
                    v-bind="apiHandler.gridTS.state"
                    card-height="16rem"
                    :this-page.sync="apiHandler.gridTS.syncState.thisPage"
                    :page-size.sync="apiHandler.gridTS.syncState.pageSize"
                    @changePageNumber="apiHandler.getData()"
                    @changePageSize="apiHandler.getData()"
                    @clickRefresh="apiHandler.getData()"
                    @card:click.self="clickCard"
                >
                    <template #toolbox-top>
                        <div class="project-group">
                            <p>
                                {{ parentGroup }}
                            </p>
                            <PPageTitle :title="currentGroup" use-total-count :total-count="apiHandler.totalCount.value" />
                            <p-icon-button name="ic_transhcan"
                                           width="1.5rem" height="1.5rem" class="delete-btn"
                                           @click="openProjectGroupDeleteForm"
                            />
                            <p-icon-button name="ic_edit-text"
                                           width="1.5rem" height="1.5rem" class="edit-btn"
                                           @click="openProjectGroupEditForm"
                            />
                        </div>
                    </template>
                    <template #toolbox-bottom>
                        <div class="flex flex-row xs:flex-col sm:flex-col md:flex-row lg:flex-row xl:flew-row tool">
                            <div class="flex flex-row flex-wrap w-full tool-left">
                                <div class="tool-left-btn">
                                    <PIconTextButton style-type="primary-dark"
                                                     name="ic_plus_bold"
                                                     @click="openProjectForm"
                                    >
                                        {{ $t('INVENTORY.CRT_PROJ') }}
                                    </PIconTextButton>
                                </div>
                                <div class="tool-left-search">
                                    <p-query-search-bar
                                        :search-text.sync="apiHandler.gridTS.querySearch.state.searchText"
                                        :autocomplete-handler="apiHandler.gridTS.querySearch.acHandler.value"
                                        @newQuery="apiHandler.gridTS.querySearch.addTag"
                                    />
                                </div>
                            </div>
                            <div class="tool-right-checkbox">
                                <div v-tooltip.bottom="{content: 'Show All Projects of Sub Project Groups', delay: {show: 500}}"
                                     class="text-base truncate leading-tight"
                                >
                                    <PCheckBox v-model="showAllProjects" />  <span class="text-sm ml-2 leading-relaxed ">Show All Projects</span>
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
                    </template>
                    <template #no-data>
                        <div class="empty-project">
                            <img class="w-48 mx-auto pt-12 mb-4" src="@/assets/images/illust_astronaut_standing.svg">
                            <p class="text-primary2">
                                Looks like you don't have any Project.
                            </p>
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
                                    <div v-if="item.force_console_data.providers.length == 0" class="empty-providers flex"
                                         @click.stop="goToServiceAccount"
                                    >
                                        <div class="w-6 h-6 bg-blue-100 rounded-full inline-block">
                                            <p-i name="ic_plus_bold" color="inherit"
                                                 width=".75rem" height=".75rem"
                                            />
                                        </div>
                                        <span class="text-sm ml-2"> Add Service Account</span>
                                    </div>
                                    <div v-else-if="item.force_console_data.providers" class="providers">
                                        <img v-for="(url, index) in item.force_console_data.providers" :key="index" :src="url"
                                             class="provider-icon"
                                        >
                                        <span class="w-6 h-6 bg-blue-100 rounded-full inline-block" @click.stop="goToServiceAccount">
                                            <p-i name="ic_plus_bold" color="inherit"
                                                 width=".75rem" height=".75rem"
                                            />
                                        </span>
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
                                    <div v-for="v in skeletons" :key="v" class="flex items-center pb-2">
                                        <p-skeleton class="flex-grow" />
                                        <p-skeleton width="1.5rem" height="1.5rem" class="ml-5 flex-shrink-0" />
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
                        <b>1.</b> Name your project group first. <br>
                        <b>2.</b> Register your project.
                    </p>
                    <p-button style-type="primary-dark"
                              @click="openProjectGroupForm"
                    >
                        <p-i name="ic_plus_bold" color="inherit"
                             width="1rem" height="1rem" class="mr-1 cursor-pointer add-btn"
                        />
                        Create Project Group
                    </p-button>
                </div>
            </div>
            <SProjectGroupCreateFormModal v-if="projectGroupFormVisible" :visible.sync="projectGroupFormVisible"
                                          :update-mode="updateMode" :current-group="currentGroup"
                                          @confirm="projectGroupFormConfirm($event)"
            />
            <SProjectCreateFormModal v-if="projectFormVisible" :visible.sync="projectFormVisible"
                                     :current-project="treeApiHandler.ts.metaState.firstSelectedNode.node.data.id"
                                     :project-group-id="currentGroupId"
                                     @confirm="projectFormConfirm($event)"
            />
            <p-button-modal
                :header-title="headerTitle"
                :centered="true"
                :scrollable="false"
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
    </p-vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';

import _ from 'lodash';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import {
    FILTER_OPERATOR, fluentApi, ListAction, QueryAPI,
} from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ProjectItemResp, ProjectListResp } from '@/lib/fluent-api/identity/project';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store/toolset';
import { ProjectSummaryResp } from '@/lib/fluent-api/statistics';
import { DefaultQSGridQSProps, RouteQuerySearchGridFluentAPI } from '@/lib/api/grid';
import { QSTableACHandlerArgs, QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import {
    getValueHandler,
    makeValueHandlers,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import SProjectCreateFormModal from '@/views/project/project/modules/ProjectCreateFormModal.vue';
import SProjectGroupCreateFormModal from '@/views/project/project/modules/ProjectGroupCreateFormModal.vue';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import { showErrorMessage } from '@/lib/util';
import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import { DefaultQSTreeProps, ProjectNodeState, RouteProjectTreeFluentAPI } from '@/lib/api/tree-node';
import { getBaseNodeState, getDefaultNode, TreeItem } from '@/components/molecules/tree/PTreeNode.toolset';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { propsCopy } from '@/lib/router-query-string';

    interface ProjectCardData{
        projectGroupName: string;
        projectId: string;
        projectName: string;
        providers: string[];
        extraProviders: number;
        summary?: ProjectSummaryResp;
    }

    interface State {
        items: ProjectCardData[];
        isHover: boolean;
        hoveredId: string;
        hoveredNode: TreeItem<ProjectItemResp, ProjectNodeState>|null;
        showAllProjects: boolean;
    }

export default {
    name: 'ProjectPage',
    components: {
        PTreeNode,
        PVerticalPageLayout,
        PButton,
        PI,
        PHr,
        PIconButton,
        PPageTitle,
        PCheckBox,
        PQuerySearchBar,
        PQuerySearchTags,
        PSkeleton,
        PToolboxGridLayout,
        PButtonModal,
        SProjectCreateFormModal,
        SProjectGroupCreateFormModal,
        PIconTextButton,
    },
    props: {
        ...DefaultQSTreeProps,
        ...DefaultQSGridQSProps,
    },
    setup(props, context) {
        const state: UnwrapRef<State> = reactive({
            items: [],
            isHover: false,
            hoveredId: '',
            hoveredNode: null,
            showAllProjects: ref(false),
        });
        const projectState = reactive({
            parentGroup: '',
            currentGroup: '',
            currentGroupId: '',
        });
        const formState = reactive({
            projectGroupFormVisible: false,
            projectFormVisible: false,
            projectGroupDeleteFormVisible: false,
            isRoot: false,
            headerTitle: '',
            themeColor: '',
            modalContent: '',
            updateMode: false,
        });

        const { provider } = useStore();
        provider.getProvider();
        const vm: any = getCurrentInstance() as ComponentInstance;

        /**
             Tree, Project, Statistics API Handler Declaration
             */
        const projectAPI = fluentApi.identity().project();
        // projectAPI.favorite().create().setParameter({ projectId: ['test'] }).execute()
        //     .then(res => console.debug('favorite create', res));
        // projectAPI.favorite().get().execute().then(res => console.debug('favorite', res));
        // projectAPI.favorite().delete().execute().then(res => console.debug('favorite', res));
        // projectAPI.favorite().update().setParameter({ projectGroupId: ['hahaha'] }).execute()
        //     .then(res => console.debug('favorite', res));
        const treeAction = projectAPI.tree()
            .setSortBy('name')
            .setSortDesc(false)
            .setExcludeProject();
        const treeSearchAction = projectAPI.treeSearch();
        const treeApiHandler = new RouteProjectTreeFluentAPI({
            treeAction, treeSearchAction,
        }, {

        }, vm, undefined, undefined);

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

        const setProvider = (resp) => {
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
            return temp;
        };

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
                statisticsAPI.setFilter({
                    key: 'project_id',
                    value: ids,
                    operator: FILTER_OPERATOR.in,
                }).execute().then((rp) => {
                    if (rp.data?.results) {
                        setCard(rp.data.results);
                    }
                });
            }
            resp.data.results = setProvider(resp);
            projectSummary.value = resp.data.results;
            return resp;
        };

        /**
             * QuerySearch Grid Fluent API Declaration
             * QuerySearch Grid API : Grid layout with query search bar & List Action(with fluent API)
             */
        const listAction = projectGroupAPI.listProjects().setTransformer(getCard).setIncludeProvider();
        const isShow = computed(() => treeApiHandler.ts.metaState.firstSelectedNode);

        class ACHandler extends QuerySearchTableACHandler {
            constructor(args: QSTableACHandlerArgs) {
                super(args);
                this.HandlerMap.value = [
                    // ...makeValueHandlers<QueryAPI<any,any>>([
                    //     'name',
                    // ], projectGroupAPI.listProjects().setRecursive(true)),
                    ...makeValueHandlers(['name', 'project_id'],
                        fluentApi
                            .statisticsTest()
                            .resource()
                            .stat()
                            .setResourceType('identity.Project')
                            .setFixFilter({
                                key: 'project_group_id',
                                value: treeApiHandler.ts.metaState.firstSelectedNode.node.data.id,
                                operator: FILTER_OPERATOR.in,
                            })),
                ];
            }
        }
        const args = {
            keys: [
                'project_id',
                'name',
            ],
            suggestKeys: ['project_id', 'name'],
        };

        const apiHandler = new RouteQuerySearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['card-item', 'project-card-item'],
                cardMinWidth: '18.75rem',
                cardHeight: '15rem',
            },
            undefined,
            { handlerClass: ACHandler, args },
            isShow,
            vm,
        );

        /**
             * Set Page Title
             * */
        const setProjectState = ({ node, parent }: TreeItem<ProjectItemResp, ProjectNodeState>) => {
            projectState.currentGroup = node.data.name;
            projectState.currentGroupId = node.data.id;
            if (parent) { projectState.parentGroup = parent.node.data.name; } else { projectState.parentGroup = ''; }
        };


        watch(() => treeApiHandler.ts.metaState.firstSelectedNode, async (after, before) => {
            if ((after && !before) || (after && after.node.data.id !== before.node.data.id)) {
                formState.isRoot = false;
                setProjectState(after);
                apiHandler.action = listAction.setId(after.node.data.id);
                apiHandler.resetAll();
                await apiHandler.getData();
                setProjectState(after);
            }
        });

        watch(() => state.showAllProjects, async (after: boolean, before: boolean) => {
            if (isShow.value && after !== before) {
                apiHandler.action = apiHandler.action.setRecursive(after);
                apiHandler.resetAll();
                await apiHandler.getData();
            }
        });

        const hovered = (item: TreeItem<ProjectItemResp, ProjectNodeState>, matched, e, isHovered: boolean) => {
            formState.isRoot = false;
            state.isHover = isHovered;
            state.hoveredId = item.node.data.id;
            state.hoveredNode = item;
        };

        /**
             * Click Card Item
             */
        const clickCard = (item) => {
            vm.$router.push({
                name: 'projectDetail',
                params: {
                    id: item.project_id,
                    name: item.name,
                    project_group: item.project_group_info,
                    tags: item.tags,
                },
            });
        };

        const goToServiceAccount = () => {
            vm.$router.push({
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
            fluentApi.identity().projectGroup().delete().setId(treeApiHandler.ts.metaState.firstSelectedNode.node.data.id)
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Delete Project Group',
                        duration: 2000,
                        speed: 1000,
                    });
                    treeApiHandler.ts.deleteNode(treeApiHandler.ts.metaState.firstSelectedNode);
                    treeApiHandler.ts.metaState.selectedNodes = [];
                })
                .catch((e) => {
                    showErrorMessage('Fail to Delete Project Group', e, context.root);
                });
            formState.projectGroupDeleteFormVisible = false;
        };

        const openProjectGroupEditForm = () => {
            formState.updateMode = true;
            formState.projectGroupFormVisible = true;
        };

        const openProjectGroupForm = (isRoot) => {
            formState.updateMode = false;
            if (isRoot) {
                formState.isRoot = true;
            }
            formState.projectGroupFormVisible = true;
        };

        const projectGroupFormConfirm = async (item) => {
            if (!formState.updateMode) {
                let projectGroupId;
                if (formState.isRoot) projectGroupId = null;
                else projectGroupId = state.hoveredId;

                try {
                    const resp = await fluentApi.identity().projectGroup().create().setParameter({
                        parent_project_group_id: projectGroupId,
                        ...item,
                    })
                        .execute();
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Create Project Group',
                        duration: 2000,
                        speed: 1000,
                    });
                    item.id = resp.data.project_group_id;
                    item.item_type = 'PROJECT_GROUP';
                    const newNode = getDefaultNode(item, {
                        children: item.has_child,
                        state: {
                            ...getBaseNodeState(),
                            loading: false,
                        },
                    });
                    // add new node to current tree nodes
                    if (formState.isRoot) treeApiHandler.ts.metaState.nodes.push(newNode);
                    else if (state.hoveredNode) {
                        if (Array.isArray(state.hoveredNode.node.children)) {
                            state.hoveredNode.node.children.push(newNode);
                            treeApiHandler.ts.setNodeState(state.hoveredNode, { expanded: true });
                        } else {
                            const res = await treeApiHandler.getData(state.hoveredNode);
                            treeApiHandler.ts.setNodeState(state.hoveredNode, { expanded: true });
                        }
                    }
                } catch (e) {
                    showErrorMessage('Fail to Create Project Group', e, context.root);
                }
            } else {
                // @ts-ignore
                fluentApi.identity().projectGroup().update().setParameter({
                    project_group_id: treeApiHandler.ts.metaState.firstSelectedNode.node.data.id,
                    ...item,
                })
                    .execute()
                    .then((resp) => {
                        context.root.$notify({
                            group: 'noticeTopRight',
                            type: 'success',
                            title: 'Success',
                            text: 'Update Project Group',
                            duration: 2000,
                            speed: 1000,
                        });
                        projectState.currentGroup = item.name;
                        treeApiHandler.ts.metaState.firstSelectedNode.node.data = {
                            ...treeApiHandler.ts.metaState.firstSelectedNode.node.data,
                            name: item.name,
                        };
                    })
                    .catch((e) => {
                        showErrorMessage('Fail to Update Project Group', e, context.root);
                    });
            }
            formState.projectGroupFormVisible = false;
        };

        const openProjectForm = () => {
            formState.projectFormVisible = true;
        };
        const projectFormConfirm = (item) => {
            fluentApi.identity().project().create().setParameter({
                // @ts-ignore
                project_group_id: treeApiHandler.ts.metaState.firstSelectedNode.node.data.id,
                ...item,
            })
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Create Project',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch((e) => {
                    showErrorMessage('Fail to Create a Project', e, context.root);
                })
                .finally(() => {
                    apiHandler.getData();
                });
            formState.projectFormVisible = false;
        };

        const routerHandler = async () => {
            const prop = propsCopy(props);
            treeApiHandler.applyAPIRouter(prop);
            await treeApiHandler.applyDisplayRouter(prop);
            apiHandler.applyAPIRouter(prop);
            await apiHandler.getData();
        };

        onMounted(async () => {
            await routerHandler();
        });

        return {
            treeApiHandler,
            ...toRefs(state),
            ...toRefs(projectState),
            ...toRefs(formState),
            skeletons: _.range(3),
            hovered,
            clickCard,
            goToServiceAccount,
            cardSummary,
            projectSummary,
            openProjectForm,
            apiHandler,
            openProjectGroupDeleteForm,
            projectGroupDeleteFormConfirm,
            openProjectGroupEditForm,
            projectFormConfirm,
            openProjectGroupForm,
            projectGroupFormConfirm,
            routerHandler,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .tree-header {
        @apply font-semibold text-sm text-gray-500 ml-5 mt-6 mb-4 overflow-x-hidden overflow-y-hidden;
    }

    ::v-deep .basic {
       @apply mx-3 mt-1 ;
    }

    ::v-deep .group-add-btn {
        @apply float-right mr-1;
        max-width: 1.5rem;
        max-height: 1.5rem;
        min-width: 1.5rem;
        min-height: 1.5rem;
    &:hover {
         color: inherit;
     }
    &:not(:disabled):not(.disabled):hover {
         @apply bg-blue-300 border-blue-300;
     }
    }

    ::v-deep .card-item {
        @apply bg-white border border-gray-200;
        border-radius: 2px;
        cursor: pointer;
    &:hover {
         @apply border-l border-secondary bg-blue-200;
         cursor: pointer;
     }
    }

    .project-group {
        & p {
              @apply text-xs text-gray;
          }
        & span {
              @apply text-2xl font-bold pb-2;
        }
        .delete-btn {
            @apply text-black -mt-2 ml-2 cursor-pointer;
            &:hover {
                 @apply text-white;
             }
        }
    }

    .project-group-icon {
        @apply ml-2;
        padding-top: 3px;
        margin-right: 5px;
    }

    .empty {
        @apply flex-col text-center justify-start;
    }

    .project-description {
        @apply mx-6 mt-6;

        .project-group-name {
            @apply text-gray-500 text-xs mb-1;
        }
        #project-name {
            @apply text-lg font-bold truncate pb-5 overflow-hidden;
        }
        .provider-icon {
            @apply mr-4 inline;
            max-width: 1.5rem;
            max-height: 1.5rem;
            min-height: 1.5rem;
        }
        .providers {
            @apply relative text-blue-600 whitespace-no-wrap;
            max-height: 1.5rem;
            min-height: 1.5rem;
            width: fit-content;
            span { padding:0.125rem 0.375rem; }
            &:hover {
                 @apply text-secondary font-bold;
                span {
                    @apply bg-blue-300 ;
                }
            }
    }

    .empty-providers {
        @apply relative text-blue-600;
        width: fit-content;
            div { padding:0.125rem 0.375rem; }
            &:hover {
                 @apply text-secondary font-bold;
                     div{
                         @apply bg-blue-300 ;
                     }
            }
            span { line-height:1.75; }
        }
    }

    .solid {
        @apply border-l border-gray-100 mt-5 ml-0;
    }

    .project-summary {
        @apply mt-4 mx-6;
    .summary-item-text {
        @apply text-sm text-left mb-4 inline-block;
    }

    .summary-item-num {
        @apply text-blue-600 text-base font-bold text-right mb-3 inline-block float-right;
    }
    }

    .tool {
        @apply mb-6 justify-between;
    .tool-left {
    .tool-left-btn {
        @apply mr-4;
    }
    .tool-left-search {
        @apply flex-1;
    @screen lg {
        @apply max-w-lg;
    }
    }
    }
    .tool-right-checkbox {
        @apply whitespace-no-wrap self-center;
    }
    }

    .empty-project {
        @apply text-gray-300 text-center text-base;
    }

    .empty-project-grp {
        line-height:1.5;
        .title {
            @apply text-primary-dark font-bold text-2xl pt-8 pb-4 leading-tight;
        }
        .content {
            @apply text-gray-600;
        }
        .content-order {
            @apply text-base pb-8 text-left m-auto max-w-64;
        }
    }

</style>
