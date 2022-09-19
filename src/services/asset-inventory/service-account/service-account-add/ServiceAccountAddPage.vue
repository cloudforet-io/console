<template>
    <div class="service-account-add-page">
        <p-page-title class="mb-6"
                      child
                      :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.TITLE')"
                      @goBack="handleGoBack"
        >
            <template #title-left-extra>
                <p-lazy-img class="icon" :src="providerIcon" :alt="provider"
                            :loading="providerLoading"
                            error-icon="ic_provider_other"
                />
            </template>
            <template #extra>
                <info-button v-if="description" :visible="!!description"
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
        </p-page-title>

        <div class="content-wrapper">
            <service-account-account-type :provider="provider"
                                          :account-type.sync="accountType"
                                          @change="handleChangeAccountType"
            />
            <p-pane-layout class="form-wrapper">
                <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE')" />
                <service-account-base-information-form :schema="baseInformationSchema"
                                                       :is-valid.sync="isBaseInformationFormValid"
                                                       @change="handleChangeBaseInformationForm"
                />
            </p-pane-layout>
            <service-account-project-form :is-valid.sync="isProjectFormValid"
                                          @change="handleChangeProjectForm"
            />
            <p-pane-layout class="form-wrapper">
                <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')" />
                <service-account-credentials-form v-if="enableCredentialInput"
                                                  :provider="provider"
                                                  :is-valid.sync="isCredentialFormValid"
                                                  @change="handleChangeCredentialForm"
                />
            </p-pane-layout>
        </div>

        <div class="button-wrapper">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      :disabled="!isValid"
                      @click="handleSave"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.SAVE') }}
            </p-button>
            <p-button class="text-button" style-type="outline gray900" size="lg"
                      @click="handleGoBack"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CANCEL') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PButton, PLazyImg, PMarkdown, PPageTitle, PPaneLayout, PPanelTop,
} from '@spaceone/design-system';
import { get } from 'lodash';
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import InfoButton from '@/common/modules/portals/InfoButton.vue';

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
        PPageTitle,
        PButton,
        PPaneLayout,
        PPanelTop,
    },
    props: {
        provider: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            providerLoading: true,
            providerData: {} as ProviderModel,
            serviceAccountId: '',
            providerIcon: computed(() => store.state.reference.provider.items[state.providerData?.provider]?.icon),
            description: computed(() => get(state.providerData, 'metadata.view.layouts.help:service_account:create', undefined)),
            enableCredentialInput: computed<boolean>(() => {
                const secretTypes = get(state.providerData, 'capability.supported_schema', []);
                return secretTypes.length > 0;
            }),
            baseInformationSchema: computed(() => state.providerData.template?.service_account?.schema),
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
                if (!formState.isCredentialFormValid) return false;
                if (!formState.isProjectFormValid) return false;
                return true;
            }),
        });

        /* Api */
        const getProvider = async () => {
            state.providerLoading = true;
            try {
                state.providerData = await SpaceConnector.client.identity.provider.get({
                    provider: props.provider,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                state.providerData = {};
            } finally {
                state.providerLoading = false;
            }
        };

        const deleteServiceAccount = async () => {
            await SpaceConnector.client.identity.serviceAccount.delete({
                service_account_id: state.serviceAccountId,
            });
            state.serviceAccountId = '';
        };
        const createServiceAccount = async () => {
            const item: any = {
                provider: props.provider,
                name: formState.baseInformationForm.accountName,
                data: formState.baseInformationForm.customSchemaForm,
                tags: formState.baseInformationForm.tags,
                service_account_type: formState.accountType,
            };

            if (formState.projectForm.selectedProject) {
                item.project_id = formState.projectForm.selectedProject.id;
            }
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.create(item);
                state.serviceAccountId = res.service_account_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
            }
        };
        const createSecretWithForm = async () => {
            await SpaceConnector.client.secret.secret.create({
                name: formState.baseInformationForm.accountName + state.serviceAccountId,
                data: formState.credentialForm,
                schema: formState.credentialForm.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
                project_id: formState.projectForm.selectedProject?.id || null,
            });
        };
        const createSecretWithJson = async (jsonData) => {
            await SpaceConnector.client.secret.secret.create({
                name: formState.baseInformationForm.accountName + state.serviceAccountId,
                data: jsonData,
                schema: formState.credentialForm.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
                project_id: formState.projectForm.selectedProject?.id || null,
            });
        };
        const createSecret = async (): Promise<boolean> => {
            let isSucceed = false;
            try {
                if (formState.credentialForm.activeDataType === 'json') {
                    const json = JSON.parse(formState.credentialForm.credentialJson);
                    await createSecretWithJson(json);
                } else if (formState.credentialForm.activeDataType === 'input') await createSecretWithForm();

                showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_S_CREATE_ACCOUNT_TITLE'), '', vm);
                isSucceed = true;
            } catch (e) {
                isSucceed = false;
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                await deleteServiceAccount();
            }

            return isSucceed;
        };

        /* Event */
        const handleSave = async () => {
            if (!formState.isValid) {
                ErrorHandler.handleRequestError(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID'), i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                return;
            }

            await createServiceAccount();
            if (state.serviceAccountId && formState.credentialForm.hasCredentialKey && state.enableCredentialInput) {
                if (formState.credentialForm.customSchemaForm?.private_key) {
                    formState.credentialForm.customSchemaForm.private_key = formState.credentialForm.customSchemaForm.private_key.replace(/\\n/g, '\n');
                }
                const isSecretCreationSuccess = await createSecret();
                if (!isSecretCreationSuccess) return;
            }
            SpaceRouter.router.back();
        };
        const handleGoBack = () => {
            const nextPath = SpaceRouter.router.currentRoute.query.nextPath as string|undefined;
            if (nextPath) SpaceRouter.router.push(nextPath);
            else SpaceRouter.router.back();
        };
        const handleChangeAccountType = (accountType: AccountType) => {
            formState.accountType = accountType;
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
            await store.dispatch('reference/provider/load');
            await getProvider();
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
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
