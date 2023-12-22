<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PButton, PHeading, PI, PTableCheckModal, PToolboxTable,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectRemoveUsersParameters } from '@/schema/identity/project/api-verbs/remove-users';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { store } from '@/store';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectMemberInviteModal from '@/services/project/components/ProjectMemberInviteModal.vue';
import { useProjectDetailPageStore } from '@/services/project/stores/project-detail-page-store';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import type { ProjectMemberItem } from '@/services/project/types/project-member-type';


interface MemberDataTableItem extends ProjectMemberItem {
    user_id: string;
}
interface UserItem {
    user_id: string;
    user_name: string;
}

interface Props {
    projectId?: string;
    filters?: { k: string; v: string }[];
}
const props = withDefaults(defineProps<Props>(), {
    projectId: '',
    filters: () => ([]),
});
const emit = defineEmits<{(e: 'update-filters', filters: any): void;
}>();

const allReferenceStore = useAllReferenceStore();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageGetters = projectDetailPageStore.getters;
const storeState = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
});
const state = reactive({
    searchText: props.filters.map((d) => d.v).join(' ') || '',
    selectIndex: [] as number[],
    fields: [
        { label: 'User ID', name: 'user_id' },
        { label: 'User Name', name: 'user_name' },
    ] as DataTableField[],
    workspaceUserIdList: [] as string[],
    projectUserIdList: [] as string[],
    refinedItems: computed<UserItem[]>(() => {
        const users: UserItem[] = state.projectUserIdList.map((d) => ({
            user_id: d,
            user_name: storeState.users[d]?.name ?? d,
        }));
        const filteredUsers = users.filter((d) => {
            const searchText = state.searchText.toLowerCase();
            return d.user_id.toLowerCase().includes(searchText)
                || d.user_name.toLowerCase().includes(searchText);
        });
        return filteredUsers.slice(state.pageStart - 1, state.pageStart + state.pageLimit - 1);
    }),
    items: [] as MemberDataTableItem[],
    loading: true,
    totalCount: 0,
    pageLimit: 15,
    pageStart: 1,
    selectedItems: computed(() => state.selectIndex.map((i) => state.refinedItems[i])),
    memberInviteFormVisible: false,
    memberDeleteModalVisible: false,
});

/* Util */
const fetchUserList = () => {
    if (projectDetailPageGetters.projectType === 'PUBLIC') {
        fetchWorkspaceUserList();
    } else {
        fetchProjectUsers();
    }
};

/* Api */
const fetchProjectUsers = async () => {
    state.loading = true;
    state.selectIndex = [];
    try {
        const res = await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
            project_id: props.projectId,
        });
        state.projectUserIdList = res.users ?? [];
        state.totalCount = res.users?.length ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};
