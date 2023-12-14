<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PLazyImg, PMarkdown, PHeading, PPaneLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { SchemaModel } from '@/schema/identity/schema/model';
import type { ServiceAccountCreateParameters } from '@/schema/identity/service-account/api-verbs/create';
import type { ServiceAccountDeleteParameters } from '@/schema/identity/service-account/api-verbs/detele';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountCreateParameters } from '@/schema/identity/trusted-account/api-verbs/create';
import type { TrustedAccountDeleteParameters } from '@/schema/identity/trusted-account/api-verbs/detele';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import type { SecretCreateParameters } from '@/schema/secret/secret/api-verbs/create';
import type { SecretModel } from '@/schema/secret/secret/model';
import type { TrustedSecretCreateParameters } from '@/schema/secret/trusted-secret/api-verbs/create';
import type { TrustedSecretListParameters } from '@/schema/secret/trusted-secret/api-verbs/list';
import type { TrustedSecretModel } from '@/schema/secret/trusted-secret/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { TrustedAccountReferenceMap } from '@/store/modules/reference/trusted-account/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import InfoButton from '@/common/modules/portals/InfoButton.vue';

import ServiceAccountBaseInformationForm
    from '@/services/asset-inventory/components/ServiceAccountBaseInformationForm.vue';
import ServiceAccountCredentialsForm
    from '@/services/asset-inventory/components/ServiceAccountCredentialsForm.vue';
import { ACCOUNT_TYPE_BADGE_OPTION } from '@/services/asset-inventory/constants/service-account-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';
import type { BaseInformationForm, CredentialForm } from '@/services/asset-inventory/types/service-account-page-type';

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const props = defineProps<{
    provider?: string;
    serviceAccountType?: AccountType;
}>();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    trustedAccounts: computed<TrustedAccountReferenceMap>(() => store.getters['reference/trustedAccountItems']),
});

