<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div class="left-sidebar">
                <div class="side-item">
                    <header>
                        <span class="title">Search</span>
                    </header>
                    <project-search :search-text.sync="searchText"
                                    :project-group="searchedProjectGroup"
                                    @search="onSearch"
                    />
                </div>

                <div class="side-item">
                    <header>
                        <span class="title">Project Group</span>
                        <p-button class="action-btn" @click="openProjectGroupForm(null)">
                            Create
                        </p-button>
                    </header>
                    <project-group-tree ref="treeRef"
                                        @select="onSelectTreeItem"
                                        @create="openProjectGroupForm"
                    />
                </div>
            </div>
        </template>
        <template #default>
            <div>
                <div class="parents-info">
                    <span v-if="projectGroupNavigation.length > 0" class="group-name">
                        <p-page-navigation :routes="projectGroupNavigation" @click="onProjectGroupNavClick" />
                    </span>
                    <span v-else class="group-name">
                        <span class="text">Projects</span>
                    </span>
                </div>
                <p-page-title :title="searchedProjectGroup ? searchedProjectGroup.name
                                  : 'All Projects'"
                              use-total-count
                              :total-count="apiHandler.totalCount.value"
                >
                    <template #extra-area>
                        <div class="btns">
                            <p-dropdown-menu-btn v-if="searchedProjectGroup"
                                                 :menu="settingMenu"
                                                 button-only
                                                 button-icon="ic_setting"
                                                 button-style-type="primary-dark"
                                                 @edit:select="openProjectGroupEditForm"
                                                 @delete:select="openProjectGroupDeleteForm"
                            />
                            <p-icon-text-button v-if="searchedProjectGroup"
                                                style-type="primary-dark"
                                                name="ic_plus_bold"
                                                @click="openProjectForm"
                            >
                                {{ $t('INVENTORY.CRT_PROJ') }}
                            </p-icon-text-button>
                        </div>
                    </template>
                </p-page-title>
            </div>
            <div class="pb-8">
                <p-toolbox-grid-layout
                    v-bind="apiHandler.gridTS.state"
                    card-height="11.25rem"
                    :this-page.sync="apiHandler.gridTS.syncState.thisPage"
                    :page-size.sync="apiHandler.gridTS.syncState.pageSize"
                    @changePageNumber="apiHandler.getData()"
                    @changePageSize="apiHandler.getData()"
                    @clickRefresh="apiHandler.getData()"
                >
                    <template #toolbox-left>
                        <div class="flex items-center">
                            <div v-tooltip.bottom="{content: 'Show All Projects of Sub Project Groups', delay: {show: 500}}"
                                 class="text-base truncate leading-tight"
                            >
                                <p-check-box v-model="showAllProjects">
                                    <span class="show-all">Show All Projects</span>
                                </p-check-box>
                            </div>
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
                        <router-link :to="goToProjectDetail(item)">
                            <div v-if="item">
                                <div class="project-description">
                                    <div class="project">
                                        <div class="project-group-name">
                                            <template v-if="parentGroups.length > 0">
                                                {{ parentGroups[parentGroups.length - 1].name }} >
                                            </template>
                                            {{ item.project_group_info.name }}
                                        </div>
                                        <p id="project-name">
                                            {{ item.name }}
                                        </p>

                                        <div class="project-summary">
                                            <div v-if="cardSummary[item.project_id]" class="summary-item">
                                                <span class="summary-item-text">Server</span><span class="summary-item-num">{{ cardSummary[item.project_id].servers_count }}</span>
                                                <span class="mx-2 text-gray-300 divider">|</span>
                                                <span class="summary-item-text">Cloud Services<span class="summary-item-num">{{ cardSummary[item.project_id].cloud_services }}</span></span><br>
                                            </div>
                                            <div v-else class="loading">
                                                <div v-for="v in skeletons" :key="v" class="flex items-center pb-2">
                                                    <p-skeleton class="flex-grow" />
                                                    <p-skeleton width="1.5rem" height="1.5rem" class="ml-5 flex-shrink-0" />
                                                </div>
                                            </div>
                                        </div>

                                        <hr class="solid">
                                        <div v-if="item.force_console_data.providers.length == 0" class="empty-providers flex"
                                             @click.stop="goToServiceAccount"
                                        >
                                            <div class="w-6 h-6 bg-blue-100 rounded-full inline-block">
                                                <p-i name="ic_plus"
                                                     width=".75rem" height=".75rem"
                                                />
                                            </div>
                                            <span class="ml-2"> Add Service Account</span>
                                        </div>
                                        <div v-else-if="item.force_console_data.providers" class="providers">
                                            <span>Service Accounts</span>
                                            <img v-for="(url, index) in item.force_console_data.providers" :key="index" :src="url"
                                                 class="provider-icon"
                                            >
                                            <span class="w-6 h-6 bg-blue-100 rounded-full inline-block provider-add-btn" @click.stop="goToServiceAccount">
                                                <p-i name="ic_plus"
                                                     width=".75rem" height=".75rem"
                                                />
                                            </span>
                                            <span v-if="item.force_console_data.extraProviders"> + {{ item.force_console_data.extraProviders }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                    </template>
                </p-toolbox-grid-layout>
            </div>
            <!--            <div v-else class="empty">-->
            <!--                <img class="w-40 mx-auto mb-4 pt-8" src="@/assets/images/illust_astronaut_walking.svg">-->
            <!--                <div class="empty-project-grp">-->
            <!--                    <p class="title">-->
            <!--                        Let's begin your <br>-->
            <!--                        resource management!<br>-->
            <!--                    </p>-->
            <!--                    <p class="content">-->
            <!--                        Getting started with grouping your scattered resource and <br>-->
            <!--                        accounts with your own project.<br><br>-->
            <!--                    </p>-->
            <!--                    <p class="content-order">-->
            <!--                        <b>1.</b> Name your project group first. <br>-->
            <!--                        <b>2.</b> Register your project.-->
            <!--                    </p>-->
            <!--                    <p-button style-type="primary-dark"-->
            <!--                              @click="openProjectGroupForm"-->
            <!--                    >-->
            <!--                        <p-i name="ic_plus_bold" color="inherit"-->
            <!--                             width="1rem" height="1rem" class="mr-1 cursor-pointer add-btn"-->
            <!--                        />-->
            <!--                        Create Project Group-->
            <!--                    </p-button>-->
            <!--                </div>-->
            <!--            </div>-->
            <s-project-group-create-form-modal v-if="projectGroupFormVisible"
                                               :id="updateMode && searchedProjectGroup ?
                                                   searchedProjectGroup.id : undefined"
                                               :parent="createTargetNode ? createTargetNode.node.data
                                                   : null"
                                               :visible.sync="projectGroupFormVisible"
                                               :update-mode="updateMode"
                                               @create="onProjectGroupCreate"
                                               @update="onProjectGroupUpdate"
            />
            <s-project-create-form-modal v-if="projectFormVisible && searchedProjectGroup"
                                         :visible.sync="projectFormVisible"
                                         :current-project="searchedProjectGroup.id"
                                         :project-group-id="searchedProjectGroup.id"
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
    computed,
    getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';

import {
    get, zipObject, range, reverse,
} from 'lodash';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import {
    FILTER_OPERATOR, fluentApi, QueryAPI,
} from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ProjectItemResp, ProjectListResp } from '@/lib/fluent-api/identity/project';
import { AxiosResponse } from 'axios';
import { useStore } from '@/store/toolset';
import { ProjectSummaryResp } from '@/lib/fluent-api/statistics';
import { SearchGridFluentAPI } from '@/lib/api/grid';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import SProjectCreateFormModal from '@/views/project/project/modules/ProjectCreateFormModal.vue';
import SProjectGroupCreateFormModal from '@/views/project/project/modules/ProjectGroupCreateFormModal.vue';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import { showErrorMessage } from '@/lib/util';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds, queryTagsToQueryString,
} from '@/lib/router-query-string';
import ProjectSearch from '@/views/project/project/modules/ProjectSearch.vue';
import {
    ProjectGroup,
    ProjectTreeItem, SearchResult,
} from '@/views/project/project/modules/ProjectSearch.toolset';
import ProjectGroupTree from '@/views/project/project/modules/ProjectGroupTree.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import { MenuItem } from '@/components/organisms/context-menu/PContextMenu.toolset';
import { Location } from 'vue-router';

    interface ProjectCardData{
        projectGroupName: string;
        projectId: string;
        projectName: string;
        providers: string[];
        extraProviders: number;
        summary?: ProjectSummaryResp;
    }

    interface State {
        searchText: string;
        items: ProjectCardData[];
        settingMenu: MenuItem[];
        showAllProjects: boolean;
        searchedProjectGroup: ProjectGroup|null;
        selectedTreeItem: ProjectTreeItem|null;
        parentGroups: Readonly<ProjectGroup[]>;
        projectGroupNavigation: any; // TODO: routeNavigation type
        treeRef: any;
    }

