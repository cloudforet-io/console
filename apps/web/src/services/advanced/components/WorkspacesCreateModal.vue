<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextarea, PTextInput,
} from '@cloudforet/mirinae';

import type { WorkspaceCreateParameters } from '@/api-clients/identity/workspace/schema/api-verbs/create';
import type { WorkspaceUpdateParameters } from '@/api-clients/identity/workspace/schema/api-verbs/update';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { WORKSPACE_LOGO_ICON_THEMES } from '@/common/modules/navigations/top-bar/constants/constant';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

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
    (e: 'refresh'): void;
}>();

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;
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

const handleClickTheme = (theme: string) => {
    state.selectedTheme = theme;
};

const validationState = reactive({
    isAllValid: computed(() => {
        if (props.createType === 'EDIT') {
            const isChanged = state.name !== workspacePageStore.selectedWorkspaces[0].name
                || state.description !== workspacePageStore.selectedWorkspaces[0].tags?.description
                || state.selectedTheme !== workspacePageStore.selectedWorkspaces[0].tags?.theme;
            return state.name && !validationState.nameInvalid && !validationState.isDuplicatedName && isChanged;
        }
        return state.name && !validationState.nameInvalid && !validationState.isDuplicatedName;
    }),
    isDuplicatedName: computed(() => {
        if (props.createType === 'EDIT') {
            return workspacePageState.workspaces.filter((workspace) => workspace.name !== workspacePageStore.selectedWorkspaces[0].name).some((workspace) => workspace.name === state.name);
        }
        return workspacePageState.workspaces.some((workspace) => workspace.name === state.name);
    }),
    nameInvalidText: computed(() => {
        if (props.createType === 'EDIT') {
            if (state.name === workspacePageStore.selectedWorkspaces[0].name) return undefined;
        }
        if (!state.name?.trim()) return i18n.t('IAM.WORKSPACES.FORM.REQUIRED_NAME');
        if (validationState.isDuplicatedName) return i18n.t('IAM.WORKSPACES.FORM.DUPLICATED_NAME');
        if (state.name?.trim().length >= 80) return i18n.t('IAM.WORKSPACES.CREATE_WORKSPACE_TEXT_LENGTH');
        return undefined;
    }),
    nameInvalid: computed(() => state.name !== undefined && !!validationState.nameInvalidText),
});

const handleConfirm = async () => {
    try {
        if (props.createType === 'EDIT') {
            await SpaceConnector.clientV2.identity.workspace.update<WorkspaceUpdateParameters>({
                workspace_id: workspacePageStore.selectedWorkspaces[0].workspace_id,
                name: state.name ?? '',
                tags: {
                    ...workspacePageStore.selectedWorkspaces[0].tags,
                    description: state.description ?? '',
                    theme: state.selectedTheme ?? 'blue',
                },
            });
            showSuccessMessage(i18n.t('Workspace successfully updated'), '');
        } else {
            const response = await SpaceConnector.clientV2.identity.workspace.create<WorkspaceCreateParameters, WorkspaceModel>({
                name: state.name ?? '',
                tags: {
                    description: state.description ?? '',
                    theme: state.selectedTheme ?? 'blue',
                },
            });
            showSuccessMessage(i18n.t('Workspace successfully created'), '');
            await bookmarkStore.createDefaultBookmark({
                workspaceId: response.workspace_id,
            });
            emit('confirm', {
                id: response.workspace_id,
                name: response.name,
            });
        }
        await userWorkspaceStore.load();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        emit('refresh');
        state.proxyVisible = false;
    }
};

watch(() => props.visible, (visible) => {
    if (!visible) return;
    if (props.createType === 'CREATE') {
        state.name = undefined;
        state.description = '';
        state.selectedTheme = 'blue';
    } else {
        state.name = workspacePageStore.selectedWorkspaces[0].name;
        state.description = workspacePageStore.selectedWorkspaces[0].tags?.description ?? '';
        state.selectedTheme = workspacePageStore.selectedWorkspaces[0].tags?.theme ?? 'blue';
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
