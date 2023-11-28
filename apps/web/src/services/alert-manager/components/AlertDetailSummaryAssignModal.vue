<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PButtonModal, PToolboxTable } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGetRequestParams } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertPageStore } from '@/services/alert-manager/stores/alert-page-store';


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

const alertPageStore = useAlertPageStore();

const storeState = reactive({
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    //
    loading: true,
    selectIndex: [] as number[],
    selectedUserID: computed(() => state.refinedItems[state.selectIndex]?.resource_id),
    fields: [
        { label: 'User ID', name: 'user_id', type: 'item' },
        { label: 'Name', name: 'user_name', type: 'item' },
    ],
    projectUserIdList: [] as string[],
    refinedItems: computed<UserItem[]>(() => {
        const users: UserItem[] = state.projectUserIdList.map((d) => ({
            user_id: d,
            user_name: storeState.users[d]?.name ?? d,
        }));
        return users.filter((d) => {
            const searchText = state.searchText.toLowerCase();
            return d.user_id.toLowerCase().includes(searchText)
                        || d.user_name.toLowerCase().includes(searchText);
        });
    }),
    totalCount: 0,
    searchText: '',
    pageLimit: 15,
    pageStart: 1,
});

const reassignMember = async () => {
    try {
        await alertPageStore.updateAlertData({
            updateParams: {
                assignee: state.selectedUserID,
            },
            alertId: props.alertId,
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

const getProjectUserData = async () => {
    try {
        state.loading = true;
        const params: ProjectGetRequestParams = {
            workspace_id: '', // TODO: workspace_id
            project_id: props.projectId,
        };
        const res: ProjectModel = await SpaceConnector.clientV2.identity.project.get(params);
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
        store.dispatch('reference/user/load'),
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
                             :items="state.refinedItems.slice(state.pageStart - 1, state.pageStart + state.pageLimit - 1)"
                             :select-index.sync="state.selectIndex"
                             :loading="state.loading"
                             :total-count="state.totalCount"
                             @change="handleChangeTable"
                             @refresh="handleChangeTable()"
            />
        </template>
    </p-button-modal>
</template>
