<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PButtonModal, PToolboxTable } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertAssignUserStore } from '@/services/alert-manager/v1/stores/alert-assign-user-store';
import { useAlertPageStore } from '@/services/alert-manager/v1/stores/alert-page-store';


interface UserItem {
    user_id: string;
    user_name: string;
}

interface Props {
    visible?: boolean;
    projectId?: string;
    alertId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectId: '',
    alertId: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();

const allReferenceStore = useAllReferenceStore();
const alertPageStore = useAlertPageStore();
const alertAssignUserStore = useAlertAssignUserStore();
const alertAssignUserState = alertAssignUserStore.state;

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    //
    selectIndex: [] as number[],
    selectedUserID: computed(() => state.refinedItems[state.selectIndex]?.user_id),
    fields: [
        { label: 'User ID', name: 'user_id', type: 'item' },
        { label: 'Name', name: 'user_name', type: 'item' },
    ],
    refinedItems: computed<UserItem[]>(() => {
        const users: UserItem[] = alertAssignUserState.userIds.map((d) => ({
            user_id: d,
            user_name: allReferenceStore.getters.user[d]?.label ?? d,
        }));
        const filteredUsers = users.filter((d) => {
            const searchText = state.searchText.toLowerCase();
            return d.user_id.toLowerCase().includes(searchText)
                || d.user_name.toLowerCase().includes(searchText);
        });
        return filteredUsers.slice(state.pageStart - 1, state.pageStart + state.pageLimit - 1);
    }),
    searchText: '',
    pageLimit: 15,
    pageStart: 1,
});

const reassignMember = async () => {
    try {
        const alertData = await alertAssignUserStore.assignUserToAlert(props.alertId, state.selectedUserID);
        await alertPageStore.setAlertData(alertData);
        showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_ASSIGN_MEMBER'), '');
    } catch (e) {
        showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_ASSIGN_MEMBER'), e);
    } finally {
        state.proxyVisible = false;
    }
};

const handleClickReassign = async () => {
    await reassignMember();
};

const handleChangeTable = async (options: any = {}) => {
    if (options.searchText !== undefined) state.searchText = options.searchText;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

(async () => {
    await alertAssignUserStore.getUserList();
})();
</script>

<template>
    <p-button-modal
        class="alert-assign-modal"
        :header-title="$t('MONITORING.ALERT.DETAIL.ASSIGN_MODAL_TITLE')"
        size="md"
        :disabled="!state.selectedUserID"
        :visible.sync="state.proxyVisible"
        @confirm="handleClickReassign"
    >
        <template #body>
            <p-toolbox-table :excel-visible="false"
                             selectable
                             :multi-select="false"
                             :fields="state.fields"
                             :items="state.refinedItems"
                             :select-index.sync="state.selectIndex"
                             :loading="alertAssignUserState.loading"
                             :total-count="alertAssignUserState.totalUserCount"
                             @change="handleChangeTable"
                             @refresh="handleChangeTable()"
            />
        </template>
    </p-button-modal>
</template>
