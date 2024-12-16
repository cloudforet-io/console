<script lang="ts" setup>
import {
    computed, reactive, ref, watch, watchEffect,
} from 'vue';

import { cloneDeep } from 'lodash';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserGroupListParameters } from '@/schema/identity/user-group/api-verbs/list';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useUserPageStore } from '@/services/iam/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

interface UserAssignUserGroupState {
  loading: boolean;
  allUserGroupList: MenuItem[] | any;
  selectedUserGroupList: MenuItem[];
}

const allUserGroupNameList = ref<string[]>();

const state = reactive<UserAssignUserGroupState>({
    loading: false,
    allUserGroupList: computed(() => {
        const data = fetchUserGroupList({});
        console.log(data);
        return data;
    }),
    selectedUserGroupList: [],
});

/* Watcher */
watch(() => state.allUserGroupList, () => {
    // allUserGroupNameList.value = state.allUserGroupList.map((userGroup) => userGroup.name)
}, { deep: true, immediate: true });

watchEffect(() => {
    console.log(state.allUserGroupList);
});

/* Component */
const handleConfirm = () => {
    try {
        state.loading = true;
        console.log('TODO: Add users to user group API');
    } finally {
        state.loading = false;
        handleClose();
    }
};

const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
    });
};

/* API */
const fetchUserGroupList = async (params: UserGroupListParameters) => {
    try {
        const res = await SpaceConnector.clientV2.identity.userGroup.list<UserGroupListParameters, ListResponse<UserGroupModel>>(params);
        return res.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return [];
    }
};
</script>

<template>
    <p-button-modal class="user-assign-group-modal"
                    :header-title="userPageState.modal.title"
                    :visible="userPageState.modal.visible === 'assignToUserGroup'"
                    size="md"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <p class="mb-2">
                    {{ userPageState.modal.title }}
                </p>
                <p-select-dropdown :menu="allUserGroupNameList"
                                   :selected.sync="state.selectedUserGroupList"
                                   multi-selectable
                                   show-select-marker
                                   is-filterable
                                   appearance-type="stack"
                                   block
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.user-assign-group-modal {
    min-height: 34.875rem;
}
</style>
