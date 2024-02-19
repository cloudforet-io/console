<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PDoubleCheckModal } from '@spaceone/design-system';



import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceDeleteParameters } from '@/schema/identity/workspace/api-verbs/delete';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useWorkspacePageStore } from '@/services/preference/store/workspace-page-store';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'refresh'): void;
}>();

const workspacePageStore = useWorkspacePageStore();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    headerTitle: computed(() => `${i18n.t('IAM.WORKSPACES.DELETE_WORKSPACE')} ${state.selectedWorkspaceName}`),
    selectedWorkspaceName: computed(() => workspacePageStore.selectedWorkspaces[0]?.name || ''),
});

const handleConfirm = async () => {
    try {
        await SpaceConnector.clientV2.identity.workspace.delete<WorkspaceDeleteParameters>({
            workspace_id: workspacePageStore.selectedWorkspaces[0]?.workspace_id ?? '',
        });
        state.proxyVisible = false;
        emit('refresh');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

</script>

<template>
    <p-double-check-modal class="workspaces-delete-modal"
                          :visible.sync="state.proxyVisible"
                          :header-title="state.headerTitle"
                          :verification-text="state.selectedWorkspaceName"
                          modal-size="sm"
                          @confirm="handleConfirm"
    >
        <template #middle-contents>
            <p class="desciption">
                {{ $t('IAM.WORKSPACES.DELETE_WORKSPACE_DESC') }}
            </p>
        </template>
    </p-double-check-modal>
</template>

<style lang="postcss" scoped>
.workspaces-delete-modal {
    .desciption {
        @apply text-paragraph-lg;
        padding-bottom: 1.5rem;
    }
}
</style>
