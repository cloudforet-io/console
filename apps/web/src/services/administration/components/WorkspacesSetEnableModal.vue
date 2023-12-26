<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PButtonModal, PDataTable, PStatus,
} from '@spaceone/design-system';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { iso8601Formatter } from '@cloudforet/utils';

import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { userStateFormatter } from '@/services/administration/composables/refined-table-data';
import { WORKSPACE_STATE, WORKSPACE_TABLE_FIELDS } from '@/services/administration/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';

type WorkspaceStateType = typeof WORKSPACE_STATE[keyof typeof WORKSPACE_STATE];
interface Props {
    visible?: boolean;
    enableModalType?: WorkspaceStateType;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    enableModalType: undefined,
});

const emit = defineEmits<{(e: ':update:visible'): void,
    (e: 'refresh'): void,
}>();

const workspacePageStore = useWorkspacePageStore();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    headerTitle: computed(() => {
        if (props.enableModalType === WORKSPACE_STATE.ENABLE) {
            return i18n.t('IAM.WORKSPACES.ENABLE_WORKSPACE');
        }
        return i18n.t('IAM.WORKSPACES.DISABLE_WORKSPACE');
    }),
});

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        if (props.enableModalType === WORKSPACE_STATE.ENABLE) {
            await SpaceConnector.clientV2.identity.workspace.enable({
                workspace_id: workspacePageStore.selectedWorkspaces[0]?.workspace_id ?? '',
            });
        } else {
            await SpaceConnector.clientV2.identity.workspace.disable({
                workspace_id: workspacePageStore.selectedWorkspaces[0]?.workspace_id ?? '',
            });
        }
        state.proxyVisible = false;
        emit('refresh');
    } catch (error) {
        ErrorHandler.handleError(error);
    } finally {
        state.loading = false;
    }
};

const handleClose = () => {
    state.proxyVisible = false;
};

</script>

<template>
    <p-button-modal class="workspaces-set-enable-modal"
                    :header-title="state.headerTitle"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="state.proxyVisible"
                    :theme-color="enableModalType === WORKSPACE_STATE.ENABLE ? 'primary' : 'alert'"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @close="handleClose"
                    @cancel="handleClose"
    >
        <template #body>
            <p-data-table class="role-data-table"
                          :items="workspacePageStore.selectedWorkspaces"
                          :fields="WORKSPACE_TABLE_FIELDS"
                          :loading="state.loading"
                          :table-custom-style="{ maxHeight: 'calc(100vh - 17.5rem)' }"
            >
                <template #col-state-format="{value}">
                    <p-status v-bind="userStateFormatter(value)"
                              class="capitalize"
                    />
                </template>
                <template #col-created_at-format="{value}">
                    {{ iso8601Formatter(value, storeState.timezone) }}
                </template>
            </p-data-table>
        </template>
        <template #confirm-button>
            {{ enableModalType === WORKSPACE_STATE.ENABLE ? $t('IAM.WORKSPACES.ENABLE') : $t('IAM.WORKSPACES.DISABLE') }}
        </template>
    </p-button-modal>
</template>
