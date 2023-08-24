<script lang="ts" setup>
import { commaFormatter } from '@cloudforet/core-lib';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PTab, PHeading, PButtonModal,
    PButton, PCopyButton, PBreadcrumbs, PIconButton, PBadge, PDataLoader,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { find } from 'lodash';
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { MENU_ID } from '@/lib/menu/config';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import MaintenanceHappeningList from '@/services/project/project-detail/modules/MaintenanceHappeningList.vue';
import MaintenanceWindowFormModal from '@/services/project/project-detail/modules/MaintenanceWindowFormModal.vue';
import ProjectFormModal from '@/services/project/project-detail/modules/ProjectFormModal.vue';
import { PROJECT_ROUTE } from '@/services/project/route-config';
import { useProjectDetailPageStore } from '@/services/project/store/project-detail-page-store';
import type { ProjectModel } from '@/services/project/type';

interface Props {
    id: string;
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const store = useStore();

const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.$state;
const state = reactive({
    hasManagePermission: useManagePermissionState(),
    hasAlertPermission: computed<boolean>(() => isUserAccessibleToMenu(MENU_ID.ALERT_MANAGER, store.getters['user/pagePermissionList'])),
    loading: true,
    item: null as null|ProjectModel,
    projectId: computed(() => projectDetailPageState.projectId),
    projectName: computed(() => state.item?.name || ''),
    projectGroupId: computed(() => state.item?.project_group_info?.project_group_id || ''),
    projectGroupName: computed(() => state.item?.project_group_info?.name || ''),
    projectGroupNames: [],
    pageNavigation: computed(() => [
        { name: t('MENU.PROJECT'), path: '/project' },
        { name: state.projectGroupName, path: `/project?select_pg=${state.projectGroupId}` },
        // ...state.projectGroupNames.map(d => ({
        //     name: d.name,
        //     path: `/project?select_pg=${d.project_group_id}`,
        // })),
        { name: state.projectName },
    ]),
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    maintenanceWindowFormVisible: false,
    counts: computed(() => ({
        TRIGGERED: find(projectDetailPageState.alertCounts, { state: ALERT_STATE.TRIGGERED })?.total ?? 0,
    })),
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
            label: t('PROJECT.DETAIL.TAB_SUMMARY'),
            keepAlive: true,
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
            label: t('PROJECT.DETAIL.TAB_MEMBER'),
        },
        ...(state.hasAlertPermission) ? [{
            name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
            label: t('PROJECT.DETAIL.TAB_ALERT'),
        }] : [],
        {
            name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
            label: t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.TAG._NAME,
            label: t('PROJECT.DETAIL.TAB_TAG'),
        },
    ]),
    activeTab: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
});

// Member modal
const formState = reactive({
    projectDeleteFormVisible: false,
    projectEditFormVisible: false,
    headerTitle: '' as string,
    themeColor: undefined as string | undefined,
    modalContent: '' as string,
    modalLoading: false,
});

const openProjectDeleteForm = () => {
    formState.projectDeleteFormVisible = true;
    formState.headerTitle = t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE');
    formState.themeColor = 'alert';
    formState.modalContent = t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT');
};

const projectDeleteFormConfirm = async () => {
    if (formState.modalLoading) return;

    formState.modalLoading = true;
    try {
        await SpaceConnector.client.identity.project.delete({
            project_id: state.projectId,
        });
        // await store.dispatch('favorite/project/removeItem', { id: projectId.value });
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '');
        router.go(-1);
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'));
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
    if (activeTab === route.name) return;
    router.replace({ name: activeTab });
};

const urlQueryHelper = new QueryHelper();
const onCreateMaintenanceWindow = (maintenanceWindowId: string) => {
    singleItemTabState.activeTab = PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME;
    urlQueryHelper.setFilters([{ k: 'maintenance_window_id', v: maintenanceWindowId }]);
    router.replace({ name: singleItemTabState.activeTab, query: { filters: urlQueryHelper.rawQueryStrings } });
};

/* Watchers */
watch(() => state.projectId, async (projectId) => {
    if (projectId) {
        await Promise.allSettled([
            getProject(projectId),
            projectDetailPageStore.getAlertCounts(),
        ]);
    }
}, { immediate: true });

