<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PBadge, PButtonModal, PDataLoader, PHeading, PIconButton, PTab, PI, PLink,
} from '@spaceone/design-system';
import type { Route } from '@spaceone/design-system/types/navigation/breadcrumbs/type';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { find, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ProjectDeleteParameters } from '@/schema/identity/project/api-verbs/delete';
import type { ProjectModel } from '@/schema/identity/project/model';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import { i18n as _i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import ProjectFormModal from '@/services/project/components/ProjectFormModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/components/ProjectMainProjectGroupMoveModal.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/stores/project-detail-page-store';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';

interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

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

const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    trustedAccounts: computed(() => allReferenceStore.getters.trustedAccount),
});
const state = reactive({
    item: computed<ProjectModel|null>(() => projectDetailPageState.currentProject),
    projectGroupId: computed<string|undefined>(() => state.item?.project_group_id),
    projectGroupInfo: computed<ProjectGroupReferenceItem>(() => storeState.projectGroups?.[state.projectGroupId] ?? {}),
    pageNavigation: computed<Route[]>(() => {
        let results: Route[] = [
            { name: _i18n.t('MENU.PROJECT') as string, to: { name: PROJECT_ROUTE._NAME } },
        ];
        if (!isEmpty(state.projectGroupInfo)) {
            results.push({
                name: state.projectGroupInfo.name,
                to: referenceRouter(state.projectGroupId, { resource_type: 'identity.ProjectGroup' }),
            });
        }
        if (route.name === PROJECT_ROUTE.DETAIL.EVENT_RULE._NAME) {
            results = results.concat([
                { name: state.item?.name, to: referenceRouter(state.item?.project_id, { resource_type: 'identity.Project' }) },
                { name: _i18n.t('PROJECT.DETAIL.ALERT.EVENT_RULE') as string },
            ]);
        } else if (route.name === PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS.ADD._NAME) {
            results = results.concat([
                { name: state.item?.name, to: referenceRouter(state.item?.project_id, { resource_type: 'identity.Project' }) },
                { name: _i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: route.query.protocolLabel }) as string },
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
    relatedTrustedAccount: computed(() => storeState.trustedAccounts[state.item?.trusted_account_id]?.data ?? {}),
    isSyncedAccount: computed(() => state.item?.is_managed && state.relatedTrustedAccount?.schedule?.state === 'ENABLED'),
});

/** Tabs */
const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        {
            name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
            label: _i18n.t('PROJECT.DETAIL.TAB_SUMMARY'),
            keepAlive: true,
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
            label: _i18n.t('PROJECT.DETAIL.TAB_PROEJCT_MEMBER'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
            label: _i18n.t('PROJECT.DETAIL.TAB_ALERT'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
            label: _i18n.t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.TAG._NAME,
            label: _i18n.t('PROJECT.DETAIL.TAB_TAG'),
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
    formState.headerTitle = _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE');
    formState.themeColor = 'alert';
    formState.modalContent = _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT');
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
        showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '');
        router.go(-1);
        const isFavoriteItem = favoriteGetters.projectItems.find((item) => item.itemId === projectDetailPageState.projectId);
        if (isFavoriteItem) {
            await favoriteStore.deleteFavorite({
                itemType: FAVORITE_TYPE.PROJECT,
                workspaceId: storeState.currentWorkspaceId || '',
                itemId: projectDetailPageState.projectId as string,
            });
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'));
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

const onChangeTab = (activeTab) => {
    if (activeTab === route.name) return;
    router.replace(getProperRouteLocation({ name: activeTab }));
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

watch(() => route.name, () => {
    const exactRoute = route.matched.find((d) => singleItemTabState.tabs.find((tab) => tab.name === d.name));
    singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
}, { immediate: true });

watch([
    () => props.id,
    () => appContextStore.getters.globalGrantLoading,
], ([id, globalGrantLoading]) => {
    if (!globalGrantLoading) projectDetailPageStore.setProjectId(id);
}, { immediate: true });

watch([() => singleItemTabState.activeTab, () => state.item], () => {
    gnbStore.setBreadcrumbs(state.pageNavigation);
});
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
        <p-data-loader class="page-inner"
                       :loading="projectDetailPageState.loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <div v-if="state.item"
                 class="top-wrapper"
            >
                <p-heading :title="state.item?.name"
                           show-back-button
                           @click-back-button="$router.go(-1)"
                >
                    <template #title-right-extra>
                        <div class="button-wrapper">
                            <template v-if="projectPageState.isWorkspaceOwner">
                                <p-icon-button name="ic_settings"
                                               class="edit-btn"
                                               size="md"
                                               @click="projectPageStore.openProjectFormModal()"
                                />
                                <p-icon-button name="ic_move"
                                               style-type="transparent"
                                               @click="handleOpenProjectGroupMoveModal"
                                />
                                <p-icon-button name="ic_delete"
                                               class="delete-btn"
                                               size="md"
                                               @click="openProjectDeleteForm"
                                />
                            </template>
                            <p-badge v-if="projectDetailPageGetters.projectType === 'PRIVATE'"
                                     style-type="gray200"
                                     badge-type="subtle"
                            >
                                <div class="badge-content-wrapper">
                                    <p-i name="ic_lock-filled"
                                         width="0.75rem"
                                         height="0.75rem"
                                         color="inherit"
                                    />
                                    <span>{{ $t('PROJECT.DETAIL.INVITE_ONLY') }}</span>
                                </div>
                            </p-badge>
                        </div>
                    </template>
                </p-heading>
            </div>

            <p-tab v-if="state.item"
                   :tabs="singleItemTabState.tabs"
                   :active-tab.sync="singleItemTabState.activeTab"
                   @change="onChangeTab"
            >
                <keep-alive>
                    <router-view />
                </keep-alive>
                <template #extra="tab">
                    <p-badge v-if="tab.label === $t('PROJECT.DETAIL.TAB_ALERT') && state.counts[ALERT_STATE.TRIGGERED] !== 0"
                             style-type="primary3"
                             badge-type="subtle"
                    >
                        {{ numberFormatter(state.counts[ALERT_STATE.TRIGGERED]) }}
                    </p-badge>
                    <beta-mark v-if="tab.name === 'projectAlert' || tab.name === 'projectNotifications'" />
                </template>
            </p-tab>
        </p-data-loader>

        <p-button-modal v-if="formState.projectDeleteFormVisible && !state.isSyncedAccount"
                        :header-title="formState.headerTitle"
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
        <p-button-modal v-else-if="formState.projectDeleteFormVisible && state.isSyncedAccount"
                        :visible.sync="formState.projectDeleteFormVisible"
                        :header-title="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        size="sm"
                        :hide-footer-close-button="true"
                        @confirm="() => formState.projectDeleteFormVisible = false"
        >
            <template #body>
                <i18n path="IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DELETE_CHECK_MODAL.DESC"
                      tag="p"
                >
                    <template #serviceAccountName>
                        <p-link new-tab
                                highlight
                                action-icon="external-link"
                                :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME, params: { serviceAccountId: state.relatedTrustedAccount.trusted_account_id }}"
                        >
                            {{ state.relatedTrustedAccount.name }}
                        </p-link>
                    </template>
                </i18n>
            </template>
            <template #confirm-button>
                {{ $t('APP.MAIN.OK') }}
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
.page-inner {
    height: 100%;
    max-width: 1368px;
}
.p-heading {
    margin-top: 0.25rem;
    margin-bottom: 0;
}
.top-wrapper {
    @apply mb-8 flex flex-wrap items-center;
    .button-wrapper {
        @apply inline-flex items-center;
        .badge-content-wrapper {
            @apply text-gray-900;
            display: flex;
            align-content: center;
            gap: 0.25rem;
        }
    }
}

.p-tab {
    @apply rounded-lg;
}

/* custom design-system component - p-data-loader */
:deep(.p-data-loader) {
    .data-wrapper {
        overflow-y: unset;
    }
}
</style>
