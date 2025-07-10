<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextarea, PTextInput,
} from '@cloudforet/mirinae';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceCreateParameters } from '@/api-clients/identity/workspace/schema/api-verbs/create';
import type { WorkspaceUpdateParameters } from '@/api-clients/identity/workspace/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { WORKSPACE_LOGO_ICON_THEMES } from '@/common/modules/navigations/top-bar/constants/constant';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useWorkspaceListQuery } from '@/services/advanced/composables/use-workspace-list-query';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';

interface Props {
    visible: boolean;
    createType: 'CREATE'|'EDIT';
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    createType: 'CREATE',
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', workspaceInfo: { id: string, name: string }): void;
}>();

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const bookmarkStore = useBookmarkStore();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    headerTitle: computed(() => {
        if (props.createType === 'EDIT') return i18n.t('IAM.WORKSPACES.EDIT_WORKSPACE');
        return i18n.t('IAM.WORKSPACES.CREATE_WORKSPACE');
    }),
    name: undefined as undefined|string,
    description: '',
    selectedTheme: 'blue',
    themes: WORKSPACE_LOGO_ICON_THEMES,
});

const validationState = reactive({
    isAllValid: computed(() => {
        if (props.createType === 'EDIT') {
            const isChanged = state.name !== workspacePageState.selectedWorkspace.name
                || state.description !== workspacePageState.selectedWorkspace.tags?.description
                || state.selectedTheme !== workspacePageState.selectedWorkspace.tags?.theme;
            return state.name && !validationState.nameInvalid && !validationState.isDuplicatedName && isChanged;
        }
        return state.name && !validationState.nameInvalid && !validationState.isDuplicatedName;
    }),
    isDuplicatedName: computed(() => {
        if (props.createType === 'EDIT') {
            return workspaceListData.value.filter((workspace) => workspace.name !== workspacePageState.selectedWorkspace.name).some((workspace) => workspace.name === state.name);
        }
        return workspaceListData.value.some((workspace) => workspace.name === state.name);
    }),
    nameInvalidText: computed(() => {
        if (props.createType === 'EDIT') {
            if (state.name === workspacePageState.selectedWorkspace.name) return undefined;
        }
        if (!state.name?.trim()) return i18n.t('IAM.WORKSPACES.FORM.REQUIRED_NAME');
        if (validationState.isDuplicatedName) return i18n.t('IAM.WORKSPACES.FORM.DUPLICATED_NAME');
        if (state.name?.trim().length >= 80) return i18n.t('IAM.WORKSPACES.CREATE_WORKSPACE_TEXT_LENGTH');
        return undefined;
    }),
    nameInvalid: computed(() => state.name !== undefined && !!validationState.nameInvalidText),
});

const queryClient = useQueryClient();
const { workspaceAPI } = useWorkspaceApi();
const { key: workspaceListBaseQueryKey } = useServiceQueryKey('identity', 'workspace', 'list');
const { workspaceListData } = useWorkspaceListQuery();
const { mutate: createWorkspaceMutation } = useMutation({
    mutationFn: (params: WorkspaceCreateParameters) => workspaceAPI.create(params),
    onSuccess: async (data) => {
        showSuccessMessage(i18n.t('IAM.WORKSPACES.ALT_S_CREATE_WORKSPACE'), '');
        await userWorkspaceStore.load();
        await bookmarkStore.createDefaultBookmark({
            workspaceId: data?.workspace_id,
        });
        queryClient.invalidateQueries({ queryKey: workspaceListBaseQueryKey });
        emit('confirm', {
            id: data.workspace_id,
            name: data.name,
        });
    },
    onError: (e) => {
        ErrorHandler.handleError(e, true);
    },
    onSettled: () => {
        state.proxyVisible = false;
    },
});
const { mutate: updateWorkspaceMutation } = useMutation({
    mutationFn: (params: WorkspaceUpdateParameters) => workspaceAPI.update(params),
    onSuccess: async () => {
        showSuccessMessage(i18n.t('IAM.WORKSPACES.ALT_S_UPDATE_WORKSPACE'), '');
        await userWorkspaceStore.load();
        queryClient.invalidateQueries({ queryKey: workspaceListBaseQueryKey });
    },
    onError: (e) => {
        ErrorHandler.handleError(e, true);
    },
    onSettled: () => {
        state.proxyVisible = false;
    },
});

