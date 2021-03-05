<template>
    <general-page-layout>
        <div class="page-inner">
            <p-breadcrumbs :routes="pageNavigation" />
            <div class="top-wrapper">
                <p-page-title :title="item.name" child @goBack="$router.go(-1)" />
                <div class="btns">
                    <span class="favorite-btn-wrapper">
                        <favorite-button :item-id="projectId"
                                         favorite-type="project"
                                         resource-type="identity.Project"
                        />
                    </span>
                    <p-icon-button name="ic_transhcan"
                                   class="delete-btn"
                                   @click="openProjectDeleteForm"
                    />
                    <p-icon-button name="ic_edit-text"
                                   class="edit-btn"
                                   @click="openProjectEditForm"
                    />
                </div>
                <p class="copy-project-id">
                    <strong class="label">{{ $t('PROJECT.DETAIL.PROJECT_ID') }}&nbsp; </strong>
                    {{ projectId }}
                    <p-copy-button class="icon"
                                   :value="projectId"
                    />
                </p>
            </div>

            <p-tab :tabs="singleItemTabState.tabs" :active-tab.sync="singleItemTabState.activeTab"
                   class="tab-content"
                   :class="[singleItemTabState.activeTab]"
            >
                <template #summary>
                    <project-dashboard ref="ProjectDashboard" :project-id="projectId" />
                </template>
                <template #member>
                    <project-member-tab :project-id="projectId" />
                </template>
                <template #tag>
                    <tags-panel :resource-id="projectId"
                                resource-key="project_id"
                                resource-type="identity.Project"
                                class="tab-bg"
                    />
                </template>
                <template #report>
                    <project-report-tab :project-id="projectId" :project-name="projectName" />
                </template>
            </p-tab>
            <p-button-modal :header-title="headerTitle"
                            :centered="true"
                            :scrollable="false"
                            size="md"
                            :fade="true"
                            :backdrop="true"
                            :visible.sync="projectDeleteFormVisible"
                            :theme-color="themeColor"
                            :footer-confirm-button-bind="{
                                styleType: 'alert',
                            }"
                            @confirm="projectDeleteFormConfirm"
            >
                <template #body>
                    <p class="delete-modal-content">
                        {{ modalContent }}
                    </p>
                </template>
            </p-button-modal>
            <project-form-modal v-if="projectEditFormVisible"
                                :visible.sync="projectEditFormVisible"
                                :project-group-id="projectGroupId"
                                :project="item"
                                @complete="onProjectFormComplete"
            />
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, reactive, ref, toRefs, watch, getCurrentInstance, onMounted,
} from '@vue/composition-api';

import {
    PTab, PPageTitle, PButtonModal,
    PIconButton, PCopyButton, PBreadcrumbs,
} from '@spaceone/design-system';

import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import TagsPanel from '@/common/modules/tags-panel/TagsPanel.vue';
import ProjectFormModal from '@/views/project/project/modules/ProjectFormModal.vue';

import ProjectDashboard from '@/views/project/project/modules/project-dashboard/ProjectDashboard.vue';
import ProjectMemberTab from '@/views/project/project/modules/ProjectMemberTab.vue';
import ProjectReportTab from '@/views/project/project/modules/ProjectReportTab.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';

import { ProjectModel } from '@/views/project/project/type';
import { TranslateResult } from 'vue-i18n';


