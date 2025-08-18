<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PPaneLayout, PHeading, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import type { SecretModel } from '@/api-clients/secret/secret/schema/model';
import type { TrustedSecretModel } from '@/api-clients/secret/trusted-secret/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountCredentialsDetail
    from '@/services/service-account/components/ServiceAccountCredentialsDetail.vue';
import ServiceAccountCredentialsForm
    from '@/services/service-account/components/ServiceAccountCredentialsForm.vue';
import { useServiceAccountDeleteSecretDataMutation } from '@/services/service-account/composables/mutations/use-service-account-delete-secret-data-mutation';
import { useServiceAccountUpdateSecretDataMutation } from '@/services/service-account/composables/mutations/use-service-account-update-secret-data-mutation';
import { useTrustedAccountUpdateSecretDataMutation } from '@/services/service-account/composables/mutations/use-trusted-account-update-secret-data-mutation';
import { useServiceAccountCredentialData } from '@/services/service-account/composables/use-service-account-credential-data';
import { useServiceAccountDetail } from '@/services/service-account/composables/use-service-account-detail';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import type {
    PageMode, CredentialForm,
} from '@/services/service-account/types/service-account-page-type';



interface Props {
    serviceAccountId?: string;
    editable: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    serviceAccountId: undefined,
    editable: false,
});

const serviceAccountPageStore = useServiceAccountPageStore();

const {
    serviceAccountData,
    isTrustedAccount,
    isLoading,
} = useServiceAccountDetail({
    serviceAccountId: computed(() => props.serviceAccountId),
});

const state = reactive({
    mode: 'READ' as PageMode,
    isFormValid: computed(() => serviceAccountPageStore.formState.isCredentialFormValid),
    credentialForm: computed(() => serviceAccountPageStore.formState.credential),
    originCredentialForm: {} as Partial<CredentialForm>,
    attachedTrustedAccountId: computed(() => serviceAccountData.value?.trusted_account_id),
});

const { mutateAsync: deleteGeneralSecretData } = useServiceAccountDeleteSecretDataMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    },
});

const { mutateAsync: updateGeneralSecretData } = useServiceAccountUpdateSecretDataMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    },
});

const { mutateAsync: updateTrustedSecretData } = useTrustedAccountUpdateSecretDataMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    },
});

/* Event */
const handleClickEditButton = () => {
    state.mode = 'UPDATE';
};
const handleClickCancelButton = () => {
    state.mode = 'READ';
};
const handleClickSaveButton = async () => {
    if (!state.isFormValid) return;
    // preprocessing for Google Cloud form
    if (state.credentialForm.customSchemaForm?.private_key) {
        state.credentialForm.customSchemaForm.private_key = state.credentialForm.customSchemaForm.private_key.replace(/\\n/g, '\n');
    }
    if (!isTrustedAccount.value) {
        if (!state.credentialForm.hasCredentialKey) {
            if (credentialData.value) {
                await deleteGeneralSecretData({
                    service_account_id: props.serviceAccountId ?? '',
                });
            }
        } else {
            let data;
            if (state.credentialForm.activeDataType === 'json') {
                data = JSON.parse(state.credentialForm.credentialJson ?? '');
            } else if (state.credentialForm.activeDataType === 'input') {
                data = state.credentialForm.customSchemaForm;
            }
            await updateGeneralSecretData({
                secret_data: data,
                secret_schema_id: state.credentialForm.selectedSecretSchema?.schema_id ?? '',
                service_account_id: props.serviceAccountId ?? '',
                trusted_account_id: state.credentialForm.attachedTrustedAccountId,
            });
        }
    } else {
        let data;
        if (state.credentialForm.activeDataType === 'json') {
            data = JSON.parse(state.credentialForm.credentialJson ?? '');
        } else if (state.credentialForm.activeDataType === 'input') {
            data = state.credentialForm.customSchemaForm;
        }
        await updateTrustedSecretData({
            trusted_account_id: props.serviceAccountId ?? '',
            secret_schema_id: state.credentialForm.selectedSecretSchema?.schema_id ?? '',
            secret_data: data,
        });
    }
    state.mode = 'READ';
};

const { credentialData, isLoading: isCredentialDataLoading } = useServiceAccountCredentialData({
    secretId: computed(() => {
        if (isTrustedAccount.value) {
            return (serviceAccountData.value as TrustedAccountModel|undefined)?.trusted_secret_id;
        }
        return (serviceAccountData.value as ServiceAccountModel|undefined)?.secret_id;
    }),
    isTrustedAccount,
});

watch(credentialData, (_credentialData) => {
    state.originCredentialForm.hasCredentialKey = !!_credentialData;
    if (!_credentialData) return;
    if ('trusted_secret_id' in _credentialData) {
        state.credentialForm.customSchemaForm = _credentialData as TrustedSecretModel;
    } else if ('secret_id' in _credentialData) {
        state.credentialForm.customSchemaForm = _credentialData as SecretModel;
    }
}, { immediate: true });

watch(() => state.attachedTrustedAccountId, (attachedTrustedAccountId) => {
    if (!isTrustedAccount.value) state.originCredentialForm.attachedTrustedAccountId = attachedTrustedAccountId;
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="service-account-credentials">
        <p-heading-layout>
            <template #heading>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')"
                />
            </template>
            <template #extra>
                <div class="h-full pt-8 px-4 pb-4">
                    <p-button v-if="state.mode === 'READ' && props.editable && credentialData"
                              icon-left="ic_edit"
                              style-type="secondary"
                              @click="handleClickEditButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
        <div class="content-wrapper">
            <service-account-credentials-detail v-show="state.mode === 'READ'"
                                                :credential-data="credentialData"
                                                :attached-trusted-account-id="state.attachedTrustedAccountId"
                                                :loading="isLoading || isCredentialDataLoading"
                                                @edit="handleClickEditButton"
            />
            <service-account-credentials-form v-if="state.mode === 'UPDATE'"
                                              :origin-form="state.originCredentialForm"
            />
            <div v-if="state.mode === 'UPDATE'"
                 class="button-wrapper"
            >
                <p-button style-type="tertiary"
                          class="mr-4"
                          @click="handleClickCancelButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="isCredentialDataLoading"
                          :disabled="!state.isFormValid"
                          @click="handleClickSaveButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.service-account-credentials {
    .content-wrapper {
        min-height: 10rem;
        padding-top: 0.5rem;
        padding-bottom: 2.5rem;
        .service-account-credentials-form {
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .button-wrapper {
            padding-left: 1rem;
            margin-top: 2rem;
        }
    }
}
</style>
