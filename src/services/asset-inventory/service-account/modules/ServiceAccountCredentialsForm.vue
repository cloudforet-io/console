<template>
    <div class="service-account-credentials-form">
        <p-field-group v-if="serviceAccountType !== ACCOUNT_TYPE.TRUSTED"
                       :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: providerData.name })"
                       required
        >
            <div class="flex">
                <p-radio v-model="hasCredentialKey" :value="true" class="radio-text">
                    {{ $t('APP.MAIN.YES') }}
                </p-radio>
                <p-radio :selected="hasCredentialKey" :value="false" @change="handleSelectNoCredentials">
                    {{ $t('APP.MAIN.NO') }}
                </p-radio>
            </div>
        </p-field-group>
        <template v-if="hasCredentialKey">
            <p-field-group v-if="serviceAccountType !== ACCOUNT_TYPE.TRUSTED"
                           :label="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CREDENTIALS_LABEL')"
                           required
            >
                <div class="radio-wrapper">
                    <p-radio :selected="attachTrustedAccount" :value="false" class="radio-text"
                             @change="handleChangeAttachTrustedAccount"
                    >
                        {{ $t('APP.MAIN.NO') }}
                    </p-radio>
                    <p-radio :selected="attachTrustedAccount" :value="true" @change="handleChangeAttachTrustedAccount">
                        {{ $t('APP.MAIN.YES') }}<br>
                    </p-radio>
                    <p-select-dropdown v-model="attachedTrustedAccountId" :items="trustedAccountItems" :disabled="!attachTrustedAccount" />
                </div>
            </p-field-group>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SECRET_TYPE_LABEL')" required class="mb-8">
                <div class="flex">
                    <p-radio v-for="(type, idx) in secretTypes" :key="idx"
                             :selected="formData.selectedSecretType"
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
                    <p-json-schema-form :form-data.sync="customSchemaForm" :schema="credentialSchema"
                                        :language="$store.state.user.language"
                                        class="custom-schema-box"
                                        @validate="handleCredentialValidate"
                    />
                </template>
                <template #json>
                    <p-text-editor class="m-4" :code.sync="credentialJson" />
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
import { get } from 'lodash';

import type { SelectDropdownMenu } from '@spaceone/design-system/dist/src/inputs/dropdown/select-dropdown/type';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { SpaceConnector } from 'cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from 'cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import type {
    ActiveDataType, CredentialForm, ProviderModel, PageMode, AccountType,
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
            hasCredentialKey: true,
            attachTrustedAccount: false,
            trustedAccountItems: [] as SelectDropdownMenu[],
            attachedTrustedAccountId: undefined,
            secretTypes: computed(() => {
                if (props.serviceAccountType === 'GENERAL') {
                    if (state.attachTrustedAccount) {
                        return get(state.providerData, 'capability.general_service_account_schema', []);
                    }
                    return get(state.providerData, 'capability.supported_schema', []);
                }
                return get(state.providerData, 'capability.trusted_service_account_schema', []);
            }),
            selectedSecretType: '',
            customSchemaForm: {},
            credentialSchema: {},
            isCustomSchemaFormValid: false,
            credentialJson: '',
            formData: computed<CredentialForm>(() => ({
                hasCredentialKey: state.hasCredentialKey,
                selectedSecretType: state.selectedSecretType,
                customSchemaForm: state.customSchemaForm,
                credentialJson: state.credentialJson,
                activeDataType: tabState.activeTab as ActiveDataType,
                attachedTrustedAccountId: state.attachedTrustedAccountId,
            })),
            isAllValid: computed<boolean>(() => {
                if (!state.hasCredentialKey) return true;
                if (state.secretTypes.length) {
                    if (tabState.activeTab === 'input') return state.isCustomSchemaFormValid;
                    return !!state.credentialJson.length;
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
            state.hasCredentialKey = true;
            state.attachTrustedAccount = false;
            state.selectedSecretType = state.secretTypes[0];
            state.customSchemaForm = {};
            state.credentialJson = '';
            state.attachedTrustedAccountId = undefined;
            tabState.activeTab = 'input';
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
                state.selectedSecretType = selectedSecretType;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.providerData = {};
            }
        };
        const getCredentialSchema = async () => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: state.selectedSecretType,
                only: ['schema'],
            });
            state.credentialSchema = res.schema;
        };
        const apiQueryHelper = new ApiQueryHelper();
        const listTrustAccounts = async () => {
            try {
                const getQuery = () => apiQueryHelper
                    .setFilters([{ k: 'service_account_type', v: ACCOUNT_TYPE.TRUSTED, o: '=' }]);
                const { results } = await SpaceConnector.client.identity.serviceAccount.list({ query: getQuery().data });
                state.trustedAccountItems = results.map(d => ({
                    name: d.service_account_id,
                    label: d.name,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.trustedAccountItems = [];
            }
        };

        /* Event */
        const handleCredentialValidate = (isValid) => {
            state.isCustomSchemaFormValid = isValid;
        };
        const handleChangeSecretType = (val: string) => {
            if (state.selectedSecretType !== val) {
                initForm();
                state.selectedSecretType = val;
            }
        };
        const handleSelectNoCredentials = (val: boolean) => {
            if (state.hasCredentialKey !== val) {
                initForm();
                state.hasCredentialKey = val;
            }
        };
        const handleChangeAttachTrustedAccount = (val: boolean) => {
            if (state.attachTrustedAccount !== val) {
                initForm();
                state.attachTrustedAccount = val;
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
            if (secretTypes.length) state.selectedSecretType = secretTypes[0];
        });
        watch(() => state.selectedSecretType, (selectedSecretType) => {
            if (selectedSecretType) getCredentialSchema();
        });
        watch(() => props.serviceAccountType, () => {
            initForm();
        });
        watch(() => state.formData, (formData) => {
            emit('change', formData);
        });
        watch(() => state.isAllValid, (isAllValid) => {
            emit('update:isValid', isAllValid);
        });

        return {
            ...toRefs(state),
            tabState,
            ACCOUNT_TYPE,
            handleChangeSecretType,
            handleCredentialValidate,
            handleSelectNoCredentials,
            handleChangeAttachTrustedAccount,
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
        display: grid;
        gap: 0.5rem;
        .p-select-dropdown {
            width: calc(50% - 1.5rem);
            margin-left: 1.5rem;
        }
    }
    .custom-schema-box {
        padding: 2rem 2rem 0 2rem;
    }

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        .p-text-editor {
            .CodeMirror {
                font-family: Inconsolata, monospace;
                line-height: 1.5;
                height: 14.375rem;
                padding: 1rem;
                margin: 0 0 -2rem;
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
