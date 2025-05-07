<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';
import type { Location } from 'vue-router/types/router';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PI, PIconButton, PSelectDropdown, PButtonModal, PButton, PEmpty, PLazyImg, PLink,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import type { ProjectRemoveUsersParameters } from '@/api-clients/identity/project/schema/api-verbs/remove-users';
import type { ProjectUpdateParameters } from '@/api-clients/identity/project/schema/api-verbs/udpate';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import SystemAdminImage from '@/assets/images/role/img_avatar_system-admin.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import type { ProjectAlertConfigListParameters } from '@/schema/monitoring/project-alert-config/api-verbs/list';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';
import type { WebhookListParameters } from '@/schema/monitoring/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { MENU_ID } from '@/lib/menu/config';
import { arrayToQueryString } from '@/lib/router-query-string';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { gray, peacock } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import ProjectFormModal from '@/services/project/v1/components/ProjectFormModal.vue';
import ProjectMainDeleteModal from '@/services/project/v1/components/ProjectMainDeleteModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/v1/components/ProjectMainProjectGroupMoveModal.vue';
import ProjectMemberInviteModal from '@/services/project/v1/components/ProjectMemberInviteModal.vue';
import ProjectTagsModal from '@/services/project/v1/components/ProjectTagsModal.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';
import { useProjectTreeStore } from '@/services/project/v1/stores/project-tree-store';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

const ROLE_INFO_MAP = {
    [ROLE_TYPE.SYSTEM_ADMIN]: { icon: SystemAdminImage, label: 'System Admin' },
    [ROLE_TYPE.DOMAIN_ADMIN]: { icon: DomainAdminImage, label: 'Domain Admin' },
    [ROLE_TYPE.WORKSPACE_OWNER]: { icon: WorkspaceOwnerImage, label: 'Workspace Owner' },
    [ROLE_TYPE.WORKSPACE_MEMBER]: { icon: WorkspaceMemberImage, label: 'Workspace Member' },
    [ROLE_TYPE.USER]: { icon: UserImage, label: 'User' },
} as const;
interface ViewInItem {
    label: TranslateResult;
    to: Location;
}
interface Props {
    id: string;
}
const props = defineProps<Props>();
// const route = useRoute();
const router = useRouter();

const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.state;
const projectDetailPageGetters = projectDetailPageStore.getters;
const projectTreeStore = useProjectTreeStore();
const alertManagerUiAffectsSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');

const userWorkspaceStore = useUserWorkspaceStore();
const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const gnbStore = useGnbStore();

const { visibleContents } = useContentsAccessibility(MENU_ID.ALERT_MANAGER);

const queryHelper = new QueryHelper();
const storeState = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    projects: computed(() => allReferenceStore.getters.project),
    visibleAlertTab: computed<boolean>(() => visibleContents.value && (alertManagerUiAffectsSchema.value?.visibleProjectAlertTab ?? false)),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    menuItems: computed(() => [
        {
            type: 'item',
            name: 'update',
            label: i18n.t('PROJECT.DETAIL.UPDATE'),
            icon: 'ic_settings',
        },
        {
            type: 'item',
            name: 'move',
            label: i18n.t('PROJECT.DETAIL.MOVE'),
            icon: 'ic_move',
        },
        { type: 'divider', name: 'divider' },
        {
            type: 'item',
            name: 'delete',
            label: i18n.t('PROJECT.DETAIL.DELETE'),
            icon: 'ic_delete',
        },
    ]),
    viewInItems: computed<ViewInItem[]>(() => {
        const defaultItems = [
            {
                label: i18n.t('PROJECT.DETAIL.SERVICE_ACCOUNT'),
                to: {
                    name: SERVICE_ACCOUNT_ROUTE._NAME,
                    params: {
                        workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
                    },
                    query: {
                        filters: queryHelper.setFilters([
                            { k: 'project_id', v: [props.id], o: '' },
                        ]).rawQueryStrings,
                    },
                },
            },
            {
                label: i18n.t('PROJECT.DETAIL.COST_ANALYSIS'),
                to: {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    params: {
                        workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
                        dataSourceId: Object.keys(storeState.costDataSource)?.[0],
                        costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
                    },
                    query: {
                        filters: arrayToQueryString([
                            { k: 'project_id', v: [props.id], o: 'in' },
                        ]),
                    },
                },
            },
        ];
        if (visibleContents.value) {
            defaultItems.unshift({
                label: i18n.t('PROJECT.DETAIL.CLOUD_SERVICE'),
                to: {
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                    params: {
                        workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
                    },
                    query: {
                        project: [props.id],
                    },
                },
            });
        }
        return defaultItems;
    }),
    currentProject: computed<ProjectModel|undefined>(() => projectDetailPageState.currentProject),
    parentGroupId: computed(() => storeState.projects[props.id]?.data?.groupInfo?.id),
    projectGroupMoveModalVisible: false,
    projectDeleteModalVisible: false,
    projectEditModalVisible: false,
    isHeaderIconHovered: false,
});

