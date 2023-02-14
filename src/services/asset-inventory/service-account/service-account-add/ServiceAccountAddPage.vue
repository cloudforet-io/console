<template>
    <div class="service-account-add-page">
        <p-heading class="mb-6"
                   show-back-button
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.TITLE')"
                   @click-back-button="handleGoBack"
        >
            <template #title-left-extra>
                <p-lazy-img class="icon"
                            :src="providerIcon"
                            :alt="provider"
                            :loading="providerLoading"
                            error-icon="ic_provider_other"
                />
            </template>
            <template #extra>
                <info-button v-if="description"
                             :visible="!!description"
                             class="info-button"
                >
                    <template #contents>
                        <p-markdown :markdown="description.options.markdown"
                                    :data="description.options.markdown"
                                    :language="$store.state.user.language"
                                    class="!p-0"
                        />
                    </template>
                </info-button>
            </template>
        </p-heading>

        <div class="content-wrapper">
            <service-account-account-type :provider="provider"
                                          :account-type.sync="accountType"
                                          :show-trusted-account="showTrustedAccount"
                                          @change="handleChangeAccountType"
            />
            <p-pane-layout class="form-wrapper">
                <p-heading heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')"
                />
                <service-account-base-information-form :schema="baseInformationSchema"
                                                       :is-valid.sync="isBaseInformationFormValid"
                                                       @change="handleChangeBaseInformationForm"
                />
            </p-pane-layout>
            <p-pane-layout v-if="accountType === ACCOUNT_TYPE.GENERAL"
                           class="form-wrapper"
            >
                <p-heading heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')"
                />
                <service-account-project-form
                    :is-valid.sync="isProjectFormValid"
                    @change="handleChangeProjectForm"
                />
            </p-pane-layout>
            <p-pane-layout v-if="enableCredentialInput"
                           class="form-wrapper"
            >
                <p-heading heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')"
                />
                <service-account-credentials-form
                    :service-account-type="accountType"
                    :provider="provider"
                    :is-valid.sync="isCredentialFormValid"
                    @change="handleChangeCredentialForm"
                />
            </p-pane-layout>
        </div>

        <div class="button-wrapper">
            <p-button class="text-button"
                      style-type="primary"
                      size="lg"
                      :disabled="!isValid"
                      :loading="formLoading"
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

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PButton, PLazyImg, PMarkdown, PHeading, PPaneLayout,
} from '@spaceone/design-system';
import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import InfoButton from '@/common/modules/portals/InfoButton.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import ServiceAccountAccountType
    from '@/services/asset-inventory/service-account/modules/ServiceAccountAccountType.vue';
import ServiceAccountBaseInformationForm
    from '@/services/asset-inventory/service-account/modules/ServiceAccountBaseInformationForm.vue';
import ServiceAccountCredentialsForm
    from '@/services/asset-inventory/service-account/modules/ServiceAccountCredentialsForm.vue';
import ServiceAccountProjectForm from '@/services/asset-inventory/service-account/modules/ServiceAccountProjectForm.vue';
import type {
    AccountType,
    BaseInformationForm, CredentialForm, ProjectForm, ProviderModel,
} from '@/services/asset-inventory/service-account/type';

