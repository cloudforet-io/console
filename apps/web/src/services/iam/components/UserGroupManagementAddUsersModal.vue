<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupAddUsersParameters } from '@/api-clients/identity/user-group/schema/api-verbs/add-users';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import type { MembersType } from '@/api-clients/identity/user-group/schema/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    userReferenceMap: computed<UserReferenceMap>(() => allReferenceGetters.user),
});

const state = reactive({
    loading: false,
    selectedUserIds: undefined,
    excludedSelectedIds: [],
    formattedMemberItems: {} as Record<MembersType, string[]>,
    userPool: [] as string[],
});

/* Watcher */
watch(() => storeState.userReferenceMap, (userReferenceStore) => {
    state.userPool = Object.keys(userReferenceStore);
}, { deep: true, immediate: true });

watch(() => userGroupPageGetters.selectedUserGroups, (nv_selected_user_group) => {
    if (nv_selected_user_group.length === 1 && nv_selected_user_group[0].users) {
        state.excludedSelectedIds = nv_selected_user_group[0].users;
    } else if (nv_selected_user_group.length === 1 && !Object.keys(nv_selected_user_group[0]).includes('users')) {
        state.excludedSelectedIds = [];
    }
}, { deep: true, immediate: true });

/* Component */
const handleConfirm = async () => {
    state.loading = true;
    try {
        await fetchAddUsers({
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            users: state.formattedMemberItems.USER,
        });
        emit('confirm');
        showSuccessMessage('', i18n.t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.SUCCESS_MESSAGE'));
    } finally {
        state.loading = false;
        handleClose();
        userGroupPageStore.$patch((_state) => {
            _state.state.users.selectedIndices = [];
        });
    }
};

const handleClose = () => {
    userGroupPageState.modal.type = '';
};

const handleFormattedSelectedIds = (value: Record<MembersType, string[]>) => {
    state.formattedMemberItems = value;
};

/* API */
const fetchAddUsers = async (params: UserGroupAddUsersParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.addUsers<UserGroupAddUsersParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
</script>

<template>
    <p-button-modal class="user-group-management-add-users-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.ADD_NEW_USER"
                    size="md"
                    :loading="state.loading"
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
