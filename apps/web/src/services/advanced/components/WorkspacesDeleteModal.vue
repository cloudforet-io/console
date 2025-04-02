<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDoubleCheckModal, PButtonModal, PLink, PStatus,
} from '@cloudforet/mirinae';

import type { WorkspaceDeleteParameters } from '@/api-clients/identity/workspace/schema/api-verbs/delete';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

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

const storeState = reactive({
    selectedWorkspace: computed<WorkspaceModel>(() => workspacePageStore.selectedWorkspaces[0]),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    headerTitle: computed(() => `${_i18n.t('IAM.WORKSPACES.DELETE_WORKSPACE')}`),
    selectedWorkspaceName: computed(() => storeState.selectedWorkspace?.name || ''),
    trustedAccounts: computed(() => allReferenceStore.getters.trustedAccount),
    relatedTrustedAccount: computed(() => state.trustedAccounts[storeState.selectedWorkspace?.trusted_account_id]?.data ?? {}),
    isSyncedAccount: computed(() => storeState.selectedWorkspace?.is_managed && state.relatedTrustedAccount?.schedule?.state === 'ENABLED'),
});

const handleConfirm = async () => {
    try {
        await SpaceConnector.clientV2.identity.workspace.delete<WorkspaceDeleteParameters>({
            workspace_id: storeState.selectedWorkspace?.workspace_id ?? '',
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
                <div>
                    <p class="description">
                        {{ $t('IAM.WORKSPACES.DELETE_WORKSPACE_DESC') }}
                    </p>
                    <div class="content">
                        <workspace-logo-icon :text="storeState.selectedWorkspace?.name || ''"
                                             :theme="storeState.selectedWorkspace?.tags?.theme"
                                             size="sm"
                        />
                        <div class="content-info">
                            <p class="title-wrapper">
                                <span class="title">{{ storeState.selectedWorkspace?.name || '' }}</span>
                                <p-status v-bind="workspaceStateFormatter(storeState.selectedWorkspace?.is_dormant ? WORKSPACE_STATE.DORMANT : storeState.selectedWorkspace?.state)"
                                          class="capitalize status"
                                          :class="{[storeState.selectedWorkspace?.is_dormant ? 'dormant' : storeState.selectedWorkspace?.state.toLowerCase()]: true}"
                                />
                            </p>
                            <p v-if="storeState.selectedWorkspace?.tags?.description"
                               class="desc"
                            >
                                {{ storeState.selectedWorkspace?.tags?.description }}
                            </p>
                        </div>
                    </div>
                </div>
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
                <div>
                    <div class="content">
                        <workspace-logo-icon :text="storeState.selectedWorkspace?.name || ''"
                                             :theme="storeState.selectedWorkspace?.tags?.theme"
                                             size="sm"
                        />
                        <div class="content-info">
                            <p class="title-wrapper">
                                <span class="title">{{ storeState.selectedWorkspace?.name || '' }}</span>
                                <p-status v-bind="workspaceStateFormatter(storeState.selectedWorkspace?.is_dormant ? WORKSPACE_STATE.DORMANT : storeState.selectedWorkspace?.state)"
                                          class="capitalize status"
                                          :class="{[storeState.selectedWorkspace?.is_dormant ? 'dormant' : storeState.selectedWorkspace?.state.toLowerCase()]: true}"
                                />
                            </p>
                            <p v-if="storeState.selectedWorkspace?.tags?.description"
                               class="desc"
                            >
                                {{ storeState.selectedWorkspace?.tags?.description }}
                            </p>
                        </div>
                    </div>
                    <i18n path="IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.DELETE_CHECK_MODAL.DESC"
                          tag="p"
                    >
                        <template #serviceAccountName>
                            <p-link new-tab
                                    highlight
                                    action-icon="external-link"
                                    :to="{ name: SERVICE_ACCOUNT_ROUTE.DETAIL._NAME, params: { serviceAccountId: state.relatedTrustedAccount.trusted_account_id }}"
                            >
                                {{ state.relatedTrustedAccount.name }}
                            </p-link>
                        </template>
                    </i18n>
                </div>
            </template>
            <template #confirm-button>
                {{ $t('APP.MAIN.OK') }}
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.workspaces-delete-modal {
    .description {
        @apply text-paragraph-lg;
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
    .content {
        @apply flex items-center bg-gray-100;
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 0.375rem;
        gap: 0.75rem;
        .content-info {
            @apply flex flex-col;
            gap: 0.125rem;
            .title-wrapper {
                @apply flex items-center;
                gap: 0.5rem;
                .title {
                    @apply font-bold;
                }
                .status {
                    @apply flex items-center border text-label-md;
                    padding-right: 0.5rem;
                    padding-left: 0.5rem;
                    border-radius: 6.25rem;
                    &.enabled {
                        @apply border-green-400;
                    }
                    &.disabled {
                        @apply border-gray-300;
                    }
                    &.dormant {
                        @apply border-coral-300;
                    }
                }
            }
            .desc {
                @apply text-label-md text-gray-600;
            }
        }
    }
}
</style>
