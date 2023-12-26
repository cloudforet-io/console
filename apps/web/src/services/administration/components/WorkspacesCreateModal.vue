<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextarea, PTextInput,
} from '@spaceone/design-system';



import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceCreateParameters } from '@/schema/identity/workspace/api-verbs/create';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';


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
const workspacePageState = workspacePageStore.$state;

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    headerTitle: computed(() => i18n.t('IAM.WORKSPACES.CREATE_WORKSPACE')),
    name: undefined as undefined|string,
    description: '',
});

const validationState = reactive({
    isAllValid: computed(() => state.name && !validationState.nameInvalid && !validationState.isDuplicatedName),
    isDuplicatedName: computed(() => workspacePageState.workspaces.some((workspace) => workspace.name === state.name)),
    nameInvalidText: computed(() => {
        if (!state.name?.trim()) return i18n.t('IAM.WORKSPACES.FORM.REQUIRED_NAME');
        if (validationState.isDuplicatedName) return i18n.t('IAM.WORKSPACES.FORM.DUPLICATED_NAME');
        return undefined;
    }),
    nameInvalid: computed(() => state.name !== undefined && !!validationState.nameInvalidText),
});

const handleConfirm = async () => {
    try {
        await SpaceConnector.clientV2.identity.workspace.create<WorkspaceCreateParameters>({
            name: state.name ?? '',
            tags: {
                description: state.description ?? '',
            },
        });
        state.proxyVisible = false;
        showSuccessMessage(i18n.t('Workspace successfully created'), '');
        emit('update-list');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

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
