<template>
    <general-page-layout>
        <p-data-loader class="page-inner" :loading="loading">
            <p-breadcrumbs :routes="pageNavigation" />
            <div v-if="item" class="top-wrapper">
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
                    <p class="copy-project-id">
                        <strong class="label">{{ $t('PROJECT.DETAIL.PROJECT_ID') }}&nbsp; </strong>
                        {{ projectId }}
                        <p-copy-button class="icon"
                                       :value="projectId"
                        />
                    </p>
                    <p-icon-text-button name="ic_state_manual" style-type="gray900"
                                        class="ml-3"
                                        outline
                                        @click="maintenanceWindowFormVisible = true"
                    >
                        {{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CREATE') }}
                    </p-icon-text-button>
                </div>
            </div>

            <maintenance-happening-list ref="maintenanceHappeningListRef" class="maintenance-happening-list" />

            <p-tab v-if="item"
                   :tabs="singleItemTabState.tabs" :active-tab.sync="singleItemTabState.activeTab"
                   :class="[singleItemTabState.activeTab]"
                   @change="onChangeTab"
            >
                <keep-alive><router-view /></keep-alive>
                <template #extra="tab">
                    <p-badge v-if="tab.label === $t('PROJECT.DETAIL.TAB_ALERT') && counts[ALERT_STATE.TRIGGERED] !== 0" style-type="primary3">
                        {{ commaFormatter(counts[ALERT_STATE.TRIGGERED]) }}
                    </p-badge>
                    <beta-mark v-if="tab.name === 'projectAlert' || tab.name === 'projectNotifications' || tab.name === 'projectMaintenanceWindow'" />
                </template>
            </p-tab>
        </p-data-loader>

        <p-button-modal :header-title="headerTitle"
                        :centered="true"
                        :scrollable="false"
                        size="sm"
                        :fade="true"
                        :backdrop="true"
                        :visible.sync="projectDeleteFormVisible"
                        :theme-color="themeColor"
                        :loading="modalLoading"
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
        <maintenance-window-form-modal :visible.sync="maintenanceWindowFormVisible" :project-id="projectId"
                                       @confirm="onCreateMaintenanceWindow"
        />
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';
import { find } from 'lodash';

import {
    PTab, PPageTitle, PButtonModal,
    PIconButton, PCopyButton, PBreadcrumbs, PIconTextButton, PBadge, PDataLoader,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { store } from '@/store';
import { i18n } from '@/translations';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { PROJECT_ROUTE } from '@/routes/project/project-route';

import { ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';
import MaintenanceWindowFormModal from '@/views/project/project/modules/MaintenanceWindowFormModal.vue';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import ProjectFormModal from '@/views/project/project/modules/ProjectFormModal.vue';
import { ProjectModel } from '@/views/project/project/type';
import { commaFormatter } from '@spaceone/console-core-lib';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import MaintenanceHappeningList from '@/views/project/project/modules/MaintenanceHappeningList.vue';
import Vue from 'vue';

export default {
    name: 'ProjectDetailPage',
    components: {
        MaintenanceHappeningList,
        MaintenanceWindowFormModal,
        GeneralPageLayout,
        ProjectFormModal,
        FavoriteButton,
        BetaMark,
        PButtonModal,
        PPageTitle,
        PTab,
        PIconButton,
        PCopyButton,
        PBreadcrumbs,
        PIconTextButton,
        PBadge,
        PDataLoader,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            item: null as null|ProjectModel,
            projectId: computed(() => root.$route.params.id),
            projectName: computed(() => state.item?.name || ''),
            projectGroupId: computed(() => state.item?.project_group_info?.project_group_id || ''),
            projectGroupName: computed(() => state.item?.project_group_info?.name || ''),
            projectGroupNames: [],
            pageNavigation: computed(() => [
                { name: i18n.t('MENU.PROJECT.PROJECT'), path: '/project' },
                { name: state.projectGroupName, path: `/project?select_pg=${state.projectGroupId}` },
                // ...state.projectGroupNames.map(d => ({
                //     name: d.name,
                //     path: `/project?select_pg=${d.project_group_id}`,
                // })),
                { name: state.projectName },
            ]),
            users: computed(() => store.state.resource.user.items),
            maintenanceWindowFormVisible: false,
            alertStateCounts: [],
            counts: computed(() => ({
                TRIGGERED: find(state.alertStateCounts, { state: ALERT_STATE.TRIGGERED })?.total || 0,
            })),
            maintenanceHappeningListRef: null as null|Vue,
        });

        const forceRouteToProjectPage = () => {
            showErrorMessage(
                i18n.t('PROJECT.DETAIL.ALT_E_PROJECT_INVALID_TITLE'),
                i18n.t('PROJECT.DETAIL.ALT_E_PROJECT_INVALID_DESC'),
                root,
            );
            vm.$router.push({ name: PROJECT_ROUTE._NAME });
        };

        /* api */
        const getProject = async (id) => {
            state.loading = true;
            try {
                const resp = await SpaceConnector.client.identity.project.get({
                    project_id: id,
                });
                state.item = resp;
            } catch (e) {
                state.item = null;
                forceRouteToProjectPage();
            } finally {
                state.loading = false;
            }
        };

        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed<TabItem[]>(() => [
                {
                    name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
                    label: i18n.t('PROJECT.DETAIL.TAB_SUMMARY'),
                    keepAlive: true,
                },
                {
                    name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
                    label: i18n.t('PROJECT.DETAIL.TAB_MEMBER'),
                },
                {
                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
                    label: i18n.t('PROJECT.DETAIL.TAB_ALERT'),
                },
                {
                    name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
                    label: i18n.t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
                },
                {
                    name: PROJECT_ROUTE.DETAIL.TAB.TAG._NAME,
                    label: i18n.t('PROJECT.DETAIL.TAB_TAG'),
                },
            ]),
            activeTab: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
        });

        // Member modal
        const formState = reactive({
            projectDeleteFormVisible: false,
            projectEditFormVisible: false,
            headerTitle: '' as TranslateResult,
            themeColor: '',
            modalContent: '' as TranslateResult,
            modalLoading: false,
        });

        const openProjectDeleteForm = () => {
            formState.projectDeleteFormVisible = true;
            formState.headerTitle = i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE');
            formState.themeColor = 'alert';
            formState.modalContent = i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT');
        };

        const projectDeleteFormConfirm = async () => {
            if (formState.modalLoading) return;

            formState.modalLoading = true;
            try {
                await SpaceConnector.client.identity.project.delete({
                    project_id: state.projectId,
                });
                // await store.dispatch('favorite/project/removeItem', { id: projectId.value });
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '', root);
                vm.$router.go(-1);
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'), e, root);
            } finally {
                formState.modalLoading = false;
                formState.projectDeleteFormVisible = false;
            }
        };

        const openProjectEditForm = () => {
            formState.projectEditFormVisible = true;
        };

        const onProjectFormComplete = async (data) => {
            state.item = data || null;
        };

        const onChangeTab = (activeTab) => {
            if (activeTab === vm.$route.name) return;
            vm.$router.replace({ name: activeTab });
        };

        const urlQueryHelper = new QueryHelper();
        const onCreateMaintenanceWindow = (maintenanceWindowId: string) => {
            singleItemTabState.activeTab = PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME;
            urlQueryHelper.setFilters([{ k: 'maintenance_window_id', v: maintenanceWindowId }]);
            vm.$router.replace({ name: singleItemTabState.activeTab, query: { filters: urlQueryHelper.rawQueryStrings } });
            if (state.maintenanceHappeningListRef) state.maintenanceHappeningListRef.reload();
        };

        const statAlerts = async () => {
            try {
                const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
                    project_id: state.projectId,
                });
                state.alertStateCounts = results;
            } catch (e) {
                state.alertStateCounts = [];
                console.error(e);
            }
        };

        /** Init */
        watch(() => state.projectId, async (projectId) => {
            if (projectId) await getProject(projectId);
            else forceRouteToProjectPage();
        }, { immediate: true });

        (async () => {
            const exactRoute = vm.$route.matched.find(d => singleItemTabState.tabs.find(tab => tab.name === d.name));
            singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
            await Promise.all([
                // getPageNavigation(),
                store.dispatch('resource/project/load'),
                store.dispatch('favorite/project/load'),
                store.dispatch('resource/user/load'),
                store.dispatch('resource/provider/load'),
                statAlerts(),
            ]);
        })();

        watch(() => vm.$route.name, () => {
            const exactRoute = vm.$route.matched.find(d => singleItemTabState.tabs.find(tab => tab.name === d.name));
            singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
        });


        return {
            ...toRefs(state),
            ...toRefs(formState),
            singleItemTabState,
            openProjectDeleteForm,
            projectDeleteFormConfirm,
            openProjectEditForm,
            onProjectFormComplete,
            onChangeTab,
            onCreateMaintenanceWindow,
            statAlerts,
            ALERT_STATE,
            commaFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.page-inner {
    height: 100%;
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
    .extra {
        display: flex;
    }
}

.delete-btn {
    @apply ml-3 cursor-pointer;
}

.maintenance-happening-list {
    margin-bottom: 1.875rem;
}
</style>
