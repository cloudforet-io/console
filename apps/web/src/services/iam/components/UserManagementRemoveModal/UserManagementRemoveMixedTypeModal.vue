<script lang="ts" setup>
import {
    computed,
    reactive,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PStatus, PButtonModal, PDataTable, PButton, PBadge,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { useUserListQuery } from '@/services/iam/composables/use-user-list-query';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';


const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);
const { workspaceUserListData: selectedWorkspaceUsers } = useUserListQuery(selectedUserIds);

const state = reactive({
    loading: false,
    refinedTableData: computed(() => selectedWorkspaceUsers.value?.map((user) => ({
        ...user,
        type: user?.role_binding_info?.workspace_group_id ? 'Workspace Group' : 'Workspace',
    }))),
});

const tableFields = [
    { name: 'removable', label: ' ' },
    { name: 'user_id', label: 'User ID' },
    { name: 'name', label: 'Name' },
    { name: 'type', label: 'Type' },
    { name: 'state', label: 'State' },
];

const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
    });
};

const handleSwitchModal = () => {
    userPageStore.updateModalSettings({
        type: USER_MODAL_TYPE.REMOVE,
        title: i18n.t('IAM.USER.MAIN.MODAL.REMOVE_USER_TITLE'),
        themeColor: 'alert',
        modalVisibleType: 'removeOnlyWorkspace',
    });
};


</script>

<template>
    <p-button-modal :visible="userPageState.modal.visible === 'removeMixed'"
                    :header-title="userPageState.modal.title"
                    :theme-color="userPageState.modal.themeColor"
                    :loading="state.loading"
                    disabled
                    size="md"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div>
                <div class="mb-6">
                    <b>{{ $t('IAM.USER.MAIN.MODAL.REMOVE_USER_MODAL_BOLD_DESC') }}</b>
                    {{ $t('IAM.USER.MAIN.MODAL.REMOVE_MIXED_TYPE_DESC') }}
                    <div class="mt-4">
                        <p-button style-type="negative-secondary"
                                  @click="handleSwitchModal"
                        >
                            {{ $t('IAM.USER.MAIN.MODAL.KEEP_ONLY_REMOVABLE_URERS') }}
                        </p-button>
                    </div>
                </div>

                <p-data-table
                    :fields="tableFields"
                    :items="state.refinedTableData"
                >
                    <template #col-removable-format="{item}">
                        <p-badge type="alert"
                                 :style-type="item.type === 'Workspace Group' ? 'red100' : 'green200'"
                                 badge-type="subtle"
                        >
                            {{ item.type === 'Workspace Group' ? 'Non-Removable' : 'Removable' }}
                        </p-badge>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)"
                                  class="capitalize"
                        />
                    </template>
                </p-data-table>
            </div>
        </template>
    </p-button-modal>
</template>
