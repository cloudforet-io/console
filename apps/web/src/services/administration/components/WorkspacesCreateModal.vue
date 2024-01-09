<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextarea, PTextInput,
} from '@spaceone/design-system';



import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceCreateParameters } from '@/schema/identity/workspace/api-verbs/create';
import type { WorkspaceUpdateParameters } from '@/schema/identity/workspace/api-verbs/update';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { getRandomWorkspaceIconTheme } from '@/common/modules/navigations/gnb/helpers/gnb-logo-helper';

import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';


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

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    headerTitle: computed(() => {
        if (props.createType === 'EDIT') return i18n.t('IAM.WORKSPACES.EDIT_WORKSPACE');
        return i18n.t('IAM.WORKSPACES.CREATE_WORKSPACE');
    }),
    name: undefined as undefined|string,
    description: '',
});

const validationState = reactive({
    isAllValid: computed(() => {
        if (props.createType === 'EDIT') {
            const isChanged = state.name !== workspacePageStore.selectedWorkspaces[0].name
                || state.description !== workspacePageStore.selectedWorkspaces[0].tags?.description;
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
                    description: state.description ?? '',
                },
            });
            showSuccessMessage(i18n.t('Workspace successfully updated'), '');
        } else {
            const response = await SpaceConnector.clientV2.identity.workspace.create<WorkspaceCreateParameters, WorkspaceModel>({
                name: state.name ?? '',
                tags: {
                    description: state.description ?? '',
                    theme: getRandomWorkspaceIconTheme(),
                },
            });
            await userWorkspaceStore.load();
            showSuccessMessage(i18n.t('Workspace successfully created'), '');
            emit('confirm', {
                id: response.workspace_id,
                name: response.name,
            });
        }
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
    } else {
        state.name = workspacePageStore.selectedWorkspaces[0].name;
        state.description = workspacePageStore.selectedWorkspaces[0].tags?.description ?? '';
    }
}, { immediate: true });


</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
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
        </template>
    </p-button-modal>
</template>
