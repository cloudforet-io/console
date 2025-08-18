<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import type { MembersType } from '@/api-clients/identity/user-group/schema/type';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';


import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';



const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const selectedUserGroup = computed<UserGroupModel>(() => userGroupPageGetters.selectedUserGroups[0] as UserGroupModel);

const state = reactive({
    loading: false,
    selectedUserIds: undefined,
    excludedSelectedIds: computed<string[]>(() => selectedUserGroup.value?.users ?? []),
    formattedMemberItems: {} as Record<MembersType, string[]>,
    userPool: computed<string[]>(() => userListData.value?.map((user) => user.user_id) ?? []),
});

const { workspaceUserAPI } = useWorkspaceUserApi();
const { userGroupAPI } = useUserGroupApi();

const queryClient = useQueryClient();

const { key: userListQueryKey, params: userListQueryParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
    params: computed(() => ({
        query: {
            filter: [{ k: 'user_id', v: selectedUserGroup.value?.users ?? [], o: 'contain_in' }],
        },
    })),
});

const { key: userGroupListQueryKey } = useServiceQueryKey('identity', 'user-group', 'list');

const { data: userListData } = useScopedQuery({
    queryKey: userListQueryKey,
    queryFn: () => workspaceUserAPI.list(userListQueryParams.value),
    select: (data) => data?.results || [],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 2,
    enabled: computed(() => !!(selectedUserGroup.value?.users && selectedUserGroup.value?.users.length > 0)),
}, ['WORKSPACE']);

const { mutateAsync: addUsers, isPending: addUsersIsPending } = useMutation({
    mutationFn: userGroupAPI.addUsers,
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: userGroupListQueryKey.value });
        emit('confirm');
        showSuccessMessage(i18n.t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.SUCCESS_MESSAGE'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
    onSettled: () => {
        handleClose();
        userGroupPageStore.setSelectedUserIdx([]);
    },
});

/* Component */
const handleConfirm = async () => {
    await addUsers({
        user_group_id: selectedUserGroup.value?.user_group_id ?? '',
        users: state.formattedMemberItems.USER,
    });
};

const handleClose = () => {
    userGroupPageStore.updateModalSettings({
        type: '',
        title: '',
        themeColor: '',
    });
};

const handleFormattedSelectedIds = (value: Record<MembersType, string[]>) => {
    state.formattedMemberItems = value;
};
</script>

<template>
    <p-button-modal class="user-group-management-add-users-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.ADD_NEW_USER"
                    size="md"
                    :loading="addUsersIsPending"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <p>{{ $t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.USER') }}</p>
                <user-select-dropdown show-user-list
                                      :show-user-group-list="false"
                                      :show-category-title="false"
                                      appearance-type="stack"
                                      selection-type="multiple"
                                      use-fixed-menu-style
                                      excluded-hidden-ids
                                      :excluded-selected-ids="state.excludedSelectedIds"
                                      @formatted-selected-ids="handleFormattedSelectedIds"
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.user-group-management-add-users-modal {
    .modal-contents {
        @apply flex flex-col;
        height: 22rem;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
        overflow: auto;
    }
}
:deep(.dropdown-context-menu) {
    left: unset !important;
}
</style>
