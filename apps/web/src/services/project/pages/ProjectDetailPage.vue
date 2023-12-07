<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PBadge, PBreadcrumbs, PButton, PButtonModal, PCopyButton, PDataLoader, PHeading, PIconButton, PTab, PI,
} from '@spaceone/design-system';
import type { Route } from '@spaceone/design-system/types/navigation/breadcrumbs/type';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { find } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ProjectDeleteParameters } from '@/schema/identity/project/api-verbs/delete';
import type { ProjectModel } from '@/schema/identity/project/model';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import MaintenanceHappeningList from '@/services/project/components/ProjectDetailMaintenanceHappeningList.vue';
import MaintenanceWindowFormModal from '@/services/project/components/ProjectDetailMaintenanceWindowFormModal.vue';
import ProjectFormModal from '@/services/project/components/ProjectFormModal.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/stores/project-detail-page-store';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';


interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.state;
const projectDetailPageGetters = projectDetailPageStore.getters;
const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
});
const state = reactive({
    item: computed<ProjectModel|null>(() => projectDetailPageState.currentProject),
    projectGroupId: computed<string>(() => state.item?.project_group_id || ''),
    projectGroupInfo: computed<ProjectGroupReferenceItem>(() => storeState.projectGroups?.[state.projectGroupId] ?? {}),
    // projectGroupNames: [],
    pageNavigation: computed<Route[]>(() => {
        const results: Route[] = [
            { name: i18n.t('MENU.PROJECT') as string, path: '/project' },
            // ...state.projectGroupNames.map(d => ({
            //     name: d.name,
            //     path: `/project?select_pg=${d.project_group_id}`,
            // })),
        ];
        if (state.projectGroupId?.length) {
            results.push({ name: state.projectGroupInfo?.name || '', path: `/project?select_pg=${state.projectGroupId}` });
        }
        results.push({ name: state.item?.name || '' });
        return results;
    }),
    maintenanceWindowFormVisible: false,
    counts: computed(() => ({
        TRIGGERED: find(projectDetailPageState.alertCounts, { state: ALERT_STATE.TRIGGERED })?.total ?? 0,
    })),
});

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
        await SpaceConnector.clientV2.identity.project.delete<ProjectDeleteParameters>({
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
            project_id: projectDetailPageState.projectId,
        });
        // await store.dispatch('favorite/project/removeItem', { id: projectId.value });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '');
        router.go(-1);
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

const onChangeTab = (activeTab) => {
    if (activeTab === route.name) return;
    router.replace({ name: activeTab });
};

const urlQueryHelper = new QueryHelper();
const handleCreateMaintenanceWindow = (maintenanceWindowId: string) => {
    singleItemTabState.activeTab = PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME;
    urlQueryHelper.setFilters([{ k: 'maintenance_window_id', v: maintenanceWindowId }]);
    router.replace({ name: singleItemTabState.activeTab, query: { filters: urlQueryHelper.rawQueryStrings } });
};

/* Watchers */
watch(() => projectDetailPageState.projectId, async (projectId) => {
    if (projectId) {
        await Promise.allSettled([
            projectDetailPageStore.getProject(projectId),
            projectDetailPageStore.getAlertCounts(projectId),
        ]);
    }
}, { immediate: true });

watch(() => route.name, () => {
    const exactRoute = route.matched.find((d) => singleItemTabState.tabs.find((tab) => tab.name === d.name));
    singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
}, { immediate: true });

watch(() => props.id, (after, before) => {
    if (after !== before) {
        projectDetailPageStore.setProjectId(after);
    }
}, { immediate: true });

onUnmounted(() => {
    projectDetailPageStore.reset();
});
</script>

<template>
    <general-page-layout overflow="scroll">
        <p-data-loader class="page-inner"
                       :loading="projectDetailPageState.loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <p-breadcrumbs :routes="state.pageNavigation" />
            <div v-if="state.item"
                 class="top-wrapper"
            >
                <p-heading :title="state.item?.name"
                           show-back-button
                           @click-back-button="$router.go(-1)"
                >
                    <template #title-right-extra>
                        <div class="button-wrapper">
                            <span class="favorite-button-wrapper">
                                <favorite-button :item-id="projectDetailPageState.projectId"
                                                 :favorite-type="FAVORITE_TYPE.PROJECT"
                                />
                            </span>
                            <template v-if="projectPageState.isWorkspaceOwner">
                                <p-icon-button name="ic_settings"
                                               class="edit-btn"
                                               size="md"
                                               @click="projectPageStore.openProjectFormModal()"
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
                        <div class="top-right-group">
                            <p class="copy-project-id">
                                <strong class="label">{{ $t('PROJECT.DETAIL.PROJECT_ID') }}&nbsp; </strong>
                                {{ projectDetailPageState.projectId }}
                                <p-copy-button class="icon"
                                               :value="projectDetailPageState.projectId"
                                />
                            </p>
                            <p-button v-if="singleItemTabState.activeTab === PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME"
                                      style-type="tertiary"
                                      icon-left="ic_spanner-filled"
                                      class="ml-3"
                                      @click="state.maintenanceWindowFormVisible = true"
                            >
                                {{ $t('PROJECT.DETAIL.ALERT.MAINTENANCE_WINDOW.CREATE') }}
                            </p-button>
                        </div>
                    </template>
                </p-heading>
            </div>

            <maintenance-happening-list class="maintenance-happening-list"
                                        :project-id="projectDetailPageState.projectId"
            />

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
                    <beta-mark v-if="tab.name === 'projectAlert' || tab.name === 'projectNotifications' || tab.name === 'projectMaintenanceWindow'" />
                </template>
            </p-tab>
        </p-data-loader>

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
        <maintenance-window-form-modal :visible.sync="state.maintenanceWindowFormVisible"
                                       :project-id="projectDetailPageState.projectId"
                                       @confirm="handleCreateMaintenanceWindow"
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
        .badge-content-wrapper {
            @apply text-gray-900;
            display: flex;
            align-content: center;
            gap: 0.25rem;
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

.edit-btn {
    @apply ml-3;
}

.maintenance-happening-list {
    margin-bottom: 1.875rem;
}
</style>