export default {
    name: 'AddServiceAccountPage',
    components: {
        ServiceAccountBaseInformationForm,
        ServiceAccountCredentialsForm,
        ServiceAccountProjectForm,
        ServiceAccountAccountType,
        InfoButton,
        PLazyImg,
        PMarkdown,
        PHeading,
        PButton,
        PPaneLayout,
    },
    props: {
        provider: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const state = reactive({
            providerLoading: true,
            providerData: {} as ProviderModel,
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            providerIcon: computed(() => state.providers[state.providerData?.provider]?.icon),
            description: computed(() => get(state.providerData, 'metadata.view.layouts.help:service_account:create', undefined)),
            enableCredentialInput: computed<boolean>(() => {
                const secretTypes = state.providerData?.capability?.supported_schema ?? [];
                return secretTypes.length > 0;
            }),
            baseInformationSchema: computed(() => state.providerData.template?.service_account?.schema),
            showTrustedAccount: computed(() => state.providerData?.capability?.support_trusted_service_account ?? false),
        });

        const formState = reactive({
            baseInformationForm: {} as BaseInformationForm,
            isBaseInformationFormValid: false,
            accountType: 'GENERAL' as AccountType,
            credentialForm: {} as CredentialForm,
            isCredentialFormValid: false,
            projectForm: {} as ProjectForm,
            isProjectFormValid: undefined,
            isValid: computed(() => {
                if (!formState.isBaseInformationFormValid) return false;
                if (!formState.isCredentialFormValid && state.enableCredentialInput) return false;
                if (formState.accountType === ACCOUNT_TYPE.TRUSTED) return true;
                if (!formState.isProjectFormValid) return false;
                return true;
            }),
            formLoading: false,
        });

        /* Api */
        const getProvider = async () => {
            try {
                state.providerData = await SpaceConnector.client.identity.provider.get({
                    provider: props.provider,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                state.providerData = {};
            }
        };

        const deleteServiceAccount = async (serviceAccountId: string) => {
            await SpaceConnector.client.identity.serviceAccount.delete({
                service_account_id: serviceAccountId,
            });
        };
        const createServiceAccount = async (): Promise<string|undefined> => {
            try {
                formState.formLoading = true;
                const res = await SpaceConnector.client.identity.serviceAccount.create({
                    provider: props.provider,
                    name: formState.baseInformationForm.accountName.trim(),
                    data: formState.baseInformationForm.customSchemaForm,
                    tags: formState.baseInformationForm.tags,
                    service_account_type: formState.accountType,
                    trusted_service_account_id: formState.credentialForm.attachedTrustedAccountId,
                    project_id: formState.projectForm.selectedProjectId,
                });
                return res.service_account_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                return undefined;
            } finally {
                formState.formLoading = false;
            }
        };
        const createSecret = async (serviceAccountId: string): Promise<boolean> => {
            let isSucceed: boolean;
            try {
                let data;
                if (formState.credentialForm.activeDataType === 'json') {
                    data = JSON.parse(formState.credentialForm.credentialJson);
                } else if (formState.credentialForm.activeDataType === 'input') {
                    data = formState.credentialForm.customSchemaForm;
                }

                let createApi = SpaceConnector.client.secret.secret.create;
                if (formState.accountType === ACCOUNT_TYPE.TRUSTED) {
                    createApi = SpaceConnector.client.secret.trustedSecret.create;
                }
                await createApi({
                    name: formState.baseInformationForm.accountName + serviceAccountId,
                    data,
                    schema: formState.credentialForm.selectedSecretType,
                    secret_type: 'CREDENTIALS',
                    service_account_id: serviceAccountId,
                    project_id: formState.projectForm.selectedProjectId,
                    trusted_secret_id: formState.credentialForm.attachedTrustedSecretId,
                });

                showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_S_CREATE_ACCOUNT_TITLE'), '');
                isSucceed = true;
            } catch (e) {
                isSucceed = false;
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                await deleteServiceAccount(serviceAccountId);
            }

            return isSucceed;
        };

        /* Event */
        const handleSave = async () => {
            if (!formState.isValid) {
                ErrorHandler.handleRequestError(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID'), i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                return;
            }

            const serviceAccountId = await createServiceAccount();
            if (serviceAccountId && formState.credentialForm.hasCredentialKey && state.enableCredentialInput) {
                // preprocessing for Google Cloud form
                if (formState.credentialForm.customSchemaForm?.private_key) {
                    formState.credentialForm.customSchemaForm.private_key = formState.credentialForm.customSchemaForm.private_key.replace(/\\n/g, '\n');
                }
                const isSecretCreationSuccess = await createSecret(serviceAccountId);
                if (!isSecretCreationSuccess) return;
            }
            SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME, query: { provider: props.provider } });
        };
        const handleGoBack = () => {
            const nextPath = SpaceRouter.router.currentRoute.query.nextPath as string|undefined;
            if (nextPath) SpaceRouter.router.push(nextPath);
            else SpaceRouter.router.back();
        };
        const handleChangeAccountType = (accountType: AccountType) => {
            formState.accountType = accountType;
            if (accountType === ACCOUNT_TYPE.TRUSTED) {
                formState.projectForm = { selectedProjectId: null };
            }
        };
        const handleChangeBaseInformationForm = (baseInformationForm) => {
            formState.baseInformationForm = baseInformationForm;
        };
        const handleChangeCredentialForm = (credentialForm) => {
            formState.credentialForm = credentialForm;
        };
        const handleChangeProjectForm = (projectForm) => {
            formState.projectForm = projectForm;
        };

        /* Init */
        (async () => {
            state.providerLoading = true;
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                getProvider(),
            ]);
            state.providerLoading = false;
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            ACCOUNT_TYPE,
            handleSave,
            handleGoBack,
            handleChangeAccountType,
            handleChangeBaseInformationForm,
            handleChangeCredentialForm,
            handleChangeProjectForm,
        };
    },
};
</script>

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
