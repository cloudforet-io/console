<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import { find, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PBadge, PButtonModal, PPaneLayout, PIconButton, PI,
} from '@cloudforet/mirinae';
import type { Route } from '@cloudforet/mirinae/types/navigation/breadcrumbs/type';


import type { ProjectDeleteParameters } from '@/api-clients/identity/project/schema/api-verbs/delete';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { peacock } from '@/styles/colors';

import ProjectFormModal from '@/services/project/v1/components/ProjectFormModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/v1/components/ProjectMainProjectGroupMoveModal.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';
import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';

interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const gnbStore = useGnbStore();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.state;
const projectDetailPageGetters = projectDetailPageStore.getters;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();
const userWorkspaceStore = useUserWorkspaceStore();

const { getProperRouteLocation } = useProperRouteLocation();
const { getReferenceLocation } = useReferenceRouter();

const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    favoriteItems: computed(() => favoriteGetters.projectItems),
});
const state = reactive({
    item: computed<ProjectModel|undefined>(() => projectDetailPageState.currentProject),
    projectGroupId: computed<string|undefined>(() => state.item?.project_group_id),
    projectGroupInfo: computed<ProjectGroupReferenceItem>(() => storeState.projectGroups?.[state.projectGroupId] ?? {}),
    pageNavigation: computed<Route[]>(() => {
        let results: Route[] = [
            { name: i18n.t('MENU.PROJECT') as string, to: { name: PROJECT_ROUTE_V1._NAME } },
        ];
        if (!isEmpty(state.projectGroupInfo)) {
            results.push({
                name: state.projectGroupInfo.name,
                to: getReferenceLocation(state.projectGroupId, { resource_type: 'identity.ProjectGroup' }),
            });
        }
        if (route.name === PROJECT_ROUTE_V1.DETAIL.EVENT_RULE._NAME) {
            results = results.concat([
                { name: state.item?.name, to: getReferenceLocation(state.item?.project_id, { resource_type: 'identity.Project' }) },
                { name: i18n.t('PROJECT.DETAIL.ALERT.EVENT_RULE') as string },
            ]);
        } else if (route.name === PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS.ADD._NAME) {
            results = results.concat([
                { name: state.item?.name, to: getReferenceLocation(state.item?.project_id, { resource_type: 'identity.Project' }) },
                { name: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: route.query.protocolLabel }) as string },
            ]);
        } else {
            results.push({ name: state.item?.name });
        }
        return results;
    }),
    counts: computed(() => ({
        TRIGGERED: find(projectDetailPageState.alertCounts, { state: ALERT_STATE.TRIGGERED })?.total ?? 0,
    })),
    projectGroupMoveModalVisible: false,
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.PROJECT,
        id: projectDetailPageState.projectId,
    })),
    isHeaderVisible: computed<boolean>(() => {
        const excludeRoutes = [
            PROJECT_ROUTE_V1.DETAIL.EVENT_RULE._NAME,
            PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS.ADD._NAME,
            PROJECT_ROUTE_V1.DETAIL.TAB.ALERT.WEBHOOK.CREATE._NAME,
        ];
        return route.name ? !excludeRoutes.includes(route.name) : true;
    }),
    isStarred: computed(() => storeState.favoriteItems.some((item) => item.itemId === projectDetailPageState.projectId)),
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
const handleOpenProjectGroupMoveModal = () => {
    state.projectGroupMoveModalVisible = true;
};

const projectDeleteFormConfirm = async () => {
    if (formState.modalLoading) return;

    formState.modalLoading = true;
    try {
        await SpaceConnector.clientV2.identity.project.delete<ProjectDeleteParameters>({
            project_id: projectDetailPageState.projectId as string,
        });
        await recentStore.deleteRecent({
            type: RECENT_TYPE.PROJECT,
            itemId: projectDetailPageState.projectId as string,
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '');
        router.push({ name: PROJECT_ROUTE_V1._NAME });
        const isFavoriteItem = favoriteGetters.projectItems.find((item) => item.itemId === projectDetailPageState.projectId);
        if (isFavoriteItem) {
            await favoriteStore.deleteFavorite({
                itemType: FAVORITE_TYPE.PROJECT,
                workspaceId: storeState.currentWorkspaceId || '',
                itemId: projectDetailPageState.projectId as string,
            });
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'));
    } finally {
        formState.modalLoading = false;
        formState.projectDeleteFormVisible = false;
    }
};

const handleConfirmProjectForm = (data: ProjectModel) => {
    projectDetailPageStore.setProject(data);
};

const handleConfirmProjectGroupMoveModal = () => {
    projectDetailPageStore.getProject();
};
const handleGoBackProjectLanding = () => {
    router.push(getProperRouteLocation({ name: PROJECT_ROUTE_V1._NAME, params: { projectGroupId: state.projectGroupId } }));
};

/* Watchers */
watch(() => projectDetailPageState.projectId, async (projectId) => {
    if (projectId) {
        await Promise.allSettled([
            projectDetailPageStore.getProject(projectId),
            projectDetailPageStore.getAlertCounts(projectId),
        ]);
    }
});


watch([
    () => props.id,
    () => appContextStore.getters.globalGrantLoading,
], ([id, globalGrantLoading]) => {
    if (!globalGrantLoading) projectDetailPageStore.setProjectId(id);
}, { immediate: true });

watch(() => projectDetailPageState.projectId, (projectId) => {
    gnbStore.setId(projectId);
}, { immediate: true });
watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    projectDetailPageStore.reset();
});
</script>

