<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div class="h-full treeSidebar" :style="{width:width+'px'}">
                <div class="tree-header">
                    PROJECT GROUP
                    <p-i name="ic_plus" color="transparent inherit"
                         width="1rem" height="1rem" class="cursor-pointer add-btn"
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
                        <p-i :name="'ic_tree_folder'"
                             color="transparent inherit"
                             width="1rem" height="1rem"
                        />
                    </template>
                    <template #extra="{node, hoveredNode}">
                        <span v-if="node===hoveredNode"
                              @mouseenter.stop="hovered(node)"
                              @click.stop="openProjectGroupForm(false)"
                        >
                            <div v-tooltip.bottom="{content: $t('TREE_TYPE.CREATE_GRP'), delay: {show: 500}}"
                                 class="text-base truncate leading-tight"
                            >
                                <p-icon-button :name="'ic_plus'" class="group-add-btn"
                                               width="1rem" height="1rem"
                                />
                            </div>
                        </span>
                    </template>
                </p-tree>
            </div>
        </template>
        <template #default>
            <div v-if="treeApiHandler.ts.metaState.firstSelectedNode" class="pb-8 grid-layout">
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
                        <div class="project-group">
                            <p>
                                {{ parentGroup }}
                            </p>
                            <PPageTitle :title="currentGroup" use-total-count :total-count="apiHandler.totalCount.value" />
                            <p-icon-button v-if="!hasChildProject && !hasChildProjectGroup" name="ic_transhcan"
                                           width="1.5rem" height="1.5rem" class="delete-btn"
                                           @click="openProjectGroupDeleteForm"
                            />
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
                                    <PCheckBox v-model="showAllProjects" />  <span class="mx-3 leading-relaxed">Show All Projects</span>
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
                                         @click.stop="clickServiceAccount"
                                    >
                                        <p>
                                            <p-simple-icon-button :normal-icon-name="'btn_circle_plus_blue'"
                                                                  :hovered-icon-name="'btn_circle_plus_blue--hover'"
                                                                  width="24px" height="24px"
                                                                  class="add-service-account-btn"
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
                        1. Name your project group first. <br>
                        2. Register your project.
                    </p>
                    <p-button style-type="primary-dark"
                              @click="openProjectGroupForm"
                    >
                        <p-i name="ic_plus" color="transparent inherit"
                             width="1rem" height="1rem" class="mt-1 cursor-pointer add-btn"
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
    </p-vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import { ProjectTreeFluentAPI } from '@/lib/api/tree';
import TreeItem, { TreeState } from '@/components/molecules/tree-new/ToolSet';
import _ from 'lodash';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/ToolboxGridLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PSimpleIconButton from '@/components/molecules/buttons/SimpleIconButton.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
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
import { showErrorMessage } from '@/lib/util';

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
        hoveredId: string;
        hoveredNode: any;
        hasChildProject: boolean;
        hasChildProjectGroup: boolean;
        showAllProjects: boolean;
    }

export default {
    name: 'ProjectPage',
    components: {
        PVerticalPageLayout,
        PTree,
        PButton,
        PI,
        PIconButton,
        PSimpleIconButton,
        PPageTitle,
        PCheckBox,
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
            items: [],
            hoveredId: '',
            hoveredNode: {},
            hasChildProject: true,
            hasChildProjectGroup: true,
            showAllProjects: ref(false),
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
            isShow,
        );

        /**
         * Check Child Project(Group)
         * */
        const checkChildProject = (resp) => {
            const projectTotal = resp?.data?.total_count;
            if (projectTotal > 0) state.hasChildProject = true;
            else state.hasChildProject = false;
        };

        const checkChildProjectGroup = async () => {
            const resp = await projectGroupAPI.list().setFilter({ key: 'parent_project_group_id', operator: '=', value: treeApiHandler.ts.metaState.firstSelectedNode.data.id }).execute();
            if (resp.data.total_count > 0) state.hasChildProjectGroup = true;
            else state.hasChildProjectGroup = false;
        };

        /**
         * Set Page Title
         * */
        const setProjectState = (item) => {
            projectState.currentGroup = item.data.name;
            if (item.parent) { projectState.parentGroup = item.parent.data.name; } else { projectState.parentGroup = ''; }
        };

        /**
         * Click or Hover Tree Item
         */
        const selected = async (item) => {
            formState.isRoot = false;
            treeApiHandler.ts.getSelectedNode(item);
            setProjectState(item);
            await checkChildProjectGroup();
        };

        watch(() => treeApiHandler.ts.metaState.firstSelectedNode, async (after: any, before: any) => {
            state.showAllProjects = false;
            if ((after && !before) || (after && after.data.id !== before.data.id)) {
                apiHandler.action = listAction.setId(after.data.id);
                apiHandler.resetAll();
                const resp = await apiHandler.getData();
                checkChildProject(resp);
            }
        });

        watch(() => state.showAllProjects, async (after: boolean, before: boolean) => {
            if (isShow.value && after !== before) {
                apiHandler.action = apiHandler.action.setRecursive(after);
                apiHandler.resetAll();
                const resp = await apiHandler.getData();
                checkChildProject(resp);
            }
        });

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
                .catch((e) => {
                    showErrorMessage('Fail to Delete Project Group', e, context.root);
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
            fluentApi.identity().projectGroup().create().setParameter({
                parent_project_group_id: projectGroupId,
                ...item,
            })
                .execute()
                .then((resp) => {
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
                .catch((e) => {
                    showErrorMessage('Fail to Create Project Group', e, context.root);
                });
            formState.projectGroupFormVisible = false;
        };

        const openProjectForm = () => {
            formState.projectFormVisible = true;
        };
        const projectFormConfirm = (item) => {
            fluentApi.identity().project().create().setParameter({
                // @ts-ignore
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
                .catch((e) => {
                    showErrorMessage('Fail to Create a Project', e, context.root);
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
    .tree-header {
        @apply text-sm font-semibold text-gray-500 ml-5 mt-6 mb-4 overflow-x-hidden;
    }

    ::v-deep .group-add-btn {
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
            @apply text-xs pt-2 pb-3;
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
            @apply mr-2 inline;
            max-width: 1.5rem;
            max-height: 1.5rem;
        }
        .providers {
            max-height: 1.5rem;
            min-height: 1.5rem;
        }

        .empty-providers {
            p {
                @apply relative z-10 text-secondary text-sm;
                max-height: 1.5rem;
                min-height: 1.5rem;
                .add-service-account-btn {
                    @apply relative z-10 mr-2;
                }
                &:hover {
                     @apply font-bold;
                 }
            }
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
            @apply whitespace-no-wrap self-end;
        }
    }

    .empty-project {
        @apply text-gray-300 text-center text-base;
    }

    .empty-project-grp {
        .title {
            @apply text-primary-dark font-bold text-2xl pt-8 pb-4;
            line-height: 120%;
        }
        .content {
            @apply text-sm font-hairline pb-4;
            line-height: 150%;
        }
        .content-order {
            @apply text-base pb-10;
            line-height: 180%;
        }
    }

</style>
