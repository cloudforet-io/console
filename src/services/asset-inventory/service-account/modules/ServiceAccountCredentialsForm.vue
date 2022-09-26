<template>
    <div class="service-account-credentials-form">
        <p-field-group v-if="serviceAccountType !== ACCOUNT_TYPE.TRUSTED"
                       :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: providerData.name })"
                       required
        >
            <div class="flex">
                <p-radio v-model="formState.hasCredentialKey" :value="true" class="radio-text">
                    {{ $t('APP.MAIN.YES') }}
                </p-radio>
                <p-radio :selected="formState.hasCredentialKey" :value="false" @change="handleSelectNoCredentials">
                    {{ $t('APP.MAIN.NO') }}
                </p-radio>
            </div>
        </p-field-group>
        <template v-if="formState.hasCredentialKey">
            <p-field-group v-if="serviceAccountType !== ACCOUNT_TYPE.TRUSTED && TRUSTED_ACCOUNT_ALLOWED.some((d) => d === provider)"
                           :label="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CREDENTIALS_LABEL')"
                           required
            >
                <div class="radio-wrapper">
                    <p-radio :selected="formState.attachTrustedAccount" :value="false"
                             @change="handleChangeAttachTrustedAccount"
                    >
                        {{ $t('APP.MAIN.NO') }}
                    </p-radio>
                    <br>
                    <p-radio :selected="formState.attachTrustedAccount" :value="true" @change="handleChangeAttachTrustedAccount">
                        {{ $t('APP.MAIN.YES') }}<br>
                    </p-radio>
                    <p-select-dropdown :selected="formState.attachedTrustedAccountId"
                                       :items="trustedAccountMenuItems"
                                       :disabled="!formState.attachTrustedAccount"
                                       @select="handleChangeAttachedTrustedAccountId"
                    />
                </div>
            </p-field-group>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SECRET_TYPE_LABEL')" required class="mb-8">
                <div class="flex">
                    <p-radio v-for="(type, idx) in secretTypes" :key="idx"
                             :selected="formState.selectedSecretType"
                             :value="type"
                             class="radio-text"
                             @change="handleChangeSecretType"
                    >
                        {{ type }}
                    </p-radio>
                </div>
            </p-field-group>
            <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab" stretch>
                <template #input>
                    <p-json-schema-form :form-data.sync="formState.customSchemaForm"
                                        :schema="convertedCredentialSchema"
                                        :language="$store.state.user.language"
                                        class="custom-schema-box"
                                        @validate="handleCredentialValidate"
                    />
                </template>
                <template #json>
                    <p-field-group required
                                   class="json-form-wrapper"
                                   :invalid="!checkJsonStringAvailable(formState.credentialJson)"
                                   :invalid-text="$t('IDENTITY.SERVICE_ACCOUNT.ADD.JSON_INVALID')"
                    >
                        <p-text-editor :code.sync="formState.credentialJson" />
                    </p-field-group>
                </template>
            </p-tab>
        </template>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, watch, toRefs,
} from 'vue';

import {
    PFieldGroup, PRadio, PTab, PJsonSchemaForm, PTextEditor, PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenu } from '@spaceone/design-system/dist/src/inputs/dropdown/select-dropdown/type';
import type { JsonSchema } from '@spaceone/design-system/dist/src/inputs/forms/json-schema-form/type';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { cloneDeep, get, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_TYPE, TRUSTED_ACCOUNT_ALLOWED } from '@/services/asset-inventory/service-account/config';
import type {
    ActiveDataType, CredentialForm, ProviderModel, PageMode, AccountType,
    ServiceAccountModel,
} from '@/services/asset-inventory/service-account/type';


interface Props {
    editMode: PageMode;
    serviceAccountType: AccountType;
    provider?: string;
    isValid: boolean;
    originFormData: CredentialForm;
}