const getParentGroup = (item: ProjectTreeItem, res: ProjectGroup[] = []): ProjectGroup[] => {
    if (item) {
        res.push(item.node.data);
        if (item.parent) return getParentGroup(item.parent, res);
        return res;
    }
    return res;
};

export default {
    name: 'ProjectPage',
    components: {
        PPageNavigation,
        PDropdownMenuBtn,
        PButton,
        ProjectGroupTree,
        ProjectSearch,
        PVerticalPageLayout,
        PI,
        PPageTitle,
        PCheckBox,
        PSkeleton,
        PToolboxGridLayout,
        PButtonModal,
        SProjectCreateFormModal,
        SProjectGroupCreateFormModal,
        PIconTextButton,
    },
    setup(props, context) {
        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;

        const state: UnwrapRef<State> = reactive({
            searchText: '',
            items: [],
            settingMenu: [
                { name: 'edit', label: 'Edit Group Name', type: 'item' },
                { name: 'delete', label: 'Delete This Group', type: 'item' },
            ],
            showAllProjects: ref(false),
            searchedProjectGroup: null,
            selectedTreeItem: null,
            parentGroups: computed(() => {
                if (state.selectedTreeItem && state.selectedTreeItem.parent) {
                    return reverse(getParentGroup(state.selectedTreeItem.parent));
                } return [];
            }),
            treeRef: null,
            projectGroupNavigation: computed(() => {
                const result = state.parentGroups.map(d => ({
                    name: d.name,
                    data: d,
                }));
                if (state.searchedProjectGroup) {
                    result.push({
                        name: state.searchedProjectGroup.name,
                        data: state.searchedProjectGroup,
                    });
                }
                return result;
            }),
        });

        const formState = reactive({
            projectGroupFormVisible: false,
            projectFormVisible: false,
            projectGroupDeleteFormVisible: false,
            headerTitle: '',
            themeColor: '',
            modalContent: '',
            updateMode: false,
            createTargetNode: null as ProjectTreeItem|null,
        });

        const { provider } = useStore();
        provider.getProvider();

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
                const providers = (it.providers as string[]).map(name => get(provider.state.providers, [name, 'icon']));
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
                cardSummary.value = reactive(zipObject(ids));
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
        const listAllAction = projectAPI.list().setIncludeProvider().setTransformer(getCard);


        const apiHandler = new SearchGridFluentAPI(
            listAction,
            {
                cardClass: () => ['card-item', 'project-card-item'],
                cardMinWidth: '18.75rem',
                cardHeight: '15rem',
            },
        );

        watch(() => state.showAllProjects, async (after: boolean, before: boolean) => {
            if (after !== before) {
                // @ts-ignore
                apiHandler.action = apiHandler.action.setRecursive(after);
                apiHandler.resetAll();
                await apiHandler.getData();
            }
        }, { lazy: true });


        /**
             * Click Card Item
             */
        const onClickCard = (item) => {
            vm.$router.push({
                name: 'projectDetail',
                params: {
                    id: item.project_id,
                },
            } as Location);
        };

        const goToProjectDetail = (item) => {
            const navigation = state.projectGroupNavigation.map(d => ({ name: d.name, data: d }));
            const res: Location = {
                name: 'projectDetail',
                params: {
                    id: item.project_id,
                    navigation,
                },
            };
            return res;
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

        const projectGroupDeleteFormConfirm = async () => {
            try {
                await fluentApi.identity().projectGroup().delete()
                    .setId(state.searchedProjectGroup?.id as string)
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Delete Project Group',
                    duration: 2000,
                    speed: 1000,
                });
                state.treeRef.deleteSelectedNode();
            } catch (e) {
                showErrorMessage('Fail to Delete Project Group', e, context.root);
            } finally {
                formState.projectGroupDeleteFormVisible = false;
            }
        };

        const openProjectGroupEditForm = () => {
            formState.updateMode = true;
            formState.projectGroupFormVisible = true;
        };

        const openProjectGroupForm = (createTargetNode: ProjectTreeItem|null) => {
            formState.updateMode = false;
            formState.createTargetNode = createTargetNode;
            formState.projectGroupFormVisible = true;
        };

        const onProjectGroupUpdate = async (item: ProjectGroup) => {
            if (state.searchedProjectGroup) state.searchedProjectGroup.name = item.name;
            state.treeRef.updateSelectedNode(item);
            formState.projectGroupFormVisible = false;
        };
        const onProjectGroupCreate = async (item: ProjectGroup) => {
            const newItem: ProjectItemResp = {
                ...item,
                item_type: 'PROJECT_GROUP',
                has_child: false,
            };

            await state.treeRef.addNode(newItem, formState.createTargetNode);
            formState.projectGroupFormVisible = false;
        };

        const onProjectGroupNavClick = async (item: {name: string; data: ProjectGroup}) => {
            state.searchedProjectGroup = item.data;
            await state.treeRef.findNode(item.data.id);
        };

        const openProjectForm = () => {
            formState.projectFormVisible = true;
        };

        const projectFormConfirm = async (item) => {
            try {
                await fluentApi.identity().project().create().setParameter({
                    project_group_id: state.searchedProjectGroup?.id,
                    ...item,
                })
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Create Project',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                showErrorMessage('Fail to Create a Project', e, context.root);
            } finally {
                formState.projectFormVisible = false;
                await apiHandler.getData();
            }
        };


        const listProjects = async (value: string|null, group: ProjectGroup|null = null) => {
            let api;

            if (group) {
                api = listAction.setId(group.id);
            } else {
                api = listAllAction;
            }
            if (value) api = api.setFixFilter({ key: 'name', value, operator: '' });

            apiHandler.action = api;
            apiHandler.resetAll();
            await apiHandler.getData();
        };

        /** Query String */
        const queryRefs = {
            ...makeQueryStringComputeds(state, {
                searchedProjectGroup: {
                    key: 'select_pg',
                    getter: (item: null|ProjectGroup) => {
                        if (item) return item.id;
                        return null;
                    },
                    disableSetter: true,
                },
            }),
            search: makeQueryStringComputed(ref(undefined), {
                key: 'search',
            }),
        };

        /** Search */
        const onSearch = async (res: SearchResult) => {
            apiHandler.gridTS.syncState.loading = true;

            if ((res.projectGroup && !state.searchedProjectGroup)
                || (res.projectGroup && state.searchedProjectGroup && res.projectGroup.id !== state.searchedProjectGroup.id)) {
                await state.treeRef.findNode(res.projectGroup.id);
            } else if (!res.projectGroup && state.searchedProjectGroup) {
                await state.treeRef.listNodes();
            }
            state.searchedProjectGroup = res.projectGroup;
            await listProjects(res.value, res.projectGroup);

            queryRefs.search.value = res.value;
        };

        const onSelectTreeItem = async (e: ProjectTreeItem|null) => {
            state.selectedTreeItem = e;
            if (e) {
                state.searchedProjectGroup = {
                    id: e.node.data.id,
                    name: e.node.data.name,
                };
                await listProjects(state.searchText, state.searchedProjectGroup);
            } else {
                state.searchedProjectGroup = null;
                await listProjects(state.searchText as string, null);
            }
        };


        const init = async () => {
            // set search text by query string
            state.searchText = vm.$route.query.search as string;

            // set searched project group by query string
            const pgId = vm.$route.query.select_pg as string|null;
            let projectGroup: ProjectGroup|null = null;
            if (pgId) {
                const res = await fluentApi.identity().projectGroup().get()
                    .setId(pgId)
                    .execute();

                projectGroup = {
                    id: pgId,
                    name: res.data.name,
                };
            }
            state.searchedProjectGroup = projectGroup;

            // init tree nodes
            if (projectGroup) await state.treeRef.findNode(projectGroup.id);
            else await state.treeRef.listNodes();

            // init project data
            await listProjects(state.searchText, projectGroup);
        };

        onMounted(async () => {
            await init();
        });

        return {
            ...toRefs(state),
            ...toRefs(formState),
            skeletons: range(3),
            // onClickCard,
            goToProjectDetail,
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
            onSearch,
            onSelectTreeItem,
            onProjectGroupUpdate,
            onProjectGroupCreate,
            onProjectGroupNavClick,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .left-sidebar {
        @apply h-full relative;
    }
    .side-item {
        header {
            @apply flex pl-4 pt-8 pb-3 mb-3 border-b border-gray-200 items-center;
        }
        .title {
            @apply text-sm text-gray-500 font-semibold capitalize;
            line-height: 1.2;
        }
        .icon-help {
            @apply ml-2;
            cursor: help;
        }
        .action-btn {
            @apply ml-auto justify-end;
            height: auto;
            font-size: 0.75rem;
            line-height: 1.2;
            &:hover {
                @apply text-secondary;
                cursor: pointer;
            }
        }
    }

    .p-page-title::v-deep {
        @apply flex w-full pb-5 border-b border-gray-200;
        .extra {
            @apply inline-flex flex-grow justify-between items-center;
        }
        .btns {
            @apply inline-flex items-center;
            .icon-text-button {
                @apply ml-4;
            }
        }
    }

    .parents-info {
        @apply flex items-center mb-3 text-gray-900;
        height: 1rem;
        .group-name {
            @apply inline-flex items-center text-xs;
        }
        .text {
            @apply opacity-50;
            &.link {
                @apply cursor-pointer;
                &:hover {
                    @apply opacity-100;
                }
            }
        }
    }

    .show-all {
        @apply text-sm ml-2 leading-relaxed;
    }

    ::v-deep .card-item {
        @apply bg-white border border-gray-200 overflow-visible rounded cursor-pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        &:hover {
            @apply border-l border-gray-200 bg-blue-100;
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
            @apply mx-1;
    }

    .empty {
        @apply flex-col text-center justify-start;
    }

    .project-description {
        @apply mx-4 mt-6;
        .project {
            @apply mb-4;
            .project-group-name {
                @apply text-gray-500 text-xs mb-1;
            }
            #project-name {
                @apply text-lg font-bold truncate pb-6 overflow-hidden;
            }
            .provider-icon {
                @apply mr-4 inline;
                max-width: 1.25rem;
                max-height: 1.25rem;
                min-height: 1.25rem;
            }
            .providers {
                @apply relative text-xs text-gray-500 whitespace-no-wrap;
                max-height: 1.5rem;
                min-height: 1.5rem;
                width: fit-content;
                .provider-add-btn {
                    @apply text-gray-900;
                    &:hover {
                        @apply bg-blue-300;
                    }
                }
                span {
                    @apply mr-2;
                    padding: 0.125rem 0.375rem;
                }
            }
            .project-summary {
                @apply mb-6;
                .summary-item-text {
                    @apply text-sm text-left inline-block;
                }
                .summary-item-num {
                    @apply ml-2 font-bold;
                }
            }
        }
        .solid {
            @apply border-l border-gray-100 mt-5 mb-4 ml-0;
        }

    .empty-providers {
        @apply relative text-xs text-gray-900;
        width: fit-content;
            div { padding: 0.125rem 0.375rem; }
            &:hover {
                 @apply text-secondary font-bold;
                     div {
                         @apply bg-blue-300 ;
                     }
            }
            span { line-height: 1.75; }
        }
    }

.tool {
    @apply justify-between mb-6;
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

</style>
