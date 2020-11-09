<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div class="left-sidebar">
                <div class="side-item">
                    <header>
                        <span class="title">{{ $t('PROJECT.LANDING.SEARCH') }}</span>
                    </header>
                    <project-search :search-text.sync="searchText"
                                    :project-group="searchedProjectGroup"
                                    @search="onSearch"
                    />
                </div>

                <div class="side-item">
                    <header>
                        <span class="title">{{ $t('PROJECT.LANDING.PROJECT_GROUPS') }}</span>
                        <p-button class="action-btn" @click="openProjectGroupForm(null)">
                            <p-i name="ic_plus" width="1rem" height="1rem"
                                 color="transparent inherit"
                            /> {{ $t('PROJECT.LANDING.CREATE') }}
                        </p-button>
                    </header>
                    <project-group-tree ref="treeRef"
                                        @select="onSelectTreeItem"
                                        @create="openProjectGroupForm"
                                        @list="onProjectGroupList"
                    />
                </div>
            </div>
        </template>
        <template #default>
            <div class="parents-info">
                <span v-if="projectGroupNavigation.length > 0" class="group-name">
                    <p-page-navigation :routes="projectGroupNavigation" @click="onProjectGroupNavClick" />
                </span>
            </div>
            <p-page-title :title="searchedProjectGroup ? searchedProjectGroup.name
                              : $t('PROJECT.LANDING.ALL_PROJECT')"
                          use-total-count
                          :total-count="listState.totalCount"
            >
                <template #extra-area>
                    <div class="btns">
                        <p-icon-text-button v-if="!searchedProjectGroup"
                                            style-type="primary-dark"
                                            outline
                                            name="ic_plus_bold"
                                            @click="openProjectGroupForm(null)"
                        >
                            {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                        </p-icon-text-button>
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
                            {{ $t('PROJECT.LANDING.CREATE_PROJECT') }}
                        </p-icon-text-button>
                    </div>
                </template>
            </p-page-title>
            <div class="pb-8">
                <p-toolbox-grid-layout card-height="11.25rem"
                                       card-min-width="18.75rem"
                                       :items="listState.items"
                                       :all-page="listState.allPage"
                                       :loading="listState.loading"
                                       :this-page.sync="listState.thisPage"
                                       :page-size.sync="listState.pageSize"
                                       :total-count="listState.totalCount"
                                       @changePageNumber="getData()"
                                       @changePageSize="getData()"
                                       @clickRefresh="getData()"
                                       @card:click.self="goToProjectDetail"
                >
                    <template #toolbox-left>
                        <div class="flex items-center">
                            <div v-tooltip.bottom="{content: $t('PROJECT.LANDING.SHOW_ALL_TOOLTIP'), delay: {show: 500}}"
                                 class="text-base truncate leading-tight"
                            >
                                <p-check-box v-model="showAllProjects">
                                    <span class="show-all">{{ $t('PROJECT.LANDING.SHOW_ALL') }}</span>
                                </p-check-box>
                            </div>
                        </div>
                    </template>
                    <template #no-data>
                        <div class="empty">
                            <div v-if="noProjectGroup" class="empty-project-grp">
                                <p class="title">
                                    {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_TITLE') }}<br>
                                </p>
                                <p class="content">
                                    {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_CONTENT') }}
                                </p>
                                <p class="content-order">
                                    {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_CONTENT_ORDER') }}
                                </p>
                                <p-button style-type="primary-dark" class="mt-8"
                                          @click="openProjectGroupForm(null)"
                                >
                                    <p-i name="ic_plus_bold" color="inherit"
                                         width="1rem" height="1rem" class="mr-1 cursor-pointer add-btn"
                                    />
                                    {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_CREATE_BTN') }}
                                </p-button>
                            </div>
                            <div v-if="!noProjectGroup && listState.totalCount === 0 && !listState.loading" class="empty-project">
                                <p class="text-primary2">
                                    {{ $t('PROJECT.LANDING.EMPTY_PROJECT_MSG') }}
                                </p>
                            </div>
                        </div>
                    </template>
                    <template #card="{item}">
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
                                            <span class="summary-item-text">{{ $t('PROJECT.LANDING.SERVER') }}</span>
                                            <span class="summary-item-num">{{ cardSummary[item.project_id].servers_count }}</span>
                                            <span class="mx-2 text-gray-300 divider">|</span>
                                            <span class="summary-item-text">{{ $t('PROJECT.LANDING.CLOUD_SERVICES') }}
                                                <span class="summary-item-num">{{ cardSummary[item.project_id].cloud_services }}</span></span><br>
                                        </div>
                                        <div v-else class="skeleton-loading">
                                            <div v-for="v in skeletons" :key="v" class="flex items-center pb-2 pr-15">
                                                <p-skeleton />
                                            </div>
                                        </div>
                                    </div>

                                    <hr class="solid">
                                    <div v-if="item.force_console_data.providers.length === 0" class="empty-providers flex"
                                         @click.stop="goToServiceAccount"
                                    >
                                        <div class="w-6 h-6 bg-blue-100 rounded-full inline-block">
                                            <p-i name="ic_plus"
                                                 width=".75rem" height=".75rem"
                                            />
                                        </div>
                                        <span class="ml-2"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                                    </div>
                                    <div v-else-if="item.force_console_data.providers" class="providers">
                                        <span>{{ $t('PROJECT.LANDING.SERVICE_ACCOUNTS') }}</span>
                                        <img v-for="(url, index) in item.force_console_data.providers" :key="index" :src="url"
                                             class="provider-icon"
                                        >
                                        <span class="provider-add-btn" @click.stop="goToServiceAccount">
                                            <p-i name="ic_plus"
                                                 width=".75rem" height=".75rem"
                                            />
                                        </span>
                                        <span v-if="item.force_console_data.extraProviders"> + {{ item.force_console_data.extraProviders }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </p-toolbox-grid-layout>
            </div>
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
    ComponentRenderProxy,
    computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/common/page-layout/VerticalPageLayout.vue';

import {
    get, zipObject, range, reverse,
} from 'lodash';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { useStore } from '@/store/toolset';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import SProjectCreateFormModal from '@/views/project/project/modules/ProjectCreateFormModal.vue';
import SProjectGroupCreateFormModal from '@/views/project/project/modules/ProjectGroupCreateFormModal.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import {
    makeQueryStringComputeds,
} from '@/lib/router-query-string';
import ProjectSearch from '@/views/project/project/modules/ProjectSearch.vue';
import {
    ProjectGroup,
    ProjectTreeItem, SearchResult,
} from '@/views/project/project/modules/ProjectSearch.toolset';
import ProjectGroupTree from '@/views/project/project/modules/ProjectGroupTree.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import { MenuItem } from '@/components/organisms/context-menu/type';
import { Location } from 'vue-router';
import { getAllPage } from '@/components/organisms/paginations/text-pagination/helper';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { ListType, TimeStamp } from '@/models';
import VueI18n from 'vue-i18n';

import TranslateResult = VueI18n.TranslateResult;

interface ProjectGroupInfo {
    project_group_id: string;
    name: string;
    parent_project_group_info: null | ProjectGroupInfo;
    domain_id: string;
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
    tags: object;
}

interface ProjectModel {
    project_id: string;
    name: string;
    state: string;
    project_group_info: ProjectGroupInfo;
    providers?: string[];
    created_by: string;
    created_at: TimeStamp;
    deleted_at: TimeStamp;
    tags: object;
}

interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

interface ProjectSummaryResp {
    member: number;
    server: number;
    cloud_service: number;
    subnet: number;
}

    interface ProjectCardData{
        projectGroupName: string;
        projectId: string;
        projectName: string;
        providers: string[];
        extraProviders: number;
        summary?: ProjectSummaryResp;
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
    setup(props, { root }) {
        const vm: ComponentRenderProxy = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            searchText: '',
            items: [] as ProjectCardData[],
            settingMenu: computed(() => [
                { name: 'edit', label: vm.$t('PROJECT.LANDING.ACTION_EDIT_GROUP_NAME'), type: 'item' },
                { name: 'delete', label: vm.$t('PROJECT.LANDING.ACTION_DELETE_THIS_GROUP'), type: 'item' },
            ] as MenuItem[]),
            showAllProjects: false,
            searchedProjectGroup: null as ProjectGroup|null,
            selectedTreeItem: null as ProjectTreeItem|null,
            parentGroups: computed<ProjectGroup[]>(() => {
                if (state.selectedTreeItem && state.selectedTreeItem.parent) {
                    return reverse(getParentGroup(state.selectedTreeItem.parent));
                } return [];
            }),
            treeRef: null as any,
            projectGroupNavigation: computed<any>(() => {
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
                return [
                    {
                        name: vm.$t('MENU.PROJECT.PROJECT'),
                        data: null as any,
                    },
                    ...result,
                ];
            }),
            noProjectGroup: false,
        });

        const formState = reactive({
            projectGroupFormVisible: false,
            projectFormVisible: false,
            projectGroupDeleteFormVisible: false,
            headerTitle: '' as unknown as TranslateResult,
            themeColor: '',
            modalContent: '' as unknown as TranslateResult,
            updateMode: false,
            createTargetNode: null as ProjectTreeItem|null,
        });

        const { provider } = useStore();
        provider.getProvider();

        /**
             * Make Card Data
             */
        const createdData = reactive({});
        const cardSummary = ref(createdData);
        const projectSummary = ref(createdData);

        const setProvider = (resp) => {
            const temp = resp.results.map((it) => {
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

        const setCard = (items) => {
            if (items) {
                items.forEach((item) => {
                    const project_id = item.project_id;
                    item.cloud_services = item.cloud_service_count || 0;
                    item.servers_count = item.server_count || 0;
                    cardSummary.value[project_id] = item;
                });
            }
        };

        const getCard = async (resp) => {
            if (resp.results.length !== 0) {
                const ids = resp.results.map(item => item.project_id);
                cardSummary.value = reactive(zipObject(ids));
                const projects = await SpaceConnector.client.statistics.topic.projectPage({
                    projects: ids,
                });
                if (projects) setCard(projects.results);
            }
            resp.results = setProvider(resp);
            projectSummary.value = resp.results;
            return resp;
        };

        /** List Grid Items */
        const listProjectApi = SpaceConnector.client.identity.projectGroup.listProjects;
        const listAllProjectApi = SpaceConnector.client.identity.project.list;
        const listQuery = new QueryHelper();
        const listState = reactive({
            items: [],
            totalCount: 0,
            loading: true,
            thisPage: 1,
            pageSize: 24,
            allPage: computed(() => getAllPage(listState.totalCount, (listState.pageSize))),
        });


        const resetAll = () => {
            listState.items = [];
            listState.totalCount = 0;
            listState.thisPage = 1;
            listState.pageSize = 24;
        };

        const getParams = () => {
            listQuery.setPageStart(getPageStart(listState.thisPage, listState.pageSize))
                .setPageLimit(listState.pageSize);

            if (state.searchText) listQuery.setFilter({ k: 'name', v: state.searchText, o: 'in' });

            let params: any;
            if (state.searchedProjectGroup) {
                params = {
                    project_group_id: state.searchedProjectGroup.id,
                    include_provider: true,
                };
            } else {
                params = {
                    include_provider: true,
                };
            }

            if (state.showAllProjects) params.recursive = true;


            return {
                ...params,
                query: listQuery.data,
            };
        };


        const getData = async (resetThisPage = false) => {
            if (resetThisPage) {
                listState.thisPage = 1;
            }
            listState.loading = true;
            try {
                const api = state.searchedProjectGroup ? listProjectApi : listAllProjectApi;
                const resp = await api(getParams());

                const res = await getCard(resp);
                listState.items = res.results;
                listState.totalCount = res.total_count;
            } catch (e) {
                listState.items = [];
                listState.totalCount = 0;
            } finally {
                listState.loading = false;
            }
        };

        watch<boolean, boolean>(() => state.showAllProjects, async (after, before) => {
            if (after !== before) {
                resetAll();
                await getData();
            }
        }, { immediate: false });


        /**
             * Click Card Item
             */
        const goToProjectDetail = (item) => {
            vm.$router.push({
                name: 'projectDetail',
                params: {
                    id: item.project_id,
                },
            } as Location);
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
            formState.headerTitle = vm.$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP_TITLE');
            formState.themeColor = 'alert';
            formState.modalContent = vm.$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP_CONTENT');
        };

        const projectGroupDeleteFormConfirm = async () => {
            if (!state.searchedProjectGroup) return;
            try {
                await SpaceConnector.client.identity.projectGroup.delete({
                    project_group_id: state.searchedProjectGroup.id,
                });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '', root);
                state.treeRef.deleteSelectedNode();
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: formState.headerTitle }), e, root);
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
            state.noProjectGroup = false;
        };

        const onProjectGroupNavClick = async (item: {name: string; data: ProjectGroup}) => {
            if (item.data) {
                state.searchedProjectGroup = item.data;
                await state.treeRef.findNode(item.data.id);
            } else {
                await state.treeRef.listNodes();
            }
        };

        const openProjectForm = () => {
            formState.projectFormVisible = true;
        };

        const projectFormConfirm = async (item) => {
            try {
                await SpaceConnector.client.identity.project.create({
                    project_group_id: state.searchedProjectGroup?.id,
                    ...item,
                });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'), e, root);
            } finally {
                formState.projectFormVisible = false;
                await getData();
            }
        };


        const listProjects = async () => {
            resetAll();
            await getData();
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
            // search: makeQueryStringComputed(ref(undefined), {
            //     key: 'search',
            // }),
        };

        /** Search */
        const onSearch = async (res: SearchResult) => {
            listState.loading = true;

            if ((res.projectGroup && !state.searchedProjectGroup)
                || (res.projectGroup && state.searchedProjectGroup && res.projectGroup.id !== state.searchedProjectGroup.id)) {
                await state.treeRef.findNode(res.projectGroup.id);
            } else if (!res.projectGroup && state.searchedProjectGroup) {
                await state.treeRef.listNodes();
            }
            state.searchedProjectGroup = res.projectGroup;
            state.searchText = res.value;
            state.searchedProjectGroup = res.projectGroup;
            await listProjects();

            // queryRefs.search.value = res.value;
        };

        const onSelectTreeItem = async (e: ProjectTreeItem|null) => {
            state.selectedTreeItem = e;
            if (e) {
                state.searchedProjectGroup = {
                    id: e.node.data.id,
                    name: e.node.data.name,
                };
                await listProjects();
            } else {
                state.searchedProjectGroup = null;
                await listProjects();
            }
        };


        const init = async () => {
            // set search text by query string
            state.searchText = vm.$route.query.search as string;

            // set searched project group by query string
            const pgId = vm.$route.query.select_pg as string|null;
            let projectGroup: ProjectGroup|null = null;
            if (pgId) {
                const res = await SpaceConnector.client.identity.projectGroup.get({
                    project_group_id: pgId,
                });

                projectGroup = {
                    id: pgId,
                    name: res.name,
                };
            }
            state.searchedProjectGroup = projectGroup;

            // init tree nodes
            if (projectGroup) await state.treeRef.findNode(projectGroup.id);
            else await state.treeRef.listNodes();

            // init project data
            state.searchedProjectGroup = projectGroup;
            await listProjects();
        };

        const onProjectGroupList = async (items: ProjectTreeItem[]) => {
            if (items.length === 0) {
                listState.loading = true;
                state.noProjectGroup = true;
            } else {
                state.noProjectGroup = false;
            }
            listState.loading = false;
            await listProjects();
        };

        onMounted(async () => {
            await init();
        });

        return {
            listState,
            getData,
            ...toRefs(state),
            ...toRefs(formState),
            skeletons: range(1),
            goToProjectDetail,
            goToServiceAccount,
            cardSummary,
            projectSummary,
            openProjectForm,
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
            onProjectGroupList,
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
        @apply ml-auto justify-end text-primary-dark;
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
    @apply flex items-center text-gray-900;
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

.empty {
    @apply flex-col text-center justify-start;
}

.loading {
    padding-top: 3rem;
}

.project-description {
    @apply mx-4 mt-6;
    .project {
        @apply mb-4;
        .project-group-name {
            @apply text-gray-500 text-xs;
            margin-bottom: 0.25rem;
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
                @apply text-gray-900 w-6 h-6 bg-blue-100 rounded-full inline-block z-10;
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