const handleClickTheme = (theme: string) => {
    state.selectedTheme = theme;
};

const handleConfirm = async () => {
    if (props.createType === 'EDIT') {
        await updateWorkspaceMutation({
            workspace_id: workspacePageState.selectedWorkspace.workspace_id,
            name: state.name ?? '',
            tags: {
                ...workspacePageState.selectedWorkspace.tags,
                description: state.description ?? '',
                theme: state.selectedTheme ?? 'blue',
            },
        });
    } else {
        await createWorkspaceMutation({
            name: state.name ?? '',
            tags: {
                description: state.description ?? '',
                theme: state.selectedTheme ?? 'blue',
            },
        });
    }
};

watch(() => props.visible, (visible) => {
    if (!visible) return;
    if (props.createType === 'CREATE') {
        state.name = undefined;
        state.description = '';
        state.selectedTheme = 'blue';
    } else {
        state.name = workspacePageState.selectedWorkspace.name;
        state.description = workspacePageState.selectedWorkspace.tags?.description ?? '';
        state.selectedTheme = workspacePageState.selectedWorkspace.tags?.theme ?? 'blue';
    }
}, { immediate: true });


</script>

<template>
    <p-button-modal class="workspaces-create-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="state.headerTitle"
                    size="sm"
                    :disabled="!validationState.isAllValid"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group :label="$t('IAM.WORKSPACES.FORM.LABEL_NAME')"
                           required
                           :invalid="validationState.nameInvalid"
                           :invalid-text="validationState.nameInvalidText"
            >
                <p-text-input v-model="state.name"
                              block
                              :placeholder="$t('IAM.WORKSPACES.FORM.PLACEHOLDER_NAME')"
                              :invalid="validationState.nameInvalid"
                />
            </p-field-group>
            <p-field-group :label="$t('IAM.WORKSPACES.FORM.LABEL_DESC')">
                <p-textarea v-model="state.description"
                            :placeholder="$t('IAM.WORKSPACES.FORM.PLACEHOLDER_DESC')"
                />
            </p-field-group>
            <p-field-group :label="$t('IAM.WORKSPACES.FORM.LABEL_THEME')"
                           required
            >
                <div class="theme-wrapper">
                    <button v-for="(theme, idx) in state.themes"
                            :key="`${theme}-${idx}`"
                            :class="{'logo-button': true, 'selected': state.selectedTheme === theme}"
                            @click="handleClickTheme(theme)"
                    >
                        <div v-show="state.selectedTheme === theme"
                             class="background-area"
                        />
                        <workspace-logo-icon :theme="theme"
                                             :text="state.name ? state.name : 'A'"
                                             size="md"
                        />
                    </button>
                </div>
            </p-field-group>
        </template>
        <template #confirm-button>
            <span v-if="props.createType === 'CREATE'">{{ $t('IAM.WORKSPACES.CREATE') }}</span>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspaces-create-modal {
    .theme-wrapper {
        @apply flex;
        padding-left: 0.125rem;
        gap: 0.125rem;
        .logo-button {
            @apply relative flex items-center justify-center cursor-pointer;
            width: 3.375rem;
            height: 3.375rem;
            border-radius: 0.5rem;
            &.selected {
                @apply border-2 border-blue-600;
            }

            .background-area {
                @apply absolute border-2 border-blue-200;
                width: 3.625rem;
                height: 3.625rem;
                top: -0.25rem;
                left: -0.25rem;
                border-radius: 0.625rem;
            }
        }
    }
}
</style>