export default {
    name: 'ProjectDetail',
    components: {
        FavoriteButton,
        ProjectMemberTab,
        ProjectReportTab,
        ProjectDashboard,
        PButtonModal,
        GeneralPageLayout,
        TagsPanel,
        PPageTitle,
        PTab,
        PIconButton,
        PCopyButton,
        ProjectFormModal,
        PBreadcrumbs,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const projectId = computed<string>(() => root.$route.params.id as string);
        const item = ref({} as ProjectModel);
        const state = reactive({
            projectName: computed(() => item.value?.name || ''),
            projectGroupId: computed(() => item.value?.project_group_info?.project_group_id || ''),
            projectGroupName: computed(() => item.value?.project_group_info?.name || ''),
            projectId,
            projectGroupNames: [],
            pageNavigation: computed(() => [
                { name: vm.$t('MENU.PROJECT.PROJECT'), path: '/project' },
                { name: state.projectGroupName, path: `/project?select_pg=${state.projectGroupId}` },
                // ...state.projectGroupNames.map(d => ({
                //     name: d.name,
                //     path: `/project?select_pg=${d.project_group_id}`,
                // })),
                { name: state.projectName },
            ]),
            reportState: computed(() => vm.$store.state.user.reportState),
            users: computed(() => vm.$store.state.resource.user.items),
        });

        const getProject = async (id) => {
            const resp = await SpaceConnector.client.identity.project.get({
                project_id: id,
            });
            if (resp) {
                item.value = resp;
            }
        };

        onMounted(async () => {
            await getProject(projectId.value);
        });

        watch(projectId, (after, before) => {
            if (after && after !== before) {
                getProject(after);
            }
        }, { immediate: true });


        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => {
                const items: TabItem[] = [
                    { name: 'summary', label: vm.$t('PROJECT.DETAIL.TAB_SUMMARY'), keepAlive: true },
                    { name: 'member', label: vm.$t('PROJECT.DETAIL.TAB_MEMBER') },
                    { name: 'tag', label: vm.$t('PROJECT.DETAIL.TAB_TAG') },
                ];

                if (state.reportState) {
                    items.push({ name: 'report', label: vm.$t('PROJECT.DETAIL.TAB_REPORT'), beta: true } as TabItem);
                }
                return items;
            }),
            activeTab: 'summary',
        });


        // Member modal
        const formState = reactive({
            projectDeleteFormVisible: false,
            projectEditFormVisible: false,
            headerTitle: '' as TranslateResult,
            themeColor: '',
            modalContent: '' as TranslateResult,
        });

        const openProjectDeleteForm = () => {
            formState.projectDeleteFormVisible = true;
            formState.headerTitle = vm.$t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE');
            formState.themeColor = 'alert';
            formState.modalContent = vm.$t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT');
        };

        const projectDeleteFormConfirm = async () => {
            try {
                await SpaceConnector.client.identity.project.delete({
                    project_id: projectId.value,
                });
                await vm.$store.dispatch('favorite/project/removeItem', { id: projectId.value });
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '', root);
                vm.$router.go(-1);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'), e, root);
            } finally {
                formState.projectDeleteFormVisible = false;
            }
        };

        const openProjectEditForm = () => {
            formState.projectEditFormVisible = true;
        };

        const onProjectFormComplete = async (data) => {
            if (data) item.value = data;
        };

        /** Init */
        (async () => {
            await Promise.all([
                // getPageNavigation(),
                vm.$store.dispatch('resource/project/load'),
                vm.$store.dispatch('favorite/project/load'),
                vm.$store.dispatch('resource/user/load'),
                vm.$store.dispatch('resource/provider/load'),
            ]);
        })();
        return {
            ...toRefs(state),
            ...toRefs(formState),
            singleItemTabState,

            item,
            openProjectDeleteForm,
            projectDeleteFormConfirm,
            openProjectEditForm,
            onProjectFormComplete,

        };
    },
};
</script>

<style lang="postcss" scoped>
.page-inner {
    max-width: 1368px;
    margin: 0 auto;
}
.top-wrapper {
    @apply mb-8 flex flex-wrap items-center;
    .btns {
        @apply flex-shrink-0 flex items-center;
        .favorite-btn-wrapper {
            @apply inline-flex ml-2;
        }
        .p-icon-text-button {
            @apply flex-shrink-0 ml-4;
        }
    }
    .copy-project-id {
        @apply flex-shrink-0 flex-grow inline-flex items-center justify-end text-gray-500;
        font-size: 0.875rem;
        height: 2rem;
        .label {
            @apply text-gray-dark;
        }
        .icon {
            @apply ml-2 text-gray-dark;
        }
    }
}
.p-page-title::v-deep {
    @apply mb-0;
    width: auto;
    .title {
        @apply text-2xl;
    }
}
.tab-content::v-deep {
    border: none;
    margin: auto;

    &.summary {
        .tab-pane {
            @apply border border-gray-200;
            padding: 2rem 1rem 1.5rem;
        }
    }
}

.delete-btn {
    @apply ml-3 cursor-pointer;
}

.tab-bg {
    @apply bg-white border border-gray-200 rounded-sm pb-8;
}

.toolbox-left {
    @apply w-full flex pr-4 ;
    .p-search {
        @apply w-full;
    }
}
</style>