export default defineComponent<Props>({
    name: 'ServiceAccountCredentialsForm',
    components: {
        PSelectDropdown,
        PFieldGroup,
        PRadio,
        PTab,
        PJsonSchemaForm,
        PTextEditor,
    },
    props: {
        editMode: {
            type: String as PropType<PageMode>,
            default: 'CREATE',
        },
        serviceAccountType: {
            type: String as PropType<AccountType>,
            default: 'GENERAL',
        },
        provider: {
            type: String,
            default: undefined,
        },
        isValid: {
            type: Boolean,
            default: false,
        },
        originFormData: {
            type: Object as PropType<CredentialForm>,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            providerData: {} as ProviderModel,
            trustedAccounts: [] as ServiceAccountModel[],
            trustedAccountMenuItems: computed<SelectDropdownMenu[]>(() => state.trustedAccounts.map(d => ({
                name: d.service_account_id,
                label: d.name,
            }))),
            attachedTrustedAccountCredentialSchema: {} as JsonSchema,
            secretTypes: computed(() => {
                if (props.serviceAccountType === 'GENERAL') {
                    if (formState.attachTrustedAccount) {
                        return get(state.providerData, 'capability.general_service_account_schema', []);
                    }
                    return get(state.providerData, 'capability.supported_schema', []);
                }
                return get(state.providerData, 'capability.trusted_service_account_schema', []);
            }),
            credentialSchema: {} as JsonSchema,
            convertedCredentialSchema: computed<JsonSchema>(() => {
                if (props.serviceAccountType === ACCOUNT_TYPE.GENERAL
                    && formState.attachTrustedAccount
                    && !isEmpty(state.attachedTrustedAccountCredentialSchema)
                ) {
                    const trustedSchemaFields = Object.keys(state.attachedTrustedAccountCredentialSchema.properties);
                    const result = cloneDeep(state.credentialSchema);
                    trustedSchemaFields.forEach((f) => {
                        if (result.properties[f]) delete result.properties[f];
                    });
                    result.required = result.required?.filter(r => !trustedSchemaFields.includes(r));
                    return result;
                }
                return state.credentialSchema;
            }),
        });
        const formState = reactive({
            hasCredentialKey: true,
            selectedSecretType: '',
            customSchemaForm: {},
            credentialJson: '{}',
            attachTrustedAccount: false,
            attachedTrustedAccountId: undefined,
            formData: computed<CredentialForm>(() => ({
                hasCredentialKey: formState.hasCredentialKey,
                selectedSecretType: formState.selectedSecretType,
                customSchemaForm: formState.customSchemaForm,
                credentialJson: formState.credentialJson,
                activeDataType: tabState.activeTab as ActiveDataType,
                attachedTrustedAccountId: formState.attachedTrustedAccountId,
            })),
            isCustomSchemaFormValid: false,
            isAllValid: computed<boolean>(() => {
                if (!formState.hasCredentialKey) return true;
                if (formState.attachTrustedAccount && !formState.attachedTrustedAccountId) return false;
                if (state.secretTypes.length) {
                    if (tabState.activeTab === 'input') return formState.isCustomSchemaFormValid;
                    return checkJsonStringAvailable(formState.credentialJson);
                }
                return true;
            }),
        });
        const tabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_INPUT'), name: 'input', keepAlive: true },
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_JSON'), name: 'json', keepAlive: true },
            ]),
            activeTab: 'input',
        });

        /* Util */
        const initForm = () => {
            formState.hasCredentialKey = true;
            formState.attachTrustedAccount = false;
            formState.selectedSecretType = state.secretTypes[0];
            formState.customSchemaForm = {};
            formState.credentialJson = '{}';
            formState.attachedTrustedAccountId = undefined;
            formState.isCustomSchemaFormValid = false;
            state.attachedTrustedAccountCredentialSchema = {};
            tabState.activeTab = 'input';
        };
        const checkJsonStringAvailable = (str: string): boolean => {
            try {
                JSON.parse(str);
                return true;
            } catch (e) {
                return false;
            }
        };

        /* Api */
        const getProviderData = async (provider: string) => {
            try {
                const result = await SpaceConnector.client.identity.provider.get({
                    provider,
                });
                state.providerData = result;
                const supportedSchema = result?.capability?.supported_schema;
                let selectedSecretType = supportedSchema ? supportedSchema[0] : '';
                if (props.editMode === 'UPDATE' && props.originFormData.selectedSecretType) {
                    selectedSecretType = props.originFormData.selectedSecretType;
                }
                formState.selectedSecretType = selectedSecretType;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.providerData = {};
            }
        };
        const getCredentialSchema = async (selectedSecretType: string) => {
            try {
                const res = await SpaceConnector.client.repository.schema.get({
                    name: selectedSecretType,
                    only: ['schema'],
                });
                return res.schema;
            } catch (e) {
                ErrorHandler.handleError(e);
                return {};
            }
        };
        const apiQueryHelper = new ApiQueryHelper();
        const listTrustAccounts = async () => {
            try {
                const getQuery = () => apiQueryHelper
                    .setFilters([{ k: 'service_account_type', v: ACCOUNT_TYPE.TRUSTED, o: '=' }]);
                const { results } = await SpaceConnector.client.identity.serviceAccount.list({ query: getQuery().data });
                state.trustedAccounts = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.trustedAccounts = [];
            }
        };
        const getTrustedAccountCredentialSchema = async (serviceAccountId: string) => {
            try {
                const getQuery = () => apiQueryHelper
                    .setFilters([{ k: 'service_account_id', v: serviceAccountId, o: '=' }]);
                const { results } = await SpaceConnector.client.secret.trustedSecret.list({ query: getQuery().data });
                if (results.length) {
                    const secretType = results[0].schema;
                    state.attachedTrustedAccountCredentialSchema = await getCredentialSchema(secretType);
                } else {
                    state.attachedTrustedAccountCredentialSchema = {};
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.attachedTrustedAccountCredentialSchema = {};
            }
        };

        /* Event */
        const handleCredentialValidate = (isValid) => {
            formState.isCustomSchemaFormValid = isValid;
        };
        const handleChangeSecretType = (val: string) => {
            if (formState.selectedSecretType !== val) {
                initForm();
                formState.selectedSecretType = val;
            }
        };
        const handleSelectNoCredentials = (val: boolean) => {
            if (formState.hasCredentialKey !== val) {
                initForm();
                formState.hasCredentialKey = val;
            }
        };
        const handleChangeAttachTrustedAccount = (val: boolean) => {
            if (formState.attachTrustedAccount !== val) {
                initForm();
                formState.attachTrustedAccount = val;
                if (val) formState.attachedTrustedAccountId = state.trustedAccounts?.[0]?.service_account_id;
            }
        };
        const handleChangeAttachedTrustedAccountId = (val?: string) => {
            if (formState.attachedTrustedAccountId !== val) {
                formState.attachedTrustedAccountId = val;
            }
        };

        /* Init */
        (async () => {
            await listTrustAccounts();
        })();

        /* Watcher */
        watch(() => props.provider, (provider) => {
            if (provider) getProviderData(provider);
        }, { immediate: true });
        watch(() => state.secretTypes, (secretTypes) => {
            if (secretTypes.length) formState.selectedSecretType = secretTypes[0];
        });
        watch(() => formState.selectedSecretType, async (selectedSecretType) => {
            if (selectedSecretType) {
                state.credentialSchema = await getCredentialSchema(selectedSecretType);
            }
        });
        watch(() => formState.attachedTrustedAccountId, (attachedTrustedAccountId) => {
            getTrustedAccountCredentialSchema(attachedTrustedAccountId);
        });
        watch(() => props.serviceAccountType, () => {
            initForm();
        });
        watch(() => formState.formData, (formData) => {
            emit('change', formData);
        });
        watch(() => formState.isAllValid, (isAllValid) => {
            emit('update:isValid', isAllValid);
        });

        return {
            ...toRefs(state),
            formState,
            tabState,
            ACCOUNT_TYPE,
            TRUSTED_ACCOUNT_ALLOWED,
            handleChangeSecretType,
            handleCredentialValidate,
            handleSelectNoCredentials,
            handleChangeAttachTrustedAccount,
            handleChangeAttachedTrustedAccountId,
            checkJsonStringAvailable,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-credentials-form {
    .radio-text {
        margin-right: 1.125rem;
    }
    .radio-wrapper {
        .p-radio {
            line-height: 1.5;
        }
        .p-select-dropdown {
            width: calc(50% - 1.5rem);
            margin-left: 1.5rem;
            margin-top: 0.25rem;
        }
    }
    .custom-schema-box {
        padding: 2rem 2rem 0 2rem;
    }

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        .json-form-wrapper {
            margin: 1rem;
        }
        .p-text-editor {
            .CodeMirror {
                font-family: Inconsolata, monospace;
                line-height: 1.5;
                height: 14.375rem;
                padding: 1rem;
            }
        }
        .p-text-input {
            width: 66%;
            .input-container {
                width: 100%;
            }
        }
    }

    @screen tablet {
        /* custom design-system component - p-tab */
        :deep(.p-tab) {
            .p-text-input {
                width: 100%;
            }
        }
    }
}
</style>