const state = reactive({
    isTrustedAccount: computed(() => props.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    providerSchemaLoading: true,
    providerSchemaData: computed<Partial<SchemaModel|undefined>>(
        () => (state.isTrustedAccount ? serviceAccountSchemaStore.getters.trustedAccountSchema : serviceAccountSchemaStore.getters.generalAccountSchema),
    ),
    providerIcon: computed(() => (props.provider ? storeState.providers[props.provider]?.icon : '')),
    description: computed(() => state.providerSchemaData?.options?.help),
    enableCredentialInput: computed<boolean>(() => (state.providerSchemaData?.related_schemas ?? []).length),
    baseInformationSchema: computed(() => (state.providerSchemaData?.schema)),
});

const formState = reactive({
    baseInformationForm: {} as BaseInformationForm,
    isBaseInformationFormValid: false,
    accountType: props.serviceAccountType ?? ACCOUNT_TYPE.GENERAL,
    credentialForm: {} as CredentialForm,
    isCredentialFormValid: false,
    isValid: computed(() => {
        if (!formState.isBaseInformationFormValid) return false;
        if (!formState.isCredentialFormValid && state.enableCredentialInput) return false;
        if (state.isTrustedAccount) return true;
        return true;
    }),
    formLoading: false,
});

const createAccount = async (): Promise<string|undefined> => {
    if (!props.provider) throw new Error('Invalid parameter');
    const data = formState.baseInformationForm.customSchemaForm;

    let res: TrustedAccountModel|ServiceAccountModel;
    if (state.isTrustedAccount) {
        res = await SpaceConnector.clientV2.identity.trustedAccount.create<TrustedAccountCreateParameters, TrustedAccountModel>({
            provider: props.provider,
            name: formState.baseInformationForm.accountName,
            data,
            permission_group: 'WORKSPACE',
        });
    } else {
        res = await SpaceConnector.clientV2.identity.serviceAccount.create<ServiceAccountCreateParameters, ServiceAccountModel>({
            provider: props.provider,
            name: formState.baseInformationForm.accountName.trim(),
            data,
            tags: formState.baseInformationForm.tags,
            trusted_account_id: formState.credentialForm.attachedTrustedAccountId,
            project_id: formState.baseInformationForm.projectForm.selectedProjectId,
        });
    }

    return (!state.isTrustedAccount && ('service_account_id' in res)) ? res.service_account_id : res.trusted_account_id;
};

const deleteServiceAccount = async (serviceAccountId: string) => {
    if (state.isTrustedAccount) {
        await SpaceConnector.clientV2.identity.trustedAccount.delete<TrustedAccountDeleteParameters>({
            trusted_account_id: serviceAccountId,
        });
    } else {
        await SpaceConnector.clientV2.identity.serviceAccount.delete<ServiceAccountDeleteParameters>({
            service_account_id: serviceAccountId,
        });
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

const createSecret = async (accountId: string): Promise<void> => {
    let data;
    if (formState.credentialForm.activeDataType === 'json') {
        data = JSON.parse(formState.credentialForm.credentialJson);
    } else if (formState.credentialForm.activeDataType === 'input') {
        data = formState.credentialForm.customSchemaForm;
    }

    const attachedTrustedAccountId = formState.credentialForm.attachedTrustedAccountId;
    if (state.isTrustedAccount) {
        await SpaceConnector.client.secret.trustedSecret.create<TrustedSecretCreateParameters, TrustedSecretModel>({
            name: formState.baseInformationForm.accountName + accountId,
            data,
            project_id: formState.baseInformationForm.projectForm.selectedProjectId,
            permission_group: 'WORKSPACE',
            trusted_account_id: attachedTrustedAccountId,
        });
    } else {
        await SpaceConnector.client.secret.secret.create<SecretCreateParameters, SecretModel>({
            name: formState.baseInformationForm.accountName + accountId,
            data,
            permission_group: 'PROJECT',
            service_account_id: accountId,
            project_id: formState.baseInformationForm.projectForm.selectedProjectId,
            trusted_secret_id: attachedTrustedAccountId ? await getTrustedSecretId(attachedTrustedAccountId) : undefined,
        });
    }
};

/* Event */
const handleSave = async () => {
    if (!formState.isValid) {
        ErrorHandler.handleRequestError(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID'), i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
        return;
    }
    let accountId:string|undefined;
    try {
        formState.formLoading = true;
        accountId = await createAccount();
        if (accountId && formState.credentialForm.hasCredentialKey && state.enableCredentialInput) {
        // preprocessing for Google Cloud form
            if (formState.credentialForm.customSchemaForm?.private_key) {
                formState.credentialForm.customSchemaForm.private_key = formState.credentialForm.customSchemaForm.private_key.replace(/\\n/g, '\n');
            }
            await createSecret(accountId);
        }
        showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_S_CREATE_ACCOUNT_TITLE'), '');
        SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME, query: { provider: props.provider } });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
        if (accountId) await deleteServiceAccount(accountId);
    } finally {
        formState.formLoading = false;
    }
};
const handleGoBack = () => {
    const nextPath = SpaceRouter.router.currentRoute.query.nextPath as string|undefined;
    if (nextPath) SpaceRouter.router.push(nextPath);
    else SpaceRouter.router.back();
};
const handleChangeBaseInformationForm = (baseInformationForm) => {
    formState.baseInformationForm = baseInformationForm;
};
const handleChangeCredentialForm = (credentialForm) => {
    formState.credentialForm = credentialForm;
};

/* Init */
(async () => {
    state.providerSchemaLoading = true;
    await serviceAccountSchemaStore.setProviderSchema(props.provider ?? '');
    await Promise.allSettled([
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/trustedAccount/load'),
    ]);
    state.providerSchemaLoading = false;
})();

</script>

<template>
    <div class="service-account-add-page">
        <p-heading class="mb-6"
                   show-back-button
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.TITLE', { type: ACCOUNT_TYPE_BADGE_OPTION[props.serviceAccountType].label })"
                   @click-back-button="handleGoBack"
        >
            <template #title-left-extra>
                <p-lazy-img class="icon"
                            :src="state.providerIcon"
                            :alt="provider"
                            :loading="state.providerSchemaLoading"
                            error-icon="ic_cloud-filled"
                />
            </template>
            <template #extra>
                <info-button v-if="state.description"
                             :visible="!!state.description"
                             class="info-button"
                >
                    <template #contents>
                        <p-markdown :markdown="state.description"
                                    :data="state.description"
                                    :language="$store.state.user.language"
                                    class="!p-0"
                        />
                    </template>
                </info-button>
            </template>
        </p-heading>

        <div class="content-wrapper">
            <p-pane-layout class="form-wrapper">
                <p-heading heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')"
                />
                <service-account-base-information-form :schema="state.baseInformationSchema"
                                                       :is-valid.sync="formState.isBaseInformationFormValid"
                                                       :account-type="formState.accountType"
                                                       @change="handleChangeBaseInformationForm"
                />
            </p-pane-layout>
            <p-pane-layout v-if="state.enableCredentialInput"
                           class="form-wrapper"
            >
                <p-heading heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')"
                />
                <service-account-credentials-form
                    :service-account-type="formState.accountType"
                    :provider="props.provider ?? ''"
                    :is-valid.sync="formState.isCredentialFormValid"
                    @change="handleChangeCredentialForm"
                />
            </p-pane-layout>
        </div>

        <div class="button-wrapper">
            <p-button class="text-button"
                      style-type="primary"
                      size="lg"
                      :disabled="!formState.isValid"
                      :loading="formState.formLoading"
                      @click="handleSave"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.ADD') }}
            </p-button>
            <p-button class="text-button"
                      style-type="tertiary"
                      size="lg"
                      @click="handleGoBack"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CANCEL') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-add-page {
    .content-wrapper {
        display: grid;
        gap: 1rem;

        .form-wrapper {
            .service-account-project-form {
                padding: 0.5rem 1rem 2.5rem 1rem;
            }
            .service-account-credentials-form {
                padding: 0.5rem 1rem 2.5rem 1rem;
            }
            .service-account-base-information-form {
                padding: 0.5rem 1rem 2.5rem 1rem;
            }
        }
    }
    .info-button {
        flex-shrink: 0;
        line-height: 2rem;
    }
    .button-wrapper {
        display: flex;
        flex-direction: row-reverse;
        margin-top: 1rem;
        .text-button {
            margin-left: 1rem;
        }
    }
}
</style>
