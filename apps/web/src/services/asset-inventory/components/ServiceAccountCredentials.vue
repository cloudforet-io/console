<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PPaneLayout, PHeading, PButton,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type {
    ServiceAccountDeleteSecretDataParameters,
} from '@/schema/identity/service-account/api-verbs/detele-secret-data';
import type {
    ServiceAccountUpdateSecretDataParameters,
} from '@/schema/identity/service-account/api-verbs/update-secret-data';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type {
    TrustedAccountUpdateSecretDataParameters,
} from '@/schema/identity/trusted-account/api-verbs/update-secret-data';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import type { SecretCreateParameters } from '@/schema/secret/secret/api-verbs/create';
import type { SecretGetParameters } from '@/schema/secret/secret/api-verbs/get';
import type { SecretListParameters } from '@/schema/secret/secret/api-verbs/list';
import type { SecretModel } from '@/schema/secret/secret/model';
import type { TrustedSecretGetParameters } from '@/schema/secret/trusted-secret/api-verbs/get';
import type { TrustedSecretListParameters } from '@/schema/secret/trusted-secret/api-verbs/list';
import type { TrustedSecretModel } from '@/schema/secret/trusted-secret/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountCredentialsDetail
    from '@/services/asset-inventory/components/ServiceAccountCredentialsDetail.vue';
import ServiceAccountCredentialsForm
    from '@/services/asset-inventory/components/ServiceAccountCredentialsForm.vue';
import type {
    PageMode, CredentialForm,
} from '@/services/asset-inventory/types/service-account-page-type';

interface Props {
    provider?: string;
    serviceAccountId?: string;
    serviceAccountType: AccountType;
    serviceAccountData: Partial<ServiceAccountModel>|Partial<TrustedAccountModel>|undefined;
    projectId?: string;
    attachedTrustedAccountId?: string;
    editable: boolean;
    hasManagePermission: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    provider: undefined,
    serviceAccountId: undefined,
    serviceAccountType: ACCOUNT_TYPE.GENERAL,
    serviceAccountData: undefined,
    projectId: undefined,
    attachedTrustedAccountId: undefined,
    editable: false,
    hasManagePermission: undefined,
});

const emit = defineEmits<{(e: 'refresh'): void; }>();

const state = reactive({
    loading: true,
    mode: 'READ' as PageMode,
    isFormValid: undefined,
    credentialData: undefined as SecretModel|TrustedSecretModel|undefined,
    credentialForm: {} as CredentialForm,
    originCredentialForm: {} as Partial<CredentialForm>,
    originAttachedTrustedAccountId: computed(() => (props.attachedTrustedAccountId)),
    hasTrustedSecret: computed(() => (!!props.serviceAccountData?.trusted_account_id)),
    isTrustedAccount: computed(() => (props.serviceAccountType === ACCOUNT_TYPE.TRUSTED)),
});

/* Api */
const deleteGeneralSecret = async (): Promise<void> => {
    try {
        await SpaceConnector.clientV2.identity.serviceAccount.deleteSecretData<ServiceAccountDeleteSecretDataParameters>({
            service_account_id: props.serviceAccountId,
        });
        state.credentialData = undefined;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    }
};

const getTrustedSecretId = async (trustedAccountId: string): Promise<string|undefined> => {
    try {
        const { results } = await SpaceConnector.clientV2.secret.trustedSecret.list<TrustedSecretListParameters, ListResponse<TrustedSecretModel>>({
            trusted_account_id: trustedAccountId,
        });
        return results ? results[0].trusted_secret_id : undefined;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
        return undefined;
    }
};

