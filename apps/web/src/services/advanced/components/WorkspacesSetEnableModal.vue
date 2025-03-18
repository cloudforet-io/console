<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PStatus,
} from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';

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
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    headerTitle: computed(() => {
        if (props.enableModalType === WORKSPACE_STATE.ENABLE) {
            return i18n.t('IAM.WORKSPACES.ENABLE_WORKSPACE');
        }
        return i18n.t('IAM.WORKSPACES.DISABLE_WORKSPACE');
    }),
    headerDescription: computed(() => {
        if (props.enableModalType === WORKSPACE_STATE.ENABLE) {
            return i18n.t('IAM.WORKSPACES.ENABLE_WORKSPACE_DESC');
        }
        return i18n.t('IAM.WORKSPACES.DISABLE_WORKSPACE_DESC');
    }),
});

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    selectedWorkspace: computed<WorkspaceModel>(() => workspacePageStore.selectedWorkspaces[0]),
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        if (props.enableModalType === WORKSPACE_STATE.ENABLE) {
            await SpaceConnector.clientV2.identity.workspace.enable({
                workspace_id: storeState.selectedWorkspace?.workspace_id ?? '',
            });
        } else {
            await SpaceConnector.clientV2.identity.workspace.disable({
                workspace_id: storeState.selectedWorkspace?.workspace_id ?? '',
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
                    size="sm"
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
            <div>
                <p class="header-description">
                    {{ state.headerDescription }}
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
        <template #confirm-button>
            {{ enableModalType === WORKSPACE_STATE.ENABLE ? $t('IAM.WORKSPACES.ENABLE') : $t('IAM.WORKSPACES.DISABLE') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspaces-set-enable-modal {
    .header-description {
        @apply text-paragraph-lg;
        padding-bottom: 1rem;
    }
    .content {
        @apply flex items-center bg-gray-100;
        padding: 0.75rem;
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
