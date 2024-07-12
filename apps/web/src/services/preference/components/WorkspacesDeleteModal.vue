<script setup lang="ts">

import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDoubleCheckModal, PButtonModal, PLink } from '@cloudforet/mirinae';




import type { WorkspaceDeleteParameters } from '@/schema/identity/workspace/api-verbs/delete';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
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
const allReferenceStore = useAllReferenceStore();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    headerTitle: computed(() => `${_i18n.t('IAM.WORKSPACES.DELETE_WORKSPACE')} ${state.selectedWorkspaceName}`),
    selectedWorkspaceName: computed(() => workspacePageStore.selectedWorkspaces[0]?.name || ''),
    trustedAccounts: computed(() => allReferenceStore.getters.trustedAccount),
    relatedTrustedAccount: computed(() => state.trustedAccounts[workspacePageStore.selectedWorkspaces[0]?.trusted_account_id]?.data ?? {}),
    isSyncedAccount: computed(() => workspacePageStore.selectedWorkspaces[0]?.is_managed && state.relatedTrustedAccount?.schedule?.state === 'ENABLED'),
});

const handleConfirm = async () => {
    try {
        await SpaceConnector.clientV2.identity.workspace.delete<WorkspaceDeleteParameters>({
            workspace_id: workspacePageStore.selectedWorkspaces[0]?.workspace_id ?? '',
        });
        state.proxyVisible = false;
        emit('refresh');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

</script>

<template>
    <div>
        <p-double-check-modal v-if="state.proxyVisible && !state.isSyncedAccount"
                              class="workspaces-delete-modal"
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
        <p-button-modal v-else-if="state.proxyVisible && state.isSyncedAccount"
                        :visible.sync="state.proxyVisible"
                        :header-title="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        size="sm"
                        :hide-footer-close-button="true"
                        @confirm="() => state.proxyVisible = false"
        >
            <template #body>
                <i18n path="IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DELETE_CHECK_MODAL.DESC"
                      tag="p"
                >
                    <template #serviceAccountName>
                        <p-link new-tab
                                highlight
                                action-icon="external-link"
                                :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME, params: { serviceAccountId: state.relatedTrustedAccount.trusted_account_id }}"
                        >
                            {{ state.relatedTrustedAccount.name }}
                        </p-link>
                    </template>
                </i18n>
            </template>
            <template #confirm-button>
                {{ $t('APP.MAIN.OK') }}
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.workspaces-delete-modal {
    .desciption {
        @apply text-paragraph-lg;
        padding-bottom: 1.5rem;
    }
}
</style>