const memberState = reactive({
    loading: false,
    memberModalVisible: false,
    memberInviteModalVisible: false,
    projectUserIdList: [] as string[],
    totalCount: 0,
    userIcon: computed<Record<string, any>>(() => ({
        [ROLE_TYPE.SYSTEM_ADMIN]: SystemAdminImage,
        [ROLE_TYPE.DOMAIN_ADMIN]: DomainAdminImage,
        [ROLE_TYPE.WORKSPACE_OWNER]: WorkspaceOwnerImage,
        [ROLE_TYPE.WORKSPACE_MEMBER]: WorkspaceMemberImage,
        [ROLE_TYPE.USER]: UserImage,
    })),
});

const tagsState = reactive({
    loading: false,
    tagsModalVisible: false,
    tags: computed(() => state.currentProject?.tags ?? {}),
});

const webhooksState = reactive({
    loading: false,
    webhookCount: 0,
    alertActivated: false,
});

/* Event */
const handleSelectItem = (selected: MenuItem) => {
    if (selected.name === 'update') state.projectEditModalVisible = true;
    if (selected.name === 'move') state.projectGroupMoveModalVisible = true;
    if (selected.name === 'delete') state.projectDeleteModalVisible = true;
};

const handleClickWebhook = () => {
    if (!props.id) return;
    if (!webhooksState.alertActivated) {
        router.push({ name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT._NAME, params: { id: props.id } }).catch(() => {});
        return;
    }
    router.push({ name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT._NAME, params: { id: props.id }, query: { tab: 'webhook' } }).catch(() => {});
};
const handleOpenMemberModal = () => {
    memberState.memberModalVisible = true;
};
const handleCloseMemberModal = () => {
    memberState.memberModalVisible = false;
};
const handleClickInvite = () => {
    memberState.memberModalVisible = false;
    memberState.memberInviteModalVisible = true;
};
const handleConfirmInvite = () => {
    fetchUserList();
};
const handleOpenTagsModal = () => {
    tagsState.tagsModalVisible = true;
};
const handleTagUpdate = async (newTags) => {
    try {
        tagsState.loading = true;
        const result = await SpaceConnector.client.identity.project.update<ProjectUpdateParameters, ProjectModel>({
            project_id: props.id,
            tags: newTags,
        });
        projectDetailPageStore.setProject(result);
        showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
    } finally {
        tagsState.loading = false;
        tagsState.tagsModalVisible = false;
    }
};
const handleConfirmProjectForm = (_, data: ProjectModel) => {
    projectDetailPageStore.setProject(data);
};

const handleConfirmProjectGroupMoveModal = () => {
    projectDetailPageStore.getProject();
};

const handleRefreshTree = () => {
    projectTreeStore.refreshProjectTree();
};

const handleHeaderIconHover = (isHovered: boolean) => {
    state.isHeaderIconHovered = isHovered;
};
const handleClickBackButton = () => {
    if (state.parentGroupId) {
        router.push({
            name: PROJECT_ROUTE_V1._NAME,
            params: { projectGroupId: state.parentGroupId },
        });
        return;
    }
    router.push({ name: PROJECT_ROUTE_V1._NAME });
};

