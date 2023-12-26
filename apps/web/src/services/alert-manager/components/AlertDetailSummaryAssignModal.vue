<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PButtonModal, PToolboxTable } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import type { AlertAssignUserParameters } from '@/schema/monitoring/alert/api-verbs/assign-user';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


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

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    //
    loading: true,
    selectIndex: [] as number[],
    selectedUserID: computed(() => state.refinedItems[state.selectIndex]?.user_id),
    fields: [
        { label: 'User ID', name: 'user_id', type: 'item' },
        { label: 'Name', name: 'user_name', type: 'item' },
    ],
    projectUserIdList: [] as string[],
    refinedItems: computed<UserItem[]>(() => {
        const users: UserItem[] = state.projectUserIdList.map((d) => ({
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
    totalCount: 0,
    searchText: '',
    pageLimit: 15,
    pageStart: 1,
});

const reassignMember = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.alert.assignUser<AlertAssignUserParameters>({
            alert_id: props.alertId,
            assignee: state.selectedUserID,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_ASSIGN_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_ASSIGN_MEMBER'));
    } finally {
        state.proxyVisible = false;
    }
};

const handleClickReassign = async () => {
    await reassignMember();
};

const fetchWorkspaceUserList = async () => {
    try {
        const res = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>();
        state.projectUserIdList = res.results?.map((d) => d.user_id) ?? [];
        state.totalCount = res.total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
    }
};
const getProjectUserData = async () => {
    try {
        state.loading = true;
        const res = await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
            project_id: props.projectId,
        });
        if (res.project_type === 'PUBLIC') {
            await fetchWorkspaceUserList();
            return;
        }
        state.projectUserIdList = res.users ?? [];
        state.totalCount = res.users?.length ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
    } finally {
        state.loading = false;
    }
};

const handleChangeTable = async (options: any = {}) => {
    // TODO: check it's working
    if (options.searchText !== undefined) state.searchText = options.searchText;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        getProjectUserData(),
    ]);
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
                             :loading="state.loading"
                             :total-count="state.totalCount"
                             @change="handleChangeTable"
                             @refresh="handleChangeTable()"
            />
        </template>
    </p-button-modal>
</template>
