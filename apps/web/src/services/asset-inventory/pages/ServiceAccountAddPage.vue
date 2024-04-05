<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PLazyImg, PMarkdown, PHeading, PPaneLayout, PButtonModal,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import type { SchemaModel } from '@/schema/identity/schema/model';
import type { ServiceAccountCreateParameters } from '@/schema/identity/service-account/api-verbs/create';
import type { ServiceAccountDeleteParameters } from '@/schema/identity/service-account/api-verbs/detele';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountCreateParameters } from '@/schema/identity/trusted-account/api-verbs/create';
import type { TrustedAccountDeleteParameters } from '@/schema/identity/trusted-account/api-verbs/detele';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import { i18n } from '@/translations';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { TrustedAccountReferenceMap } from '@/store/reference/trusted-account-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import InfoButton from '@/common/modules/portals/InfoButton.vue';

import ServiceAccountAutoSyncForm from '@/services/asset-inventory/components/ServiceAccountAutoSyncForm.vue';
import ServiceAccountBaseInformationForm
    from '@/services/asset-inventory/components/ServiceAccountBaseInformationForm.vue';
import ServiceAccountCredentialsForm
    from '@/services/asset-inventory/components/ServiceAccountCredentialsForm.vue';
import {
    ACCOUNT_TYPE_BADGE_OPTION,
    PROVIDER_ACCOUNT_NAME,
} from '@/services/asset-inventory/constants/service-account-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';
import type { BaseInformationForm, CredentialForm } from '@/services/asset-inventory/types/service-account-page-type';


const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageFormState = serviceAccountPageStore.formState;
const appContextStore = useAppContextStore();

const props = defineProps<{
    provider?: string;
    serviceAccountType?: AccountType;
}>();
const { getProperRouteLocation } = useProperRouteLocation();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    trustedAccounts: computed<TrustedAccountReferenceMap>(() => allReferenceStore.getters.trustedAccount),
});