const handleRemoveProjectUser = async (userId: string) => {
    try {
        const params: ProjectRemoveUsersParameters = {
            project_id: props.id,
            users: [userId],
        };
        await SpaceConnector.clientV2.identity.project.removeUsers<ProjectRemoveUsersParameters, ProjectModel>(params);
        await fetchUserList();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};


/* API */
const fetchWorkspaceUserList = async () => {
    memberState.loading = true;
    try {
        const res = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>();
        memberState.projectUserIdList = res.results?.map((d) => d.user_id) ?? [];
        memberState.totalCount = res.total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        memberState.projectUserIdList = [];
        memberState.totalCount = 0;
    } finally {
        memberState.loading = false;
    }
};
const fetchProjectUsers = async () => {
    memberState.loading = true;
    // state.selectIndex = [];
    try {
        const res = await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
            project_id: props.id,
        });
        memberState.projectUserIdList = res.users ?? [];
        memberState.totalCount = res.users?.length ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        memberState.projectUserIdList = [];
        memberState.totalCount = 0;
    } finally {
        memberState.loading = false;
    }
};
const fetchUserList = async () => {
    if (projectDetailPageGetters.projectType === 'PUBLIC') {
        await fetchWorkspaceUserList();
    } else {
        await fetchProjectUsers();
    }
};

const listWebhooks = async () => {
    if (!props.id) return;
    try {
        const res = await SpaceConnector.clientV2.monitoring.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
            project_id: props.id,
        });
        webhooksState.webhookCount = res.total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const getProjectAlertActivated = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.monitoring.projectAlertConfig.list<ProjectAlertConfigListParameters, ListResponse<ProjectAlertConfigModel>>({
            project_id: props.id,
        });
        webhooksState.alertActivated = !!results?.length;
    } catch (e) {
        webhooksState.alertActivated = false;
        ErrorHandler.handleError(e);
    }
};


/* Watchers */
watch(() => projectDetailPageGetters.projectType, async () => {
    if (storeState.visibleAlertTab) {
        await Promise.allSettled([
            getProjectAlertActivated(),
            listWebhooks(),
        ]);
    }
    await fetchUserList();
});

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

</script>