<template>
    <div class="project-detail-page">
        <div v-if="state.isHeaderVisible"
             class="top-wrapper"
        >
            <p-icon-button class="back-button"
                           name="ic_arrow-left"
                           @click="handleGoBackProjectLanding"
            />
            <p-pane-layout class="flex-grow">
                <div class="header-container">
                    <div class="title-wrapper">
                        <p-i name="ic_document-filled"
                             :color="peacock[600]"
                             width="1.25rem"
                             height="1.25rem"
                        /><span class="title-text">{{ state.item?.name }}</span>
                        <favorite-button :item-id="projectDetailPageState.projectId"
                                         :favorite-type="FAVORITE_TYPE.PROJECT"
                                         scale="0.8"
                        />
                    </div>
                    <div class="button-wrapper">
                        <template v-if="projectPageState.isWorkspaceOwner">
                            <p-icon-button name="ic_settings"
                                           class="edit-btn"
                                           size="sm"
                                           @click="projectPageStore.openProjectFormModal()"
                            />
                            <p-icon-button name="ic_move"
                                           size="sm"
                                           style-type="transparent"
                                           @click="handleOpenProjectGroupMoveModal"
                            />
                            <p-icon-button name="ic_delete"
                                           class="delete-btn"
                                           size="sm"
                                           @click="openProjectDeleteForm"
                            />
                        </template>
                        <p-badge v-if="projectDetailPageGetters.projectType === 'PRIVATE'"
                                 class="ml-4 flex-shrink-0"
                                 style-type="gray100"
                                 badge-type="subtle"
                        >
                            <div class="badge-content-wrapper">
                                <p-i name="ic_lock-filled"
                                     width="0.75rem"
                                     height="0.75rem"
                                     color="inherit"
                                />
                                <span class="truncate">{{ $t('PROJECT.DETAIL.INVITE_ONLY') }}</span>
                            </div>
                        </p-badge>
                    </div>
                </div>
            </p-pane-layout>
        </div>
        <router-view />
        <p-button-modal :header-title="formState.headerTitle"
                        :centered="true"
                        size="sm"
                        :fade="true"
                        :backdrop="true"
                        :visible.sync="formState.projectDeleteFormVisible"
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

        <project-form-modal
            v-if="projectPageState.projectFormModalVisible"
            :visible="projectPageState.projectFormModalVisible"
            :project-group-id="state.projectGroupId"
            :project="state.item"
            @confirm="handleConfirmProjectForm"
            @update:visible="projectPageStore.setProjectFormModalVisible"
        />
        <project-main-project-group-move-modal v-if="state.projectGroupMoveModalVisible"
                                               :visible.sync="state.projectGroupMoveModalVisible"
                                               is-project
                                               :target-id="projectDetailPageState.projectId"
                                               @confirm="handleConfirmProjectGroupMoveModal"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-detail-page {
    height: 100%;
    margin-top: -0.25rem;
}
.top-wrapper {
    max-width: 85.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    .header-container {
        @apply flex gap-4 items-center;
        padding: 0.75rem 1rem;
        .title-wrapper {
            @apply text-label-lg font-bold text-peacock-800 truncate;
            display: flex;
            align-items: center;

            .title-text {
                margin-left: 0.375rem;
                line-height: 1.25rem;
                padding-right: 0.375rem;
            }
        }

        .button-wrapper {
            @apply inline-flex items-center;
            .badge-content-wrapper {
                @apply text-gray-700;
                display: flex;
                align-content: center;
                gap: 0.25rem;
            }
        }
    }
}
</style>
