<template>
    <general-page-layout>
        <p-data-loader class="page-inner" :loading="loading">
            <p-breadcrumbs :routes="pageNavigation" />
            <div v-if="item" class="top-wrapper">
                <p-page-title :title="item.name" child @goBack="$router.go(-1)">
                    <template #title-right-extra>
                        <div class="button-wrapper">
                            <span class="favorite-button-wrapper">
                                <favorite-button :item-id="projectId"
                                                 :favorite-type="FAVORITE_TYPE.PROJECT"
                                />
                            </span>
                            <p-icon-button name="ic_trashcan"
                                           class="delete-btn"
                                           :disabled="!hasManagePermission"
                                           @click="openProjectDeleteForm"
                            />
                            <p-icon-button name="ic_edit-text"
                                           class="edit-btn"
                                           :disabled="!hasManagePermission"
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
                            <p-button
                                v-if="!hasNoAlertPermission"
                                icon="ic_state_manual" style-type="gray900"
                                class="ml-3"
                                :outline="true"
                                :disabled="!hasManagePermission"
                                @click="maintenanceWindowFormVisible = true"
                            >
                                {{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CREATE') }}
                            </p-button>
                        </div>
                    </template>
                </p-page-title>
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

import { commaFormatter } from '@spaceone/console-core-lib';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PTab, PPageTitle, PButtonModal,
    PButton, PCopyButton, PBreadcrumbs, PIconButton, PBadge, PDataLoader,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { find } from 'lodash';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';


import { store } from '@/store';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { i18n } from '@/translations';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { MENU_ID } from '@/lib/menu/config';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { registerServiceStore } from '@/common/composables/register-service-store';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import MaintenanceHappeningList from '@/services/project/project-detail/modules/MaintenanceHappeningList.vue';
import MaintenanceWindowFormModal from '@/services/project/project-detail/modules/MaintenanceWindowFormModal.vue';
import ProjectFormModal from '@/services/project/project-detail/modules/ProjectFormModal.vue';
import ProjectDetailStoreModule from '@/services/project/project-detail/store';
import { ProjectDetailState } from '@/services/project/project-detail/store/type';
import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ProjectModel } from '@/services/project/type';


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
        PButton,
        PBadge,
        PDataLoader,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        registerServiceStore<ProjectDetailState>('projectDetail', ProjectDetailStoreModule);

        const state = reactive({
            hasManagePermission: computed<boolean>(() => store.getters['user/hasManagePermission']),
            hasNoAlertPermission: computed<boolean>(() => isUserAccessibleToMenu(MENU_ID.ALERT_MANAGER, store.getters['user/pagePermissionList'])),
            loading: true,
            item: null as null|ProjectModel,
            projectId: computed(() => store.state.service.projectDetail.projectId),
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
            users: computed(() => store.state.reference.user.items),
            maintenanceWindowFormVisible: false,
            counts: computed(() => ({
                TRIGGERED: find(store.state.service.projectDetail.alertCounts, { state: ALERT_STATE.TRIGGERED })?.total || 0,
            })),
            maintenanceHappeningListRef: null as null|Vue,
        });

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
                ErrorHandler.handleError(new NoResourceError({ name: PROJECT_ROUTE._NAME }));
                // forceRouteToProjectPage();
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
                ...(state.hasNoAlertPermission) ? [{
                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
                    label: i18n.t('PROJECT.DETAIL.TAB_ALERT'),
                }] : [],
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
            themeColor: undefined as string | undefined,
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
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'));
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

        /** Init */
        watch(() => state.projectId, async (projectId) => {
            if (projectId) await getProject(projectId);
            // else forceRouteToProjectPage();
        }, { immediate: true });

        (async () => {
            const exactRoute = vm.$route.matched.find(d => singleItemTabState.tabs.find(tab => tab.name === d.name));
            singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
            await Promise.allSettled([
                // getPageNavigation(),
                store.dispatch('service/projectDetail/getAlertCounts'),
            ]);
        })();

        watch(() => vm.$route.name, () => {
            const exactRoute = vm.$route.matched.find(d => singleItemTabState.tabs.find(tab => tab.name === d.name));
            singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
        });

        watch(() => props.id, (after, before) => {
            if (after !== before) {
                store.commit('service/projectDetail/setProjectId', after);
            }
        }, { immediate: true });


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
            ALERT_STATE,
            FAVORITE_TYPE,
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
.p-page-title {
    @apply mb-0;
}
.top-wrapper {
    @apply mb-8 flex flex-wrap items-center;
    .button-wrapper {
        @apply inline-flex items-center;
        .favorite-button-wrapper {
            @apply inline-flex ml-2;
        }
        .p-icon-text-button {
            @apply flex-shrink-0 ml-4;
        }
    }
    .top-right-group {
        @apply inline-flex items-center justify-end flex-wrap;
        float: right;
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

.p-tab::v-deep {
    @apply rounded-lg;
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