<template>
    <div class="project-detail-tab-header">
        <div class="header-container">
            <div class="header-icon-wrapper tablet"
                 @mouseover="handleHeaderIconHover(true)"
                 @mouseleave="handleHeaderIconHover(false)"
            >
                <p-i :name="state.isHeaderIconHovered ? 'ic_arrow-left' : 'ic_document-filled'"
                     width="1.5rem"
                     height="1.5rem"
                     :color="state.isHeaderIconHovered ? gray[900] : peacock[600]"
                     @click="handleClickBackButton"
                />
            </div>
            <div class="header-icon-wrapper mobile">
                <p-i name="ic_arrow-left"
                     width="1.5rem"
                     height="1.5rem"
                     :color="gray[900]"
                     class="cursor-pointer mr-2"
                     @click="handleClickBackButton"
                />
                <p-i name="ic_document-filled"
                     width="1.5rem"
                     height="1.5rem"
                     :color="peacock[600]"
                />
            </div>
            <div class="header-contents">
                <div class="title-wrapper">
                    <span class="title">
                        {{ state.currentProject?.name ?? '' }}
                    </span>
                    <p-select-dropdown style-type="tertiary-icon-button"
                                       button-icon="ic_ellipsis-horizontal"
                                       size="sm"
                                       :menu="state.menuItems"
                                       :selected="[]"
                                       use-fixed-menu-style
                                       reset-selection-on-menu-close
                                       @select="handleSelectItem"
                    />
                </div>
                <div class="header-sub-contents">
                    <div class="description">
                        <template v-if="projectDetailPageGetters.projectType === 'PRIVATE'">
                            <div class="info-item invite-only">
                                <p-i name="ic_lock-filled"
                                     width="0.625rem"
                                     height="0.625rem"
                                     color="inherit"
                                />
                                <span>{{ $t('PROJECT.DETAIL.INVITE_ONLY') }}</span>
                            </div>
                            <p-i name="ic_dot"
                                 width="0.125rem"
                                 height="0.125rem"
                                 :color="gray[400]"
                            />
                            <div class="info-item"
                                 @click="handleOpenMemberModal"
                            >
                                <template v-if="projectDetailPageGetters.projectType === 'PRIVATE' && memberState.totalCount === 0">
                                    <p-i class="info-icon"
                                         name="ic_plus"
                                         width="0.75rem"
                                         height="0.75rem"
                                         color="inherit"
                                    />
                                    <span>{{ $t('PROJECT.DETAIL.ADD_MEMBERS') }}</span>
                                </template>
                                <template v-else>
                                    <p-i class="info-icon"
                                         name="ic_member"
                                         width="0.75rem"
                                         height="0.75rem"
                                         color="inherit"
                                    />
                                    <span>{{ memberState.totalCount }}{{ $t('PROJECT.DETAIL.MEMBERS') }}</span>
                                </template>
                            </div>
                            <p-i name="ic_dot"
                                 width="0.125rem"
                                 height="0.125rem"
                                 :color="gray[400]"
                            />
                        </template>
                        <div v-if="storeState.visibleAlertTab"
                             class="info-item"
                             @click="handleClickWebhook"
                        >
                            <p-i class="info-icon"
                                 name="ic_webhook"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="inherit"
                            />
                            <span>{{ webhooksState.webhookCount }} {{ $t('PROJECT.DETAIL.WEBHOOKS') }}</span>
                        </div>
                        <p-i name="ic_dot"
                             width="0.125rem"
                             height="0.125rem"
                             :color="gray[400]"
                        />
                        <div class="info-item"
                             @click="handleOpenTagsModal"
                        >
                            <p-i class="info-icon"
                                 name="ic_label"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="inherit"
                            />
                            <span>{{ Object.keys(tagsState.tags).length }}{{ $t('PROJECT.DETAIL.TAGS') }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <p-button-modal :header-title="$t('PROJECT.DETAIL.MEMBER_TITLE')"
                            :visible.sync="memberState.memberModalVisible"
                            size="md"
                            hide-footer-close-button
                            @confirm="handleCloseMemberModal"
            >
                <template #body>
                    <div class="member-contents-wrapper">
                        <div class="member-contents">
                            <div class="contents-header">
                                <span>{{ $t('PROJECT.DETAIL.INVITE_MEMBER_DESC') }}</span>
                                <p-button v-if="projectDetailPageGetters.projectType === 'PRIVATE'"
                                          icon-left="ic_plus_bold"
                                          style-type="tertiary"
                                          @click="handleClickInvite"
                                >
                                    {{ $t('PROJECT.DETAIL.MEMBER.INVITE') }}
                                </p-button>
                            </div>
                            <div class="main-contents">
                                <div v-if="memberState.projectUserIdList.length">
                                    <div v-for="(userId) in memberState.projectUserIdList"
                                         :key="userId"
                                         class="member-item"
                                    >
                                        <div class="left-contents">
                                            <p-lazy-img :src="ROLE_INFO_MAP[storeState.users[userId]?.data.roleInfo.role_type]?.icon"
                                                        class="menu-icon"
                                                        width="1.75rem"
                                                        height="1.75rem"
                                            />
                                            <span>{{ userId }} <span v-if="!!storeState.users[userId]?.name">({{ storeState.users[userId]?.name }})</span></span>
                                        </div>
                                        <div class="right-contents">
                                            <span>{{ ROLE_INFO_MAP[storeState.users[userId]?.data.roleInfo.role_type]?.label }}</span>
                                            <p-icon-button name="ic_delete"
                                                           size="sm"
                                                           @click="handleRemoveProjectUser(userId)"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p-empty v-else
                                         class="project-member-empty"
                                         show-image
                                         :title="$t('PROJECT.DETAIL.MEMBER.NO_PROJECT_MEMBER')"
                                >
                                    <template #image>
                                        <img alt="illust_astronaut_radio"
                                             src="@/assets/images/img_ghost.png"
                                        >
                                    </template>
                                </p-empty>
                            </div>
                        </div>
                    </div>
                </template>
                <template #confirm-button>
                    {{ $t('PROJECT.DETAIL.MEMBER.DONE') }}
                </template>
            </p-button-modal>
            <project-member-invite-modal v-if="memberState.memberInviteModalVisible"
                                         :visible.sync="memberState.memberInviteModalVisible"
                                         :project-id="props.id"
                                         @confirm="handleConfirmInvite"
            />
            <project-tags-modal v-if="tagsState.tagsModalVisible"
                                :visible.sync="tagsState.tagsModalVisible"
                                :tags="tagsState.tags"
                                :project-id="props.id"
                                @update="handleTagUpdate"
            />
            <project-form-modal v-if="state.projectEditModalVisible"
                                :visible.sync="state.projectEditModalVisible"
                                :project-id="props.id"
                                @confirm="handleConfirmProjectForm"
            />
            <project-main-project-group-move-modal v-if="state.projectGroupMoveModalVisible"
                                                   :visible.sync="state.projectGroupMoveModalVisible"
                                                   is-project
                                                   :target-id="projectDetailPageState.projectId"
                                                   @confirm="handleConfirmProjectGroupMoveModal"
            />
            <project-main-delete-modal v-if="state.projectDeleteModalVisible"
                                       :visible.sync="state.projectDeleteModalVisible"
                                       is-project
                                       :target-id="props.id"
                                       @confirm="handleRefreshTree"
            />
        </div>

        <div class="quick-link-wrapper">
            <span class="field-title">{{ $t('PROJECT.DETAIL.VIEW_IN') }}</span>
            <p-link v-for="(item, idx) in state.viewInItems"
                    :key="`view-in-${idx}`"
                    new-tab
                    action-icon="internal-link"
                    size="md"
                    :to="item.to"
            >
                {{ item.label }}
            </p-link>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-detail-tab-header {

    .header-container {
        @apply flex gap-3;
        .header-icon-wrapper {
            @apply flex items-center justify-center border-2 border-white;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 0.75rem;
            background-color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            &.tablet {
                display: flex;
            }
            &.mobile {
                display: none;
            }
        }
        .header-contents {
            .title-wrapper {
                @apply flex items-center gap-2;
                padding-bottom: 0.375rem;
                .title {
                    @apply text-display-md font-bold text-gray-900;
                }
            }
            .header-sub-contents {
                .description {
                    @apply flex items-center gap-2;
                    .info-item {
                        @apply flex items-center text-label-sm text-gray-700 cursor-pointer;
                        gap: 0.15625rem;
                        .info-icon {
                            min-width: 0.75rem;
                        }
                        &.invite-only {
                            @apply text-gray-900 cursor-auto;
                        }
                    }
                }
            }
        }

        .member-contents-wrapper {
            @apply bg-violet-100;
            padding: 1rem;
            width: 100%;
            height: 25rem;
            .member-contents {
                @apply rounded-lg border border-violet-200 bg-white;
                padding: 0.75rem;
                height: 100%;

                .contents-header {
                    @apply flex items-center justify-between text-label-md font-bold text-gray-900;
                    padding-bottom: 0.5rem;
                    height: 2.5rem;
                }
                .main-contents {
                    @apply overflow-scroll;
                    height: calc(100% - 2.5rem);
                    .member-item {
                        @apply flex items-center justify-between;
                        padding: 0.5rem 0.25rem 0.5rem 0.5rem;
                        .left-contents {
                            @apply flex items-center gap-2 text-label-md text-gray-900;
                            .menu-icon {
                                @apply rounded-full;
                            }
                        }
                        .right-contents {
                            @apply text-label-md text-gray-500 flex items-center gap-2;
                        }
                    }
                    .project-member-empty {
                        margin-top: 3rem;
                    }
                }
            }
        }
    }

    .quick-link-wrapper {
        @apply flex items-center gap-4 bg-white border border-gray-200 rounded-lg;
        width: 100%;
        height: 2.75rem;
        padding: 0.75rem 1rem;
        margin-top: 1.5rem;

        .field-title {
            @apply text-label-md font-bold text-gray-600;
        }
    }
}

@screen mobile {
    .project-detail-tab-header {
        .header-container {
            .header-icon-wrapper {
                @apply bg-transparent;
                align-items: flex-start;
                cursor: default;
                border: none;
                padding-top: 0.25rem;
                &.tablet {
                    display: none;
                }
                &.mobile {
                    display: flex;
                }
            }
        }
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .dropdown-button-component {
        @apply rounded-full;

        &.opened {
            @apply rounded-full;
        }
    }
}
</style>
