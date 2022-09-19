<template>
    <div class="service-account-credentials-form">
        <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: providerData.name })"
                       required
        >
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
        </div>
    </div>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PFieldGroup, PRadio, PTab, PJsonSchemaForm, PTextEditor,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { get } from 'lodash';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, watch, toRefs,
} from 'vue';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { EDIT_MODE } from '@/services/asset-inventory/service-account/type';
import type {
    ActiveDataType, CredentialForm, ProviderModel,
    PageMode,
} from '@/services/asset-inventory/service-account/type';


interface Props {
    editMode: PageMode;
    provider?: string;
    isValid: boolean;
    originFormData: CredentialForm;
}

export default defineComponent<Props>({
    name: 'ServiceAccountCredentialsForm',
    components: {
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
            secretTypes: computed(() => get(state.providerData, 'capability.supported_schema', [])),
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
            const defaultCredentialForm = {};
            Object.keys(res.schema.properties).forEach((key) => {
                // Because p-json-schema-form is not able to perform exact validation, `undefined` is assigned.
                defaultCredentialForm[key] = undefined;
            });
            state.customSchemaForm = defaultCredentialForm;
        };

        /* Event */
        const handleCredentialValidate = (isValid) => {
            state.isCustomSchemaFormValid = isValid;
        };
        const handleChangeSecretType = (val: string) => {
            if (state.selectedSecretType !== val) {
                state.selectedSecretType = val;
            }
        };

        /* Watcher */
        watch(() => props.provider, async (provider) => {
            if (provider) {
                await getProviderData(provider);
            }
        }, { immediate: true });
        watch(() => state.selectedSecretType, (selectedSecretType) => {
            if (selectedSecretType) getCredentialSchema();
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
            EDIT_MODE,
            handleChangeSecretType,
            handleCredentialValidate,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-credentials-form {
    .radio-text {
        margin-right: 1.125rem;
    }
    .custom-schema-box {
        padding: 2rem 2rem 0 2rem;
    }
    .p-tab::v-deep {
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
        .p-tab::v-deep {
            .p-text-input {
                width: 100%;
            }
        }
    }
}
</style>
