<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PDefinitionTable, PI, PStatus,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import type { AppDisableParameters } from '@/api-clients/identity/app/schema/api-verbs/disable';
import type { AppEnableParameters } from '@/api-clients/identity/app/schema/api-verbs/enable';
import type { AppGenerateClientSecretParameters } from '@/api-clients/identity/app/schema/api-verbs/generateClientSecret';
import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-model/use-all-reference-data-model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo, peacock } from '@/styles/colors';

import { appStateFormatter } from '@/services/iam/composables/refined-table-data';
import { useAppDeleteMutation } from '@/services/iam/composables/use-app-delete-mutation';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';

interface Props {
    selectedApp: AppModel;
}

const props = withDefaults(defineProps<Props>(), {
    selectedApp: () => ({}) as AppModel,
});

const emit = defineEmits<{(e: 'confirm', app?: AppModel): void;
}>();

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.state;
const userStore = useUserStore();

const { appAPI } = useAppApi();
const { mutate: deleteAppMutate } = useAppDeleteMutation({
    onSettled: () => {
        handleClose();
    },
});
const { mutate: enableAppMutate } = useMutation({
    mutationFn: (params: AppEnableParameters) => appAPI.enable(params),
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.APP.ALT_S_ENABLED_APP'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        handleClose();
    },
});
const { mutate: disableAppMutate } = useMutation({
    mutationFn: (params: AppDisableParameters) => appAPI.disable(params),
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.APP.ALT_S_DISABLED_APP'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        handleClose();
    },
});
const { mutate: generateClientSecretMutate } = useMutation({
    mutationFn: (params: AppGenerateClientSecretParameters) => appAPI.generateClientSecret(params),
    onSuccess: (data) => {
        emit('confirm', data);
        appPageStore.setModalVisible('apiKey', true);
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        handleClose();
    },
});

const referenceMap = useAllReferenceDataModel();

const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    confirmButton: computed(() => {
        if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            return i18n.t('IAM.APP.DELETE');
        }
        if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
            return i18n.t('IAM.APP.ENABLE');
        }
        if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
            return i18n.t('IAM.APP.DISABLE');
        }
        if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.REGENERATE) {
            return i18n.t('IAM.APP.MODAL.BTN_REGENERATE');
        }
        return '';
    }),
    selectedApp: computed(() => {
        let projectLabel = '';
        if (props.selectedApp.project_group_id) {
            projectLabel = referenceMap.projectGroup[props.selectedApp.project_group_id]?.label;
        } else if (props.selectedApp.project_id) {
            projectLabel = referenceMap.project[props.selectedApp.project_id]?.label;
        }
        return {
            ...props.selectedApp,
            project: props.selectedApp.project_group_id || props.selectedApp.project_id ? {
                icon: props.selectedApp.project_group_id ? 'ic_folder-filled' : 'ic_document-filled',
                color: props.selectedApp.project_id ? peacock[600] : indigo[500],
                label: projectLabel,
            } : undefined,
        };
    }),
});

const definitionFields = computed(() => {
    const projectFields: DefinitionField[] = [];
    if (props.selectedApp.project_group_id || props.selectedApp.project_id) {
        projectFields.push({ label: i18n.t('IAM.APP.MODAL.COL_PROJECT'), name: 'project' });
    }
    return [
        { label: i18n.t('IAM.APP.MODAL.COL_NAME'), name: 'name' },
        { label: i18n.t('IAM.APP.MODAL.COL_STATE'), name: 'state' },
        { label: i18n.t('IAM.APP.MODAL.COL_APP_ID'), name: 'app_id' },
        ...projectFields,
        { label: i18n.t('IAM.APP.MODAL.COL_ROLE_ID'), name: 'role_id' },
        { label: i18n.t('IAM.APP.MODAL.COL_LASTED_AT'), name: 'last_accessed_at' },
        { label: i18n.t('IAM.APP.MODAL.COL_EXPIRED_AT'), name: 'expired_at' },
    ];
});

/* Component */
const handleClose = () => {
    appPageStore.resetModal();
    emit('confirm');
};


/* API */
const checkModalConfirm = async () => {
    if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
        deleteAppMutate({ app_id: props.selectedApp.app_id });
    } else if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
        enableAppMutate({ app_id: props.selectedApp.app_id });
    } else if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
        disableAppMutate({ app_id: props.selectedApp.app_id });
    } else if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.REGENERATE) {
        generateClientSecretMutate({ app_id: props.selectedApp.app_id });
    }
};
</script>

<template>
    <p-button-modal :visible="appPageState.modalVisible.status"
                    :header-title="appPageState.modalInfo.title"
                    :theme-color="appPageState.modalInfo.themeColor"
                    :loading="appPageState.modalInfo.loading"
                    size="md"
                    class="app-management-status-modal"
                    @confirm="checkModalConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-definition-table :fields="definitionFields"
                                :data="state.selectedApp"
                                :skeleton-rows="6"
                                block
                                disable-copy
            >
                <template #data-state="{data}">
                    <p-status v-bind="appStateFormatter(data)"
                              class="capitalize"
                    />
                </template>
                <template #data-project="{value}">
                    <div v-if="value"
                         class="col-project"
                    >
                        <p-i :name="value.icon"
                             :color="value.color"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ value.label }}</span>
                    </div>
                </template>
                <template #data-expired_at="{data}">
                    {{ iso8601Formatter(data, storeState.timezone) }}
                </template>
                <template #data-created_at="{data}">
                    {{ iso8601Formatter(data, storeState.timezone) }}
                </template>
            </p-definition-table>
        </template>
        <template #confirm-button>
            {{ state.confirmButton }}
        </template>
    </p-button-modal>
</template>


<style lang="postcss" scoped>
.app-management-status-modal {
    .col-project {
        @apply flex items-center;
        gap: 0.5rem;
    }
}
</style>
