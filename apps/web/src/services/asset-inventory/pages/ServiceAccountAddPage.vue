<script setup lang="ts">
import { computed, onBeforeMount, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PLazyImg, PMarkdown, PHeading, PPaneLayout, PButtonModal, PLink, PHeadingLayout,
} from '@cloudforet/mirinae';


import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';
import type { ServiceAccountCreateParameters } from '@/api-clients/identity/service-account/schema/api-verbs/create';
import type { ServiceAccountDeleteParameters } from '@/api-clients/identity/service-account/schema/api-verbs/detele';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';
import type { TrustedAccountCreateParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/create';
import type { TrustedAccountDeleteParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/detele';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n } from '@/translations';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { TrustedAccountReferenceMap } from '@/store/reference/trusted-account-reference-store';
import { useUserStore } from '@/store/user/user-store';

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
const userStore = useUserStore();

const props = defineProps<{
    provider?: string;
    serviceAccountType?: AccountType;
}>();
const { getProperRouteLocation } = useProperRouteLocation();
const router = useRouter();
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    trustedAccounts: computed<TrustedAccountReferenceMap>(() => allReferenceStore.getters.trustedAccount),
    language: computed<string|undefined>(() => userStore.state.language),
});

const state = reactive({
    isTrustedAccount: computed(() => serviceAccountPageStore.state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
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
    enableCredentialInput: computed<boolean>(() => (state.providerSchemaData?.related_schemas ?? []).length) && props.provider !== 'kubernetes',
    baseInformationSchema: computed(() => (state.providerSchemaData?.schema)),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    createModal: false,
    createdAccountId: '',
});

const formState = reactive({
    baseInformationForm: computed<Partial<BaseInformationForm>>(() => serviceAccountPageStore.formState.baseInformation),
    isBaseInformationFormValid: computed(() => serviceAccountPageStore.formState.isBaseInformationFormValid),
    accountType: props.serviceAccountType ?? ACCOUNT_TYPE.GENERAL,
    credentialForm: computed<Partial<CredentialForm>>(() => serviceAccountPageStore.formState.credential),
    isCredentialFormValid: computed(() => serviceAccountPageStore.formState.isCredentialFormValid),
    isAutoSyncFormValid: computed(() => serviceAccountPageStore.formState.isAutoSyncFormValid),
    isValid: computed(() => {
        if (!formState.isBaseInformationFormValid) return false;
        if (!formState.isCredentialFormValid && state.enableCredentialInput) return false;
        if (!formState.isAutoSyncFormValid && state.isTrustedAccount && serviceAccountPageStore.getters.isMainProvider) return false;
        return true;
    }),
    formLoading: false,
});

const createAccount = async (): Promise<string | undefined> => {
    if (!props.provider || !formState.baseInformationForm.accountName || !formState.baseInformationForm.customSchemaForm) return undefined;

    const baseData = formState.baseInformationForm.customSchemaForm;
    const secretData = preprocessCredentialData(props.provider, formState.credentialForm);

    const res : TrustedAccountModel|ServiceAccountModel = state.isTrustedAccount
        ? await createTrustedAccount(baseData, secretData)
        : await createServiceAccount(baseData, secretData, formState.credentialForm.attachedTrustedAccountId);

    return (!state.isTrustedAccount && ('service_account_id' in res)) ? res.service_account_id : res.trusted_account_id;
};

const preprocessCredentialHandlers = () => ({
    // preprocessing for Google Cloud form.
    // define other CSP from handlers here
    gcp: (customSchemaForm: Record<string, any>) => {
        if (customSchemaForm.private_key) {
            customSchemaForm.private_key = customSchemaForm.private_key.replace(/\\n/g, '\n');
        }
    },
});

const preprocessCredentialData = (csp: string, credentialForm: Partial<CredentialForm>) => {
    const handler = preprocessCredentialHandlers[csp];
    if (handler && credentialForm?.customSchemaForm) {
        handler(credentialForm.customSchemaForm);
    }
    if (credentialForm.activeDataType === 'json') {
        return JSON.parse(credentialForm.credentialJson ?? '');
    } if (credentialForm.activeDataType === 'input') {
        return credentialForm.customSchemaForm;
    }
    return credentialForm.customSchemaForm;
};

const createTrustedAccount = (baseData: object, secretData: object): Promise<TrustedAccountModel> => {
    const provider = props.provider;
    const accountName = formState.baseInformationForm.accountName?.trim();

    if (!provider || !accountName) {
        throw new Error(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID').toString());
    }

    return SpaceConnector.clientV2.identity.trustedAccount.create<TrustedAccountCreateParameters, TrustedAccountModel>({
        provider,
        name: accountName,
        data: baseData,
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
        plugin_options: serviceAccountPageFormState.additionalOptions,
    });
};

const createServiceAccount = (baseData: object, secretData: object, attachedTrustedAccountId?: string): Promise<ServiceAccountModel> => {
    const provider = props.provider;
    const accountName = formState.baseInformationForm.accountName?.trim();

    if (!provider || !accountName) {
        throw new Error(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID').toString());
    }

    return SpaceConnector.clientV2.identity.serviceAccount.create<ServiceAccountCreateParameters, ServiceAccountModel>({
        provider,
        name: accountName,
        data: baseData,
        secret_schema_id: formState.credentialForm?.selectedSecretSchema?.schema_id,
        secret_data: secretData,
        tags: formState.baseInformationForm.tags,
        trusted_account_id: attachedTrustedAccountId,
        project_id: formState.baseInformationForm.projectForm?.selectedProjectId ?? '',
    });
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
        else if (props.provider === 'kubernetes') {
            router.push(getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
                params: { serviceAccountId: accountId as string },
            }));
        } else router.push(getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME, query: { provider: props.provider } }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
        if (accountId) await deleteServiceAccount(accountId);
    } finally {
        formState.formLoading = false;
    }
};
const handleGoBack = () => {
    const nextPath = router.currentRoute.query.nextPath as string|undefined;
    if (nextPath) router.push(nextPath);
    else router.back();
};
const handleChangeBaseInformationForm = (baseInformationForm) => {
    formState.baseInformationForm = baseInformationForm;
};