const fetchWorkspaceUserList = async () => {
    state.loading = true;
    try {
        const res = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>({
        });
        state.projectUserIdList = res.results?.map((d) => d.user_id) ?? [];
        state.totalCount = res.total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};
const deleteProjectUser = async (items) => {
    try {
        await SpaceConnector.clientV2.identity.project.removeUsers<ProjectRemoveUsersParameters>({
            project_id: props.projectId,
            users: items.map((it) => it.user_id),
        });
        showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'));
    }
};

/* Event */
const handleChangeTable = async (options: ToolboxOptions = {}) => {
    state.selectIndex = [];
    if (options.searchText !== undefined) {
        state.searchText = options.searchText;
        const filters = [{ v: options.searchText }];
        emit('update-filters', filters);
    }
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};
const handleClickRemoveMember = () => {
    state.memberDeleteModalVisible = true;
};
const handleClickInviteMember = () => {
    state.memberInviteFormVisible = true;
};

const handleConfirmDeleteMember = async (items) => {
    await deleteProjectUser(items);

    state.memberDeleteModalVisible = false;
    fetchUserList();
};
const handleConfirmInvite = () => {
    fetchUserList();
};

/* Watcher */
watch(() => store.state.reference.project.items, (projects) => {
    if (projects) fetchUserList();
}, { immediate: true });
</script>

<template>
    <div class="project-member-tab">
        <p-toolbox-table :excel-visible="false"
                         :selectable="projectDetailPageGetters.projectType === 'PRIVATE'"
                         sortable
                         :fields="state.fields"
                         :items="state.refinedItems"
                         :select-index.sync="state.selectIndex"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :search-text.sync="state.searchText"
                         @change="handleChangeTable"
                         @refresh="handleChangeTable()"
        >
            <template #toolbox-top>
                <p-heading heading-type="sub"
                           :title="$t('PROJECT.DETAIL.MEMBER_TITLE')"
                           use-total-count
                           :total-count="state.totalCount"
                >
                    <template v-if="projectDetailPageGetters.projectType === 'PRIVATE'"
                              #title-right-extra
                    >
                        <div class="action-button-wrapper">
                            <p-button style-type="primary"
                                      class="mr-4 add-btn"
                                      :disabled="!state.selectedItems.length"
                                      @click="handleClickRemoveMember"
                            >
                                {{ $t('PROJECT.DETAIL.MEMBER.REMOVE') }}
                            </p-button>
                            <p-button style-type="primary"
                                      class="mr-4 add-btn"
                                      @click="handleClickInviteMember"
                            >
                                {{ $t('PROJECT.DETAIL.MEMBER.INVITE') }}
                            </p-button>
                        </div>
                    </template>
                </p-heading>
                <div class="description-wrapper"
                     :class="[projectDetailPageGetters.projectType === 'PRIVATE' ? 'private' : 'public']"
                >
                    <span class="icon">
                        <p-i :name="projectDetailPageGetters.projectType === 'PRIVATE' ? 'ic_lock-filled' : 'ic_globe-filled'"
                             color="inherit"
                             width="1rem"
                             height="1rem"
                        />
                    </span>
                    <span class="text">
                        <i18n :path="projectDetailPageGetters.projectType === 'PRIVATE' ? 'PROJECT.DETAIL.MEMBER.PRIVATE_MEMBER_DESC' : 'PROJECT.DETAIL.MEMBER.PUBLIC_MEMBER_DESC'">
                            <template #settings>
                                <span v-if="projectPageState.isWorkspaceOwner"
                                      class="link-text"
                                      @click="projectPageStore.openProjectFormModal()"
                                >
                                    {{ $t('PROJECT.DETAIL.MEMBER.PROJECT_SETTINGS') }}
                                </span>
                                <span v-else>
                                    {{ $t('PROJECT.DETAIL.MEMBER.PROJECT_SETTINGS') }}
                                </span>
                            </template>
                        </i18n>
                    </span>
                </div>
            </template>
        </p-toolbox-table>

        <project-member-invite-modal
            v-if="state.memberInviteFormVisible"
            :visible.sync="state.memberInviteFormVisible"
            :project-id="projectId"
            @confirm="handleConfirmInvite"
        />
        <p-table-check-modal :visible.sync="state.memberDeleteModalVisible"
                             theme-color="alert"
                             modal-size="md"
                             :fields="state.fields"
                             :items="state.selectedItems"
                             :header-title="$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_TITLE')"
                             :sub-title="$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_CONTENT')"
                             @confirm="handleConfirmDeleteMember"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-member-tab {
    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        @apply border-none;
        .p-heading {
            height: auto;
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }
    }

    .description-wrapper {
        @apply rounded-md text-gray-900;
        display: flex;
        align-content: center;
        padding: 0.75rem 1rem;
        margin: 1rem 1rem 0 1rem;
        &.public {
            @apply bg-indigo-100;
            .icon {
                @apply text-indigo-600;
            }
        }
        &.private {
            @apply bg-gray-100;
            .icon {
                @apply text-gray-900;
            }
        }
        .text {
            @apply text-label-md;
            padding-left: 0.25rem;
            .link-text {
                @apply text-blue-700;
                cursor: pointer;
                &:hover {
                    @apply text-secondary;
                    .text {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
    .action-button-wrapper {
        display: inline-flex;
        float: right;
    }
}
</style>