const state = reactive({
    isTrustedAccount: computed(() => props.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    titleAccountName: computed(() => {
        if (props.provider && !state.isTrustedAccount && Object.keys(PROVIDER_ACCOUNT_NAME).includes(props.provider)) return PROVIDER_ACCOUNT_NAME[props.provider];
        return ACCOUNT_TYPE_BADGE_OPTION[formState.accountType].label;
    }),
    providerSchemaLoading: true,
    providerSchemaData: computed<Partial<SchemaModel|undefined>>(
        () => (state.isTrustedAccount ? serviceAccountSchemaStore.getters.trustedAccountSchema : serviceAccountSchemaStore.getters.generalAccountSchema),
    ),
    providerIcon: computed(() => (props.provider ? storeState.providers[props.provider]?.icon : '')),
    description: computed(() => state.providerSchemaData?.options?.help),
    enableCredentialInput: computed<boolean>(() => (state.providerSchemaData?.related_schemas ?? []).length),
    baseInformationSchema: computed(() => (state.providerSchemaData?.schema)),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    createModal: false,
    createdAccountId: '',
});

const formState = reactive({
    baseInformationForm: {} as BaseInformationForm,
    isBaseInformationFormValid: false,
    accountType: props.serviceAccountType ?? ACCOUNT_TYPE.GENERAL,
    credentialForm: {} as CredentialForm,
    isCredentialFormValid: false,
    isAutoSyncFormValid: computed(() => serviceAccountPageStore.formState.isAutoSyncFormValid),
    isValid: computed(() => {
        if (!formState.isBaseInformationFormValid) return false;
        if (!formState.isCredentialFormValid && state.enableCredentialInput) return false;
        if (!formState.isAutoSyncFormValid && state.isTrustedAccount) return false;
        return true;
    }),
    formLoading: false,
});

const createAccount = async (): Promise<string|undefined> => {
    if (!props.provider) throw new Error('Invalid parameter');
    const data = formState.baseInformationForm.customSchemaForm;

    let res: TrustedAccountModel|ServiceAccountModel;
    if (formState.credentialForm.hasCredentialKey && state.enableCredentialInput) {
        // preprocessing for Google Cloud form
        if (formState.credentialForm.customSchemaForm?.private_key) {
            formState.credentialForm.customSchemaForm.private_key = formState.credentialForm.customSchemaForm.private_key.replace(/\\n/g, '\n');
        }
    }
    let secretData;
    if (formState.credentialForm.activeDataType === 'json') {
        secretData = JSON.parse(formState.credentialForm.credentialJson);
    } else if (formState.credentialForm.activeDataType === 'input') {
        secretData = formState.credentialForm.customSchemaForm;
    }

    const attachedTrustedAccountId = formState.credentialForm.attachedTrustedAccountId;
    if (state.isTrustedAccount) {
        res = await SpaceConnector.clientV2.identity.trustedAccount.create<TrustedAccountCreateParameters, TrustedAccountModel>({
            provider: props.provider,
            name: formState.baseInformationForm.accountName,
            data,
            secret_schema_id: formState.credentialForm?.selectedSecretSchema?.schema_id ?? '',
            secret_data: secretData,
            resource_group: state.isAdminMode ? 'DOMAIN' : 'WORKSPACE',
            tags: formState.baseInformationForm.tags,
            schedule: {
                state: serviceAccountPageFormState.isAutoSyncEnabled ? 'ENABLED' : 'DISABLED',
                hours: serviceAccountPageFormState.scheduleHours,
            },
            sync_options: {
                skip_project_group: serviceAccountPageFormState.skipProjectGroup,
                single_workspace_id: serviceAccountPageFormState.selectedSingleWorkspace ?? undefined,
            },
        });
    } else {
        res = await SpaceConnector.clientV2.identity.serviceAccount.create<ServiceAccountCreateParameters, ServiceAccountModel>({
            provider: props.provider,
            name: formState.baseInformationForm.accountName.trim(),
            data,
            secret_schema_id: formState.credentialForm?.selectedSecretSchema?.schema_id,
            secret_data: secretData,
            tags: formState.baseInformationForm.tags,
            trusted_account_id: attachedTrustedAccountId,
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
        state.createdAccountId = accountId ?? '';
        showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_S_CREATE_ACCOUNT_TITLE'), '');
        if (state.isTrustedAccount && serviceAccountPageFormState.isAutoSyncEnabled) state.createModal = true;
        else SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME, query: { provider: props.provider } });
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

const handleSync = async () => {
    try {
        await SpaceConnector.clientV2.identity.trustedAccount.sync({
            trusted_account_id: state.createdAccountId,
        });
        state.createModal = false;
        serviceAccountPageStore.initState();
        SpaceRouter.router.push(getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME, params: { serviceAccountId: state.createdAccountId } }));
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleRouteToServiceAccountDetailPage = () => {
    SpaceRouter.router.push(getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME, params: { serviceAccountId: state.createdAccountId } }));
};

/* Init */
(async () => {
    state.providerSchemaLoading = true;
    serviceAccountPageStore.initState();
    serviceAccountPageStore.setProvider(props.provider ?? '');
    await serviceAccountSchemaStore.setProviderSchema(props.provider ?? '');
    state.providerSchemaLoading = false;
})();

</script>

<template>
    <div class="service-account-add-page">
        <p-heading class="mb-6"
                   show-back-button
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.TITLE', { type: state.titleAccountName })"
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
            <p-pane-layout v-if="state.isTrustedAccount"
                           class="form-wrapper"
            >
                <p-heading heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.AUTO_SYNC_TITLE')"
                />
                <service-account-auto-sync-form mode="CREATE"
                                                :provider="props.provider"
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
        <p-button-modal :header-title="$t('Do you want to sync now?')"
                        size="sm"
                        :visible.sync="state.createModal"
                        @confirm="handleSync"
                        @cancel="handleRouteToServiceAccountDetailPage"
                        @close="handleRouteToServiceAccountDetailPage"
        >
            <template #close-button>
                {{ $t('INVENTORY.COLLECTOR.CREATE.CREATE_COMPLETE_MODAL_SKIP') }}
            </template>
            <template #confirm-button>
                {{ $t('INVENTORY.SERVICE_ACCOUNT.CREATE.COMPLETE_MODAL_SYNC') }}
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-add-page {
    .content-wrapper {
        display: grid;
        gap: 1rem;

        .form-wrapper {
            padding-bottom: 2.5rem;
            .service-account-project-form {
                padding: 0.5rem 1rem 2.5rem 1rem;
            }
            .service-account-credentials-form {
                padding: 0.5rem 1rem 0 1rem;
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
