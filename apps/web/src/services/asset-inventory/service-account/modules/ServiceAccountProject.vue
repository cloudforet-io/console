<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PPaneLayout, PHeading, PButton,
} from '@spaceone/design-system';
import {
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountProjectDetail
    from '@/services/asset-inventory/service-account/modules/ServiceAccountProjectDetail.vue';
import ServiceAccountProjectForm
    from '@/services/asset-inventory/service-account/modules/ServiceAccountProjectForm.vue';
import type { ProjectForm, AccountType, PageMode } from '@/services/asset-inventory/service-account/type';

interface Props {
    serviceAccountLoading?: boolean;
    serviceAccountId?: string;
    serviceAccountType: AccountType;
    projectId?: string;
    editable: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    serviceAccountLoading: false,
    serviceAccountId: undefined,
    serviceAccountType: 'GENERAL',
    projectId: undefined,
    editable: false,
});
const emit = defineEmits<{(e: 'change-project'): void}>();
const { t } = useI18n();

const state = reactive({
    mode: 'READ' as PageMode,
    isFormValid: undefined,
    projectForm: {} as ProjectForm,
});

/* Api */
const updateServiceAccount = async () => {
    try {
        await SpaceConnector.client.identity.serviceAccount.update({
            service_account_id: props.serviceAccountId,
            project_id: state.projectForm.selectedProjectId,
        });
        showSuccessMessage(t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_CHANGE_PROJECT'), '');
    } catch (e: unknown) {
        ErrorHandler.handleRequestError(e, t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_CHANGE_PROJECT'));
    }
};

/* Event */
const handleClickEditButton = () => {
    state.mode = 'UPDATE';
};
const handleClickCancelButton = () => {
    state.mode = 'READ';
};
const handleChangeForm = (projectForm) => {
    state.projectForm = projectForm;
};
const handleClickSaveButton = async () => {
    if (!state.isFormValid) return;
    await updateServiceAccount();
    state.mode = 'READ';
    emit('change-project');
};

</script>

<template>
    <p-pane-layout class="service-account-project">
        <p-heading heading-type="sub"
                   :title="t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')"
        >
            <template #extra>
                <p-button v-if="state.mode === 'READ' && editable"
                          style-type="transparent"
                          icon-left="ic_edit"
                          @click="handleClickEditButton"
                >
                    {{ t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                </p-button>
                <div v-if="state.mode === 'UPDATE'"
                     class="button-wrapper"
                >
                    <p-button style-type="transparent"
                              @click="handleClickCancelButton"
                    >
                        {{ t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!state.isFormValid"
                              @click="handleClickSaveButton"
                    >
                        {{ t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <div v-if="!serviceAccountLoading"
             class="content-wrapper"
        >
            <service-account-project-detail v-if="state.mode === 'READ'"
                                            :project-id="projectId"
                                            :service-account-type="serviceAccountType"
            />
            <service-account-project-form v-else
                                          v-model:is-valid="state.isFormValid"
                                          :project-id="projectId"
                                          @change="handleChangeForm"
            />
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.service-account-project {
    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0 1rem 2.5rem 1rem;
        .service-account-project-form {
            /* custom project-select-dropdown */
            :deep(.project-select-dropdown) {
                width: 100%;
            }
        }
    }
}
</style>
