<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PStatus, PButtonModal, PDataTable, PI, PLink, PBadge,
} from '@cloudforet/mirinae';

import { useUserStore } from '@/store/user/user-store';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { useUserPageStore } from '@/services/iam/store/user-page-store';



const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;
const userStore = useUserStore();

const state = reactive({
    loading: false,
    isDomainAdmin: computed(() => userStore.getters.isDomainAdmin),
    refinedTableData: computed(() => userPageGetters.selectedUsers.map((user) => ({
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


</script>

<template>
    <p-button-modal :visible="userPageState.modal.visible === 'removeOnlyWorkspaceGroup'"
                    :header-title="userPageState.modal.title"
                    :theme-color="userPageState.modal.themeColor"
                    :loading="state.loading"
                    hide-footer-confirm-button
                    size="md"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div>
                <div class="mb-6">
                    <b>{{ $t('IAM.USER.MAIN.MODAL.REMOVE_USER_MODAL_BOLD_DESC') }}</b>
                    {{ $t('IAM.USER.MAIN.MODAL.REMOVE_ONLY_WORKSPACE_GROUP_TYPE_DESC') }}
                    <div v-if="state.isDomainAdmin"
                         class="mt-4"
                    >
                        <p-link :text="$t('IAM.USER.MAIN.MODAL.GO_TO_WORKSPACE_GROUP')"
                                action-icon="internal-link"
                                new-tab
                                highlight
                                :to="{ name: ADMIN_ADVANCED_ROUTE.WORKSPACE_GROUP._NAME}"
                        /><p-i name="external-link" />
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
        <template #close-button>
            {{ $t('APP.MAIN.CLOSE') }}
        </template>
    </p-button-modal>
</template>
