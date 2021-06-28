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
                    <p-icon-button name="ic_trashcan"
                                   class="delete-btn"
                                   @click="openProjectDeleteForm"
                    />
                    <p-icon-button name="ic_edit-text"
                                   class="edit-btn"
                                   @click="openProjectEditForm"
                    />
                </div>
                <div class="top-right-group">
                    <!--                    <p-icon-text-button name="ic_state_manual" style-type="gray900"-->
                    <!--                                        @click="maintenanceWindowFormVisible = true"-->
                    <!--                    >-->
                    <!--                        {{ $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.CREATE') }}-->
                    <!--                    </p-icon-text-button>-->
                    <p class="copy-project-id">
                        <strong class="label">{{ $t('PROJECT.DETAIL.PROJECT_ID') }}&nbsp; </strong>
                        {{ projectId }}
                        <p-copy-button class="icon"
                                       :value="projectId"
                        />
                    </p>
                </div>
            </div>

            <p-tab :tabs="singleItemTabState.tabs" :active-tab.sync="singleItemTabState.activeTab"
                   :class="[singleItemTabState.activeTab]"
                   @update:activeTab="onUpdateActiveTab"
            >
                <keep-alive><router-view /></keep-alive>
                <!--                <template #extra="tab">-->
                <!--                    <p-badge v-if="tab.label === $t('PROJECT.DETAIL.TAB_ALERT') && counts[ALERT_STATE.TRIGGERED] !== 0" style-type="primary3">-->
                <!--                        {{ counts[ALERT_STATE.TRIGGERED] }}-->
                <!--                    </p-badge>-->
                <!--                </template>-->
                <template #extra="tab">
                    <span v-if="tab.isBeta" class="beta-text">beta</span>
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
            <maintenance-window-form-modal :visible.sync="maintenanceWindowFormVisible" :project-id="projectId" />
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
    PIconButton, PCopyButton, PBreadcrumbs, PButton, PIconTextButton, PBadge,
} from '@spaceone/design-system';

import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import ProjectFormModal from '@/views/project/project/modules/ProjectFormModal.vue';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';

import { PROJECT_ROUTE } from '@/routes/project/project-route';
import { ProjectModel } from '@/views/project/project/type';
import { TranslateResult } from 'vue-i18n';
import MaintenanceWindowFormModal from '@/views/project/project/modules/MaintenanceWindowFormModal.vue';
import { find } from 'lodash';
import { ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';

export default {
    name: 'ProjectDetailPage',
    components: {
        MaintenanceWindowFormModal,
        GeneralPageLayout,
        ProjectFormModal,
        FavoriteButton,
        PButtonModal,
        PPageTitle,
        PTab,
        PIconButton,
        PCopyButton,
        PBreadcrumbs,
        // PIconTextButton,
        // PBadge,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const item = ref({} as ProjectModel);
        const state = reactive({
            projectId: computed(() => root.$route.params.id),
            projectName: computed(() => item.value?.name || ''),
            projectGroupId: computed(() => item.value?.project_group_info?.project_group_id || ''),
            projectGroupName: computed(() => item.value?.project_group_info?.name || ''),
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
            users: computed(() => vm.$store.state.resource.user.items),
            maintenanceWindowFormVisible: false,
            // alertStateCounts: [],
            // counts: computed(() => ({
            //     TRIGGERED: find(state.alertStateCounts, { state: ALERT_STATE.TRIGGERED })?.total || 0,
            // })),
        });

        /* api */
        const getProject = async (id) => {
            const resp = await SpaceConnector.client.identity.project.get({
                project_id: id,
            });
            if (resp) {
                item.value = resp;
            }
        };

        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => {
                const items: TabItem[] = [
                    {
                        name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
                        label: vm.$t('PROJECT.DETAIL.TAB_SUMMARY'),
                        keepAlive: true,
                    },
                    {
                        name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
                        label: vm.$t('PROJECT.DETAIL.TAB_MEMBER'),
                    },
                    {
                        name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
                        label: vm.$t('PROJECT.DETAIL.TAB_ALERT'),
                        isBeta: true,
                    },
                    {
                        name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
                        label: vm.$t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
                        isBeta: true,
                    },
                    // {
                    //     name: PROJECT_ROUTE.DETAIL.TAB.MAINTENANCE_WINDOW._NAME,
                    //     label: vm.$t('PROJECT.DETAIL.TAB_MAINTENANCE_WINDOW'),
                    //     isBeta: true,
                    // },
                    {
                        name: PROJECT_ROUTE.DETAIL.TAB.TAG._NAME,
                        label: vm.$t('PROJECT.DETAIL.TAB_TAG'),
                    },
                ];
                return items;
            }),
            activeTab: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
        });

        const onUpdateActiveTab = (activeTab) => {
            vm.$router.replace({ name: activeTab }).catch(() => {});
        };

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
                    project_id: state.projectId,
                });
                // await vm.$store.dispatch('favorite/project/removeItem', { id: projectId.value });
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

        // const statAlerts = async () => {
        //     try {
        //         const { results } = await SpaceConnector.client.statistics.topic.alertStateCount({
        //             project_id: state.projectId,
        //         });
        //         state.alertStateCounts = results;
        //     } catch (e) {
        //         state.alertStateCounts = [];
        //         console.error(e);
        //     }
        // };

        /** Init */
        (async () => {
            await Promise.all([
                // getPageNavigation(),
                vm.$store.dispatch('resource/project/load'),
                vm.$store.dispatch('favorite/project/load'),
                vm.$store.dispatch('resource/user/load'),
                vm.$store.dispatch('resource/provider/load'),
                // statAlerts(),
            ]);
        })();

        onMounted(async () => {
            await getProject(state.projectId);
        });

        watch(() => state.projectId, (projectId) => {
            if (projectId) {
                getProject(projectId);
            }
        }, { immediate: true });

        (async () => {
            singleItemTabState.activeTab = vm.$route?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            singleItemTabState,
            onUpdateActiveTab,
            ALERT_STATE,
            item,
            openProjectDeleteForm,
            projectDeleteFormConfirm,
            openProjectEditForm,
            onProjectFormComplete,
            // statAlerts,

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
    .top-right-group {
        @apply flex-grow inline-flex items-center justify-end flex-wrap;
        .copy-project-id {
            @apply inline-flex items-center text-gray-500;
            font-size: 0.875rem;
            height: 2rem;
            margin-left: 0.875rem;
            .label {
                @apply text-gray-dark;
            }
            .icon {
                @apply ml-2 text-gray-dark;
            }
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
.p-tab::v-deep {
    border-radius: 0.375rem;
    margin: auto;
    .beta-text {
        @apply text-coral;
        font-size: 0.75rem;
        vertical-align: super;
        cursor: default;
        margin-left: 0.25rem;
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
