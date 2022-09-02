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

        <service-account-base-information mode="EDIT"
                                          :provider-data="providerObj"
                                          :is-valid.sync="isBaseInformationValid"
                                          @change="handleChangeBaseInformation"
        />
        <project-tree-panel class="tree-panel"
                            @select="handleSelectedProject"
        />

        <p-pane-layout v-if="enableCredentialInput" class="form-wrapper">
            <div class="title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIALS_TITLE') }}
            </div>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: providerObj.name })" required>
                <div class="flex">
                    <p-radio v-model="hasCredentialKey" :value="true" class="radio-text">
                        {{ $t('APP.MAIN.YES') }}
                    </p-radio>
                    <p-radio v-model="hasCredentialKey" :value="false">
                        {{ $t('APP.MAIN.NO') }}
                    </p-radio>
                </div>
            </p-field-group>
            <div v-if="hasCredentialKey">
                <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SECRET_TYPE_LABEL')" required>
                    <div class="flex">
                        <p-radio v-for="(type, idx) in secretTypes" :key="idx" v-model="selectedSecretType"
                                 class="radio-text" :value="type"
                        >
                            {{ type }}
                        </p-radio>
                    </div>
                </p-field-group>
                <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab" stretch>
                    <template #input>
                        <p-json-schema-form :form-data.sync="credentialForm" :schema="credentialSchema"
                                            :language="$store.state.user.language"
                                            class="custom-schema-box"
                                            @validate="handleCredentialValidate"
                        />
                    </template>
                    <template #json>
                        <p-text-editor class="m-4" :code.sync="jsonForCredential" />
                    </template>
                </p-tab>
            </div>
        </p-pane-layout>

        <div class="button-group">
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

