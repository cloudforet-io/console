<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PHeading, PTableCheckModal, PToolboxTable,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectRemoveUsersParameters } from '@/schema/identity/project/api-verbs/remove-users';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectMemberInviteModal from '@/services/project/components/ProjectMemberInviteModal.vue';
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
    manageDisabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: '',
    filters: () => ([]),
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'update-filters', filters: any): void;
}>();

const storeState = reactive({
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
});
const state = reactive({
    searchText: props.filters.map((d) => d.v).join(' ') || '',
    selectIndex: [] as number[],
    fields: [
        { label: 'User ID', name: 'user_id' },
        { label: 'User Name', name: 'user_name' },
    ] as DataTableField[],
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

/* Api */
const getProjectUserData = async () => {
    state.loading = true;
    state.selectIndex = [];
    try {
        const res: ProjectModel = await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
            project_id: props.projectId,
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
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
const deleteProjectUser = async (items) => {
    try {
        await SpaceConnector.clientV2.identity.project.removeUsers<ProjectRemoveUsersParameters>({
            project_id: props.projectId,
            users: items.map((it) => it.user_id),
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'));
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
    await getProjectUserData();
};
const handleConfirmInvite = () => {
    getProjectUserData();
};

/* Init */
(async () => {
    // LOAD REFERENCE STORE
    await Promise.allSettled([
        store.dispatch('reference/user/load'),
        store.dispatch('reference/project/load'),
    ]);
})();

/* Watcher */
watch(() => store.state.reference.project.items, (projects) => {
    if (projects) getProjectUserData();
}, { immediate: true });
</script>

<template>
    <div class="project-member-tab">
        <p-toolbox-table :excel-visible="false"
                         selectable
                         sortable
                         :fields="state.fields"
                         :items="state.refinedItems"
                         :select-index.sync="state.selectIndex"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :search-text="state.searchText"
                         @change="handleChangeTable"
                         @refresh="handleChangeTable()"
        >
            <template #toolbox-top>
                <p-heading heading-type="sub"
                           :title="$t('PROJECT.DETAIL.MEMBER_TITLE')"
                           use-total-count
                           :total-count="state.totalCount"
                >
                    <template #title-right-extra>
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
                                      :disabled="props.manageDisabled"
                                      @click="handleClickInviteMember"
                            >
                                {{ $t('PROJECT.DETAIL.MEMBER.INVITE') }}
                            </p-button>
                        </div>
                    </template>
                </p-heading>
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

    .action-button-wrapper {
        display: inline-flex;
        float: right;
    }
}
</style>