const createGeneralSecret = async () => {
    try {
        let data;
        if (state.credentialForm.activeDataType === 'json') {
            data = JSON.parse(state.credentialForm.credentialJson);
        } else if (state.credentialForm.activeDataType === 'input') {
            data = state.credentialForm.customSchemaForm;
        }

        await SpaceConnector.clientV2.secret.secret.create<SecretCreateParameters, SecretModel>({
            name: (props.serviceAccountData?.name ?? '') + props.serviceAccountId,
            data,
            schema_id: state.credentialForm.selectedSecretSchema.schema_id,
            service_account_id: props.serviceAccountId,
            trusted_secret_id: state.credentialForm.attachedTrustedAccountId ? await getTrustedSecretId(state.credentialForm.attachedTrustedAccountId) : undefined,
            resource_group: 'PROJECT',
            project_id: props.projectId,
        });
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    }
};
const updateGeneralSecret = async () => {
    try {
        let data;
        if (state.credentialForm.activeDataType === 'json') {
            data = JSON.parse(state.credentialForm.credentialJson);
        } else if (state.credentialForm.activeDataType === 'input') {
            data = state.credentialForm.customSchemaForm;
        }

        await SpaceConnector.clientV2.identity.serviceAccount.updateSecretData<ServiceAccountUpdateSecretDataParameters, ServiceAccountModel>({
            secret_data: data,
            service_account_id: props.serviceAccountId,
            secret_schema_id: state.credentialForm.selectedSecretSchema.schema_id,
            trusted_account_id: state.credentialForm.attachedTrustedAccountId,
        });
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
    }
};
const updateTrustedSecret = async (): Promise<boolean> => {
    try {
        await SpaceConnector.clientV2.secret.trustedSecret.update({
            trusted_secret_id: state.credentialData?.trusted_secret_id,
            schema: state.credentialForm.selectedSecretSchema.schema_id,
        });
        return true;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_UPDATE_CREDENTIALS'));
        return false;
    }
};
const updateDataTrustedSecret = async () => {
    if (!state.credentialData?.trusted_secret_id) return;
    try {
        let data;
        if (state.credentialForm.activeDataType === 'json') {
            data = JSON.parse(state.credentialForm.credentialJson);
        } else if (state.credentialForm.activeDataType === 'input') {
            data = state.credentialForm.customSchemaForm;
        }

        await SpaceConnector.clientV2.identity.trustedAccount.updateSecretData<TrustedAccountUpdateSecretDataParameters, TrustedAccountModel>({
            trusted_account_id: props.serviceAccountId,
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
    if (props.serviceAccountType === ACCOUNT_TYPE.GENERAL) {
        if (!state.credentialForm.hasCredentialKey) {
            if (!isEmpty(state.credentialData)) await deleteGeneralSecret();
        } else if (state.credentialData) {
            await createGeneralSecret();
        } else {
            await updateGeneralSecret();
        }
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_UPDATE_CREDENTIALS'), '');
    } else {
        let isValid = true;
        if (state.credentialForm.selectedSecretSchema.schema_id !== state.credentialData?.schema_id) {
            isValid = await updateTrustedSecret();
        }
        if (isValid) await updateDataTrustedSecret();
    }
    state.mode = 'READ';
    emit('refresh');
};
const handleChangeCredentialForm = (credentialForm) => {
    state.credentialForm = credentialForm;
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
    try {
        if ((state.isTrustedAccount || state.hasTrustedSecret) && 'trusted_secret_id' in props.serviceAccountData) {
            state.credentialData = await SpaceConnector.clientV2.secret.trustedSecret.get<TrustedSecretGetParameters, TrustedSecretModel>({
                trusted_secret_id: props.serviceAccountData?.trusted_secret_id ?? '',
            });
        } else if ('secret_id' in props.serviceAccountData) {
            state.credentialData = await SpaceConnector.clientV2.secret.secret.get<SecretGetParameters, SecretModel>({
                secret_id: props.serviceAccountData.secret_id ?? '',
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.originCredentialForm.hasCredentialKey = !isEmpty(state.credentialData);
        state.loading = false;
    }
};

watch(() => props.serviceAccountData, async (serviceAccountData) => {
    if (serviceAccountData) {
        await getSecretData();
        if (state.credentialData) await getSecretSchema();
    }
}, { immediate: true });
watch(() => props.attachedTrustedAccountId, (attachedTrustedAccountId) => {
    state.originCredentialForm.attachedTrustedAccountId = attachedTrustedAccountId;
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="service-account-credentials">
        <p-heading heading-type="sub"
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')"
        >
            <template #extra>
                <p-button v-if="state.mode === 'READ' && props.editable && state.credentialData"
                          icon-left="ic_edit"
                          style-type="transparent"
                          @click="handleClickEditButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                </p-button>
                <div v-if="state.mode === 'UPDATE'"
                     class="button-wrapper"
                >
                    <p-button style-type="transparent"
                              @click="handleClickCancelButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!state.isFormValid"
                              @click="handleClickSaveButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <div class="content-wrapper">
            <service-account-credentials-detail v-show="state.mode === 'READ'"
                                                :credential-data="state.credentialData"
                                                :attached-trusted-account-id="props.attachedTrustedAccountId"
                                                :loading="state.loading"
                                                :has-manage-permission="hasManagePermission"
                                                @edit="handleClickEditButton"
            />
            <service-account-credentials-form v-if="state.mode === 'UPDATE'"
                                              edit-mode="UPDATE"
                                              :service-account-type="serviceAccountType"
                                              :provider="provider"
                                              :is-valid.sync="state.isFormValid"
                                              :origin-form="state.originCredentialForm"
                                              @change="handleChangeCredentialForm"
            />
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.service-account-credentials {
    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        min-height: 10rem;
        padding-top: 0.5rem;
        padding-bottom: 2.5rem;
        .service-account-credentials-form {
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }
}
</style>
