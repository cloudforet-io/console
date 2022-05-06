<template>
    <div>
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
                             class="flex-shrink-0"
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

        <p-pane-layout>
            <div class="title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_TITLE') }}
            </div>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_LABEL')"
                           :invalid-text="accountNameInvalidText"
                           :invalid="accountName && !isAccountNameValid"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="accountName"
                                  class="account-name-input block"
                                  :invalid="invalid"
                                  :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_NAME_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
            <p-json-schema-form v-if="accountSchema" :model.sync="accountModel" :schema="accountSchema"
                                :is-valid.sync="isAccountModelValid"
            />
            <div class="tag-title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_LABEL') }}
            </div>
            <div class="tag-help-msg">
                <i18n path="IDENTITY.SERVICE_ACCOUNT.ADD.TAG_DESC_1">
                    <template #name>
                        <span v-if="accountName" class="font-bold">[{{ accountName }}]</span>
                        <span v-else>{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.ACCOUNT') }}</span>
                    </template>
                </i18n>
                <br>
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_DESC_2') }}
            </div>
            <tags-input-group :tags.sync="tags"
                              :show-validation="true"
                              :is-valid.sync="isTagsValid"
            >
                <template #addButton="scope">
                    <p-button :outline="true" style-type="primary" :disabled="scope.disabled"
                              icon="ic_plus_bold"
                              class="mb-2"
                              @click="scope.addPair($event)"
                    >
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_ADD') }}
                    </p-button>
                </template>
            </tags-input-group>
        </p-pane-layout>

        <project-tree-panel class="tree-panel"
                            :target-name="accountName"
                            @select="handleSelectedProject"
        />

        <p-pane-layout v-if="enableCredentialInput">
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
                        <p-json-schema-form :model.sync="credentialModel" :schema="credentialSchema" :is-valid.sync="isCredentialModelValid"
                                            class="custom-schema-box"
                        />
                    </template>
                    <template #json>
                        <p-text-editor class="m-4" :code.sync="jsonForCredential" mode="edit" />
                    </template>
                </p-tab>
            </div>
        </p-pane-layout>

        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      :disabled="!isValid || !isTagsValid"
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
import { get } from 'lodash';

import {
    reactive, computed, toRefs, watch,
} from '@vue/composition-api';

import {
    PPageTitle, PJsonSchemaForm, PTab, PFieldGroup, PLazyImg,
    PPaneLayout, PButton, PRadio, PMarkdown, PTextEditor, PTextInput,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import ProjectTreePanel from '@/services/asset-inventory/service-account/service-account-add/modules/ProjectTreePanel.vue';
import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ProjectGroup, ProviderModel } from '@/services/asset-inventory/service-account/type';
import { TranslateResult } from 'vue-i18n';
import InfoButton from '@/common/modules/portals/InfoButton.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';


export default {
    name: 'AddServiceAccountPage',
    components: {
        InfoButton,
        PLazyImg,
        PTab,
        PTextInput,
        PJsonSchemaForm,
        PTextEditor,
        PMarkdown,
        PPageTitle,
        PFieldGroup,
        PPaneLayout,
        PButton,
        PRadio,
        TagsInputGroup,
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
            serviceAccountNames: [] as string[],
            credentialNames: [] as string[],
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
            /* static input */
            accountName: undefined as undefined | string,
            accountNameInvalidText: computed(() => {
                let invalidText: TranslateResult = '';
                if (typeof formState.accountName === 'string') {
                    if (formState.accountName.length < 2) {
                        invalidText = i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
                    } else if (state.serviceAccountNames.includes(formState.accountName)) {
                        invalidText = i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
                    }
                }
                return invalidText;
            }),
            isAccountNameValid: computed(() => {
                if (formState.accountName) {
                    return !(formState.accountName.length < 2 || state.serviceAccountNames.includes(formState.accountName));
                }
                return false;
            }),
            //
            tags: {},
            isTagsValid: true,
            //
            /* schema input */
            accountModel: {},
            accountSchema: null as any|null,
            isAccountModelValid: false,
            //
            credentialModel: {},
            credentialSchema: {},
            isCredentialModelValid: false,
            //
            jsonForCredential: '',
            //
            selectedProject: null as ProjectGroup|null,
            //
            isValid: computed(() => {
                const isAccountModelValid = formState.accountSchema ? formState.isAccountModelValid : true;
                if (tabState.activeTab === 'json' && state.hasCredentialKey) return formState.isAccountNameValid && isAccountModelValid && formState.jsonForCredential;
                if (state.hasCredentialKey && state.enableCredentialInput) return formState.isAccountNameValid && isAccountModelValid && formState.isCredentialModelValid;
                return formState.isAccountNameValid && isAccountModelValid;
            }),
        });

        const getProvider = async () => {
            state.providerLoading = true;
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, res] = await Promise.all([
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
        const getCredentialNames = async () => {
            const res = await SpaceConnector.client.secret.secret.list({
                only: 'name',
            });
            state.credentialNames = res.results.map(v => v.name);
        };
        const getServiceAccountNames = async () => {
            const res = await SpaceConnector.client.identity.serviceAccount.list({
                only: 'name',
            });
            state.serviceAccountNames = res.results.map(v => v.name);
        };
        const getServiceAccountSchema = async () => {
            formState.accountSchema = state.providerObj.template?.service_account?.schema ?? null;
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
            formState.credentialModel = defaultCredentialModal;
        };

        const deleteServiceAccount = async () => {
            await SpaceConnector.client.identity.serviceAccount.delete({
                service_account_id: state.serviceAccountId,
            });
            state.serviceAccountId = '';
        };
        const createServiceAccount = async () => {
            const item: any = {
                name: formState.accountName,
                provider: props.provider,
                data: formState.accountModel,
                tags: formState.tags,
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
                name: formState.accountName + state.serviceAccountId,
                data: formState.credentialModel,
                schema: state.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
                project_id: formState.selectedProject?.id || null,
            });
        };
        const createSecretWithJson = async (jsonData) => {
            await SpaceConnector.client.secret.secret.create({
                name: formState.accountName + state.serviceAccountId,
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

        const handleSave = async () => {
            if (!formState.isValid) {
                ErrorHandler.handleRequestError(i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID'), i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'));
                return;
            }
            if (!formState.isTagsValid) return;

            await createServiceAccount();
            if (state.serviceAccountId && state.hasCredentialKey && state.enableCredentialInput) {
                if (formState.credentialModel.private_key) formState.credentialModel.private_key = formState.credentialModel.private_key.replace(/\\n/g, '\n');
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

        watch(() => state.selectedSecretType, async (after, before) => {
            if (after && after !== before) {
                await getCredentialSchema(after);
            }
        }, { immediate: true });

        const init = async () => {
            await getProvider();
            await getServiceAccountNames();
            await getCredentialNames();
            //
            await getServiceAccountSchema();
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            tabState,
            handleSave,
            handleGoBack,
            handleSelectedProject,
        };
    },
};
</script>


<style lang="postcss" scoped>
.info-button {
    line-height: 2rem;
}
.p-pane-layout::v-deep {
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
    .tag-title {
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 120%;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }
    .tag-help-msg {
        font-size: 0.875rem;
        line-height: 150%;
        margin-bottom: 1.5rem;
    }
    .account-name-input {
        @screen lg {
            max-width: 50%;
        }
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