import {
    reactive, computed, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PPageTitle, PJsonSchemaForm, PTab, PFieldGroup, PLazyImg,
    PPaneLayout, PButton, PRadio, PMarkdown, PTextEditor,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { get } from 'lodash';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import InfoButton from '@/common/modules/portals/InfoButton.vue';

import ServiceAccountBaseInformation
    from '@/services/asset-inventory/service-account/modules/ServiceAccountBaseInformation.vue';
import ProjectTreePanel from '@/services/asset-inventory/service-account/service-account-add/modules/ProjectTreePanel.vue';
import type { BaseInformationData, ProjectGroup, ProviderModel } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'AddServiceAccountPage',
    components: {
        ServiceAccountBaseInformation,
        InfoButton,
        PLazyImg,
        PTab,
        PJsonSchemaForm,
        PTextEditor,
        PMarkdown,
        PPageTitle,
        PFieldGroup,
        PPaneLayout,
        PButton,
        PRadio,
        ProjectTreePanel,
    },
    props: {
        provider: {
            type: String,
            default: null,
        },
    },
    setup(props, { root }) {
        const state = reactive({
            providerLoading: true,
            providerObj: {} as ProviderModel,
            serviceAccountId: '',
            providerIcon: computed(() => store.state.reference.provider.items[state.providerObj?.provider]?.icon),
            description: computed(() => get(state.providerObj, 'metadata.view.layouts.help:service_account:create', undefined)),
            selectedSecretType: '',
            hasCredentialKey: true,
            secretTypes: computed<any[]>(() => get(state.providerObj, 'capability.supported_schema', [])),
            enableCredentialInput: computed<boolean>(() => state.secretTypes.length > 0),
        });

        const tabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_INPUT'), name: 'input', keepAlive: true },
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_JSON'), name: 'json', keepAlive: true },
            ]),
            activeTab: 'input',
        });

        const formState = reactive({
            baseInformationForm: {} as BaseInformationData,
            isBaseInformationValid: false,
            //
            credentialForm: {},
            credentialSchema: {},
            isCredentialFormValid: false,
            //
            jsonForCredential: '',
            //
            selectedProject: null as ProjectGroup|null,
            //
            isValid: computed(() => {
                if (!formState.isBaseInformationValid) return false;
                if (tabState.activeTab === 'json' && state.hasCredentialKey) return formState.jsonForCredential;
                if (state.hasCredentialKey && state.enableCredentialInput) return formState.isCredentialFormValid;
                return true;
            }),
        });

        const getProvider = async () => {
            state.providerLoading = true;
            try {
                const [, res] = await Promise.all([
                    store.dispatch('reference/provider/load'),
                    await SpaceConnector.client.identity.provider.get({
                        provider: props.provider,
                    }),
                ]);
                state.providerObj = res;
                const supportedSchema: any = res.capability.supported_schema;
                state.selectedSecretType = supportedSchema ? supportedSchema[0] : '';
            } catch (e) {
                ErrorHandler.handleError(e);
                state.providerObj = {};
                state.selectedSecretType = '';
            } finally {
                state.providerLoading = false;
            }
        };
        const getCredentialSchema = async (selectedSecretType) => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: selectedSecretType,
                only: ['schema'],
            });
            formState.credentialSchema = res.schema;
            const defaultCredentialModal = {};
            // The p-json-schema-form failed to achieve accurate validation, so I entered 'undefined' for comparison.
            Object.keys(res.schema.properties).forEach((key) => {
                defaultCredentialModal[key] = undefined;
            });
            formState.credentialForm = defaultCredentialModal;
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
            };

            if (formState.selectedProject) {
                item.project_id = formState.selectedProject.id;
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
                schema: state.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
                project_id: formState.selectedProject?.id || null,
            });
        };
        const createSecretWithJson = async (jsonData) => {
            await SpaceConnector.client.secret.secret.create({
                name: formState.baseInformationForm.accountName + state.serviceAccountId,
                data: jsonData,
                schema: state.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
                project_id: formState.selectedProject?.id || null,
            });
        };
        const createSecret = async (): Promise<boolean> => {
            let isSucceed = false;
            try {
                if (tabState.activeTab === 'json') {
                    const json = JSON.parse(formState.jsonForCredential);
                    await createSecretWithJson(json);
                } else if (tabState.activeTab === 'input') await createSecretWithForm();

                showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_S_CREATE_ACCOUNT_TITLE'), '', root);
                isSucceed = true;
            } catch (e) {
                isSucceed = false;
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                await deleteServiceAccount();
            }

            return isSucceed;
        };

        const handleCredentialValidate = (isValid) => {
            formState.isCredentialFormValid = isValid;
        };
        const handleSave = async () => {
            if (!formState.isValid) {
                ErrorHandler.handleRequestError(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID'), i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                return;
            }

            await createServiceAccount();
            if (state.serviceAccountId && state.hasCredentialKey && state.enableCredentialInput) {
                if (formState.credentialForm.private_key) formState.credentialForm.private_key = formState.credentialForm.private_key.replace(/\\n/g, '\n');
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
        const handleSelectedProject = (selectedProject) => { formState.selectedProject = selectedProject; };
        const handleUpdateTags = (tags: Tag) => {
            formState.baseInformationForm.tags = tags;
        };
        const handleChangeBaseInformation = (baseInformationForm) => {
            formState.baseInformationForm = baseInformationForm;
        };

        watch(() => state.selectedSecretType, async (after, before) => {
            if (after && after !== before) {
                await getCredentialSchema(after);
            }
        }, { immediate: true });

        const init = async () => {
            await getProvider();
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            tabState,
            handleCredentialValidate,
            handleSave,
            handleGoBack,
            handleSelectedProject,
            handleUpdateTags,
            handleChangeBaseInformation,
        };
    },
};
</script>


<style lang="postcss" scoped>
.info-button {
    flex-shrink: 0;
    line-height: 2rem;
}
.form-wrapper {
    width: 100%;
    padding: 2rem 1rem;
    margin-bottom: 1rem;
    &:nth-last-child(1) {
        @apply mb-0;
    }
    .title {
        font-size: 1.5rem;
        line-height: 120%;
        margin-bottom: 2rem;
    }
    .radio-text {
        margin-right: 1.125rem;
    }
    .custom-schema-box {
        padding: 2rem 2rem 0 2rem;
    }
    .p-text-editor {
        .CodeMirror {
            font-family: Inconsolata, monospace;
            line-height: 1.5;
            height: 14.375rem;
            padding: 1rem;
            margin: 0 0 -2rem;
        }
    }
}

.tree-panel {
    width: 100%;
    padding: 2rem 1rem;
    margin-bottom: 1rem;
    &:nth-last-child(1) {
        margin-bottom: 0;
    }
}

.button-group {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 1rem;
    .text-button {
        margin-left: 1rem;
    }
}
</style>
