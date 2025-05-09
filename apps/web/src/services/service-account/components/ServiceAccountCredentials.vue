<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PPaneLayout, PHeading, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import type {
    ServiceAccountDeleteSecretDataParameters,
} from '@/api-clients/identity/service-account/schema/api-verbs/detele-secret-data';
import type {
    ServiceAccountUpdateSecretDataParameters,
} from '@/api-clients/identity/service-account/schema/api-verbs/update-secret-data';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type {
    TrustedAccountUpdateSecretDataParameters,
} from '@/api-clients/identity/trusted-account/schema/api-verbs/update-secret-data';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import type { SecretGetParameters } from '@/schema/secret/secret/api-verbs/get';
import type { SecretListParameters } from '@/schema/secret/secret/api-verbs/list';
import type { SecretModel } from '@/schema/secret/secret/model';
import type { TrustedSecretGetParameters } from '@/schema/secret/trusted-secret/api-verbs/get';
import type { TrustedSecretModel } from '@/schema/secret/trusted-secret/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountCredentialsDetail
    from '@/services/service-account/components/ServiceAccountCredentialsDetail.vue';
import ServiceAccountCredentialsForm
    from '@/services/service-account/components/ServiceAccountCredentialsForm.vue';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import type {
    PageMode, CredentialForm,
} from '@/services/service-account/types/service-account-page-type';

interface Props {
    serviceAccountId?: string;
    serviceAccountLoading: boolean;
    editable: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    serviceAccountId: undefined,
    serviceAccountLoading: true,
    editable: false,
});

const emit = defineEmits<{(e: 'refresh'): void; }>();
const serviceAccountPageStore = useServiceAccountPageStore();

const state = reactive({
    loading: true,
    mode: 'READ' as PageMode,
    isFormValid: computed(() => serviceAccountPageStore.formState.isCredentialFormValid),
    credentialData: undefined as SecretModel|TrustedSecretModel|undefined,
    credentialForm: computed(() => serviceAccountPageStore.formState.credential),
    serviceAccountData: computed(() => serviceAccountPageStore.state.originServiceAccountItem),
    originCredentialForm: {} as Partial<CredentialForm>,
    attachedTrustedAccountId: computed(() => state.serviceAccountData?.trusted_account_id),
    hasTrustedSecret: computed(() => (!!state.attachedTrustedAccountId)),
    isTrustedAccount: computed(() => serviceAccountPageStore.state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
});

/* Api */
const deleteGeneralSecret = async (): Promise<void> => {
    try {
        await SpaceConnector.clientV2.identity.serviceAccount.deleteSecretData<ServiceAccountDeleteSecretDataParameters>({
            service_account_id: props.serviceAccountId ?? '',
        });
        state.credentialData = undefined;
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    }
};

const setGeneralSecret = async () => {
    try {
        let data;
        if (state.credentialForm.activeDataType === 'json') {
            data = JSON.parse(state.credentialForm.credentialJson);
        } else if (state.credentialForm.activeDataType === 'input') {
            data = state.credentialForm.customSchemaForm;
        }
        await SpaceConnector.clientV2.identity.serviceAccount.updateSecretData<ServiceAccountUpdateSecretDataParameters, ServiceAccountModel>({
            secret_data: data,
            secret_schema_id: state.credentialForm.selectedSecretSchema.schema_id,
            service_account_id: props.serviceAccountId ?? '',
            trusted_account_id: state.credentialForm.attachedTrustedAccountId,
        });
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    }
};
const updateTrustedSecretData = async () => {
    try {
        let data;
        if (state.credentialForm.activeDataType === 'json') {
            data = JSON.parse(state.credentialForm.credentialJson);
        } else if (state.credentialForm.activeDataType === 'input') {
            data = state.credentialForm.customSchemaForm;
        }
        await SpaceConnector.clientV2.identity.trustedAccount.updateSecretData<TrustedAccountUpdateSecretDataParameters, TrustedAccountModel>({
            trusted_account_id: props.serviceAccountId ?? '',
            secret_schema_id: state.credentialForm.selectedSecretSchema.schema_id,
            secret_data: data,
        });

        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    }
};

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
    if (!state.isTrustedAccount) {
        if (!state.credentialForm.hasCredentialKey) {
            if (!isEmpty(state.credentialData)) await deleteGeneralSecret();
        } else {
            await setGeneralSecret();
        }
    } else {
        await updateTrustedSecretData();
    }
    state.mode = 'READ';
    emit('refresh');
};

const getSecretSchema = async () => {
    try {
        if (state.credentialData?.trusted_secret_id) {
            state.credentialForm.customSchemaForm = await SpaceConnector.clientV2.secret.trustedSecret.get<TrustedSecretGetParameters, TrustedSecretModel>({
                trusted_secret_id: state.credentialData.trusted_secret_id,
            });
        } else if (state.credentialData && 'secret_id' in state.credentialData) {
            state.credentialForm.customSchemaForm = await SpaceConnector.clientV2.secret.secret.get<SecretListParameters, SecretModel>({
                secret_id: state.credentialData.secret_id,
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const getSecretData = async () => {
    if (!state.serviceAccountData) return;
    try {
        if ((state.isTrustedAccount || state.hasTrustedSecret) && 'trusted_secret_id' in state.serviceAccountData) {
            state.credentialData = await SpaceConnector.clientV2.secret.trustedSecret.get<TrustedSecretGetParameters, TrustedSecretModel>({
                trusted_secret_id: state.serviceAccountData?.trusted_secret_id ?? '',
            });
        } else if ('secret_id' in state.serviceAccountData) {
            state.credentialData = await SpaceConnector.clientV2.secret.secret.get<SecretGetParameters, SecretModel>({
                secret_id: state.serviceAccountData.secret_id ?? '',
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.originCredentialForm.hasCredentialKey = !isEmpty(state.credentialData);
        state.loading = false;
    }
};

watch(() => state.serviceAccountData, async (serviceAccountData) => {
    if (serviceAccountData && !props.serviceAccountLoading) {
        await getSecretData();
        if (state.credentialData) await getSecretSchema();
    }
}, { immediate: true });
watch(() => state.attachedTrustedAccountId, (attachedTrustedAccountId) => {
    if (!state.isTrustedAccount) state.originCredentialForm.attachedTrustedAccountId = attachedTrustedAccountId;
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
                    <p-button v-if="state.mode === 'READ' && props.editable && state.credentialData"
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
                                                :credential-data="state.credentialData"
                                                :attached-trusted-account-id="state.attachedTrustedAccountId"
                                                :loading="props.serviceAccountLoading || state.loading"
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
                          :loading="state.loading"
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