const handleSync = async () => {
    try {
        await SpaceConnector.clientV2.identity.trustedAccount.sync({
            trusted_account_id: state.createdAccountId,
        });
        state.createModal = false;
        serviceAccountPageStore.initState();
        router.push(getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME, params: { serviceAccountId: state.createdAccountId } }));
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleRouteToServiceAccountDetailPage = () => {
    router.push(getProperRouteLocation({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME, params: { serviceAccountId: state.createdAccountId } }));
};

/* Init */
onBeforeMount(async () => {
    state.providerSchemaLoading = true;
    serviceAccountPageStore.initState();
    serviceAccountPageStore.setProvider(props.provider ?? '');
    await serviceAccountSchemaStore.setProviderSchema(props.provider ?? '');
    serviceAccountPageStore.$patch((_state) => {
        _state.state.serviceAccountType = props.serviceAccountType ?? ACCOUNT_TYPE.GENERAL;
    });
    state.providerSchemaLoading = false;
});


</script>

<template>
    <div class="service-account-add-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
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
                </p-heading>
            </template>
            <template #extra>
                <span class="account-info-button">
                    <info-button v-if="state.description"
                                 :visible="!!state.description"
                    >
                        <template #contents>
                            <p-markdown :markdown="state.description"
                                        :data="state.description"
                                        :language="storeState.language"
                                        class="!p-0"
                            />
                        </template>
                    </info-button>
                </span>
            </template>
        </p-heading-layout>

        <div class="content-wrapper">
            <p-pane-layout class="form-wrapper">
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')"
                />
                <service-account-base-information-form :schema="state.baseInformationSchema"
                                                       :account-type="formState.accountType"
                                                       mode="CREATE"
                                                       @change="handleChangeBaseInformationForm"
                />
            </p-pane-layout>
            <p-pane-layout v-if="state.enableCredentialInput"
                           class="form-wrapper"
            >
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')"
                />
                <service-account-credentials-form create-mode />
            </p-pane-layout>
            <p-pane-layout v-if="state.isTrustedAccount && serviceAccountPageStore.getters.isMainProvider"
                           class="form-wrapper"
            >
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.AUTO_SYNC_TITLE')"
                >
                    <template #title-right-extra>
                        <p-link :href="serviceAccountPageStore.getters.autoSyncDocsLink"
                                new-tab
                                highlight
                                action-icon="external-link"
                                class="ml-3"
                        >
                            Docs
                        </p-link>
                    </template>
                </p-heading>
                <service-account-auto-sync-form />
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
                {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.CREATE') }}
            </p-button>
            <p-button class="text-button"
                      style-type="tertiary"
                      size="lg"
                      @click="handleGoBack"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CANCEL') }}
            </p-button>
        </div>
        <p-button-modal :header-title="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.SYNC_TITLE')"
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
    .account-info-button {
        display: flex;
        height: 2rem;
        align-items: center;
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