watch(() => route.name, () => {
    const exactRoute = route.matched.find((d) => singleItemTabState.tabs.find((tab) => tab.name === d.name));
    singleItemTabState.activeTab = exactRoute?.name as string || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
}, { immediate: true });

watch(() => props.id, (after, before) => {
    if (after !== before) {
        projectDetailPageStore.$patch({ projectId: after });
    }
}, { immediate: true });

onUnmounted(() => {
    projectDetailPageStore.$reset();
    projectDetailPageStore.$dispose();
});

</script>

<template>
    <general-page-layout overflow="scroll">
        <p-data-loader class="page-inner"
                       :loading="state.loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <p-breadcrumbs :routes="state.pageNavigation" />
            <div v-if="state.item"
                 class="top-wrapper"
            >
                <p-heading :title="state.item.name"
                           show-back-button
                           @click-back-button="router.go(-1)"
                >
                    <template #title-right-extra>
                        <div class="button-wrapper">
                            <span class="favorite-button-wrapper">
                                <favorite-button :item-id="state.projectId"
                                                 :favorite-type="FAVORITE_TYPE.PROJECT"
                                />
                            </span>
                            <p-icon-button name="ic_delete"
                                           class="delete-btn"
                                           :disabled="!state.hasManagePermission"
                                           @click="openProjectDeleteForm"
                            />
                            <p-icon-button name="ic_edit-text"
                                           class="edit-btn"
                                           :disabled="!state.hasManagePermission"
                                           @click="openProjectEditForm"
                            />
                        </div>
                        <div class="top-right-group">
                            <p class="copy-project-id">
                                <strong class="label">{{ t('PROJECT.DETAIL.PROJECT_ID') }}&nbsp; </strong>
                                {{ state.projectId }}
                                <p-copy-button class="icon"
                                               :value="state.projectId"
                                />
                            </p>
                            <p-button v-if="state.hasAlertPermission"
                                      style-type="tertiary"
                                      icon-left="ic_spanner-filled"
                                      class="ml-3"
                                      :disabled="!state.hasManagePermission"
                                      @click="state.maintenanceWindowFormVisible = true"
                            >
                                {{ t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CREATE') }}
                            </p-button>
                        </div>
                    </template>
                </p-heading>
            </div>

            <maintenance-happening-list class="maintenance-happening-list"
                                        :project-id="state.projectId"
            />

            <p-tab v-if="state.item"
                   v-model:active-tab="singleItemTabState.activeTab"
                   :tabs="singleItemTabState.tabs"
                   @change="onChangeTab"
            >
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
                <template #extra="tab">
                    <p-badge v-if="tab.label === t('PROJECT.DETAIL.TAB_ALERT') && state.counts[ALERT_STATE.TRIGGERED] !== 0"
                             style-type="primary3"
                             badge-type="subtle"
                    >
                        {{ commaFormatter(state.counts[ALERT_STATE.TRIGGERED]) }}
                    </p-badge>
                    <beta-mark v-if="tab.name === 'projectAlert' || tab.name === 'projectNotifications' || tab.name === 'projectMaintenanceWindow'" />
                </template>
            </p-tab>
        </p-data-loader>

        <p-button-modal v-model:visible="formState.projectDeleteFormVisible"
                        :header-title="formState.headerTitle"
                        :centered="true"
                        size="sm"
                        :fade="true"
                        :backdrop="true"
                        :theme-color="formState.themeColor"
                        :loading="formState.modalLoading"
                        @confirm="projectDeleteFormConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ formState.modalContent }}
                </p>
            </template>
        </p-button-modal>

        <project-form-modal v-if="formState.projectEditFormVisible"
                            v-model:visible="formState.projectEditFormVisible"
                            :project-group-id="state.projectGroupId"
                            :project="state.item"
                            @complete="onProjectFormComplete"
        />
        <maintenance-window-form-modal v-model:visible="state.maintenanceWindowFormVisible"
                                       :project-id="state.projectId"
                                       @confirm="onCreateMaintenanceWindow"
        />
    </general-page-layout>
</template>

<style lang="postcss" scoped>
.page-inner {
    height: 100%;
    max-width: 1368px;
    margin: 0 auto;
}
.p-heading {
    margin-bottom: 0;
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

.p-tab {
    @apply rounded-lg;
}

.delete-btn {
    @apply ml-3 cursor-pointer;
}

.maintenance-happening-list {
    margin-bottom: 1.875rem;
}
</style>
