<template>
    <p-pane-layout class="service-account-credentials">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')">
            <template v-if="mode === 'READ'" #extra>
                <p-button icon="ic_edit">
                    <!--song-lang-->
                    Edit
                </p-button>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <template v-if="mode === 'READ'">
                <p-dynamic-layout v-if="readState.detailSchema"
                                  v-bind="readState.detailSchema"
                                  :type-options="{
                                      loading: readState.loading
                                  }"
                                  :data="readState.item"
                                  :field-handler="fieldHandler"
                />
            </template>
            <template v-if="EDIT_MODE.includes(mode)">
                <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: providerData.name })" required>
                    <div class="flex">
                        <p-radio v-model="formState.hasCredentialKey" :value="true" class="radio-text">
                            {{ $t('APP.MAIN.YES') }}
                        </p-radio>
                        <p-radio v-model="formState.hasCredentialKey" :value="false">
                            {{ $t('APP.MAIN.NO') }}
                        </p-radio>
                    </div>
                </p-field-group>
                <div v-if="formState.hasCredentialKey">
                    <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SECRET_TYPE_LABEL')" required>
                        <div class="flex">
                            <p-radio v-for="(type, idx) in formState.secretTypes" :key="idx" v-model="formState.selectedSecretType"
                                     class="radio-text" :value="type"
                            >
                                {{ type }}
                            </p-radio>
                        </div>
                    </p-field-group>
                    <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab" stretch>
                        <template #input>
                            <p-json-schema-form :form-data.sync="formState.customSchemaForm" :schema="formState.credentialSchema"
                                                :language="$store.state.user.language"
                                                class="custom-schema-box"
                                                @validate="handleCredentialValidate"
                            />
                        </template>
                        <template #json>
                            <p-text-editor class="m-4" :code.sync="formState.credentialJson" />
                        </template>
                    </p-tab>
                </div>
            </template>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PPaneLayout, PFieldGroup, PRadio, PTab, PJsonSchemaForm, PTextEditor, PDynamicLayout, PPanelTop, PButton,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { get } from 'lodash';
import {
    computed, defineComponent, reactive, watch,
} from 'vue';
import type { PropType } from 'vue';

import type { ItemOptions } from '@/component-util/dynamic-layout/layout-schema';
import { i18n } from '@/translations';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    ActiveDataType, CredentialForm, PageMode, ProviderModel,
} from '@/services/asset-inventory/service-account/type';
import { EDIT_MODE } from '@/services/asset-inventory/service-account/type';


interface Props {
    mode: PageMode;
    providerData?: ProviderModel;
    isValid: boolean;
    serviceAccountId?: string;
}

interface CredentialModel {
    schema?: string;
    provider?: string;
    secret_type?: string;
    [key: string]: string | undefined;
}

export default defineComponent<Props>({
    name: 'ServiceAccountCredentials',
    components: {
        PPaneLayout,
        PPanelTop,
        PFieldGroup,
        PRadio,
        PTab,
        PJsonSchemaForm,
        PTextEditor,
        PDynamicLayout,
        PButton,
    },
    props: {
        mode: {
            type: String as PropType<PageMode>,
            default: 'READ',
        },
        providerData: {
            type: Object,
            default: () => ({}),
        },
        isValid: {
            type: Boolean,
            default: false,
        },
        serviceAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const formState = reactive({
            hasCredentialKey: true,
            secretTypes: computed(() => get(props.providerData, 'capability.supported_schema', [])),
            selectedSecretType: '',
            customSchemaForm: {},
            credentialSchema: {},
            isCustomSchemaFormValid: false,
            credentialJson: '',
            formData: computed<CredentialForm>(() => ({
                hasCredentialKey: formState.hasCredentialKey,
                selectedSecretType: formState.selectedSecretType,
                customSchemaForm: formState.customSchemaForm,
                credentialJson: formState.credentialJson,
                activeDataType: tabState.activeTab as ActiveDataType,
            })),
            isAllValid: computed<boolean>(() => {
                if (!formState.hasCredentialKey) return true;
                if (formState.secretTypes.length) {
                    if (tabState.activeTab === 'input') return formState.isCustomSchemaFormValid;
                    return !!formState.credentialJson.length;
                }
                return true;
            }),
        });
        const readState = reactive({
            loading: true,
            detailSchema: computed(() => {
                const fields = Object.entries(formState.credentialSchema?.properties ?? {}).map(([k, v]) => ({
                    key: k,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    name: v?.title ?? k,
                }));
                return {
                    name: 'Credentials',
                    type: 'item',
                    options: {
                        fields: [
                            { key: 'schema', name: 'Secret Type' },
                            ...fields,
                        ],
                        translation_id: 'IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS',
                    } as ItemOptions,
                };
            }),
            item: {} as CredentialModel,
            fieldHandler: [],
        });
        const tabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_INPUT'), name: 'input', keepAlive: true },
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_JSON'), name: 'json', keepAlive: true },
            ]),
            activeTab: 'input',
        });

        /* Util */
        const fieldHandler = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /* Api */
        const apiQuery = new ApiQueryHelper();
        const listCredentials = async (serviceAccountId: string) => {
            try {
                readState.loading = true;

                const getQuery = () => apiQuery
                    .setFilters([{ k: 'service_account_id', v: serviceAccountId, o: '=' }]);
                const { results } = await SpaceConnector.client.secret.secret.list({ query: getQuery().data });
                if (results.length) readState.item = results[0];
            } catch (e) {
                ErrorHandler.handleError(e);
                readState.item = {};
            } finally {
                readState.loading = false;
            }
        };
        const getCredentialSchema = async (selectedSecretType) => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: selectedSecretType,
                only: ['schema'],
            });
            formState.credentialSchema = res.schema;
            const defaultCredentialForm = {};
            Object.keys(res.schema.properties).forEach((key) => {
                // Because p-json-schema-form is not able to perform exact validation, `undefined` is assigned.
                defaultCredentialForm[key] = undefined;
            });
            formState.customSchemaForm = defaultCredentialForm;
        };

        /* Event */
        const handleCredentialValidate = (isValid) => {
            formState.isCustomSchemaFormValid = isValid;
        };

        /* Watcher */
        // CREATE || UPDATE
        watch(() => props.providerData, (providerData) => {
            const supportedSchema = providerData?.capability?.supported_schema;
            formState.selectedSecretType = supportedSchema ? supportedSchema[0] : '';
        }, { immediate: true });
        watch(() => formState.selectedSecretType, async (after, before) => {
            if (after && after !== before) {
                await getCredentialSchema(after);
            }
        }, { immediate: true });
        watch(() => formState.formData, (formData) => {
            emit('change', formData);
        });
        watch(() => formState.isAllValid, (isAllValid) => {
            emit('update:isValid', isAllValid);
        });
        // READ
        watch(() => props.serviceAccountId, async (serviceAccountId) => {
            if (serviceAccountId) {
                await listCredentials(serviceAccountId);
                await getCredentialSchema(readState.item.schema);
            }
        }, { immediate: true });

        return {
            formState,
            readState,
            tabState,
            EDIT_MODE,
            fieldHandler,
            handleCredentialValidate,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-credentials {
    .p-panel-top::v-deep {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper::v-deep {
        padding: 0.5rem 1rem 2.5rem 1rem;
        .p-panel-top {
            display: none;
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
</style>
