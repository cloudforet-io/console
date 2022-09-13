<template>
    <p-pane-layout class="service-account-credentials">
        <div class="title">
            {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS') }}
        </div>
        <template v-if="mode === 'CREATE' || 'UPDATE'">
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: providerData.name })" required>
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
        </template>
    </p-pane-layout>
</template>

<script lang="ts">

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PPaneLayout, PFieldGroup, PRadio, PTab, PJsonSchemaForm, PTextEditor,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { get } from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { PropType } from 'vue';

import { i18n } from '@/translations';

import type { ActiveDataType, CredentialForm, PageMode } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'ServiceAccountCredentials',
    components: {
        PPaneLayout,
        PFieldGroup,
        PRadio,
        PTab,
        PJsonSchemaForm,
        PTextEditor,
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
        // serviceAccountId: {
        //     type: String,
        //     default: '',
        // },
    },
    setup(props, { emit }) {
        const state = reactive({
            hasCredentialKey: true,
            secretTypes: computed(() => get(props.providerData, 'capability.supported_schema', [])),
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
            isAllValid: computed(() => {
                if (!state.hasCredentialKey) return true;
                if (state.secretTypes.length) {
                    if (tabState.activeTab === 'input') return state.isCustomSchemaFormValid;
                    return !!state.credentialJson.length;
                }
                return true;
            }),
            // timezone: computed(() => store.state.user.timezone),
            // fields: [
            //     { label: 'Secret', name: 'secret_id' },
            //     { label: 'Name', name: 'name' },
            //     { label: 'Schema', name: 'schema' },
            //     {
            //         label: 'Created',
            //         name: 'created_at',
            //         type: 'datetime',
            //         options: {
            //             source_type: 'timestamp',
            //             source_format: 'seconds',
            //         },
            //     },
            // ],
            // items: [],
            // loading: true,
            // options: {
            //     sortBy: 'secret_id',
            //     sortDesc: true,
            //     pageStart: 1,
            //     pageLimit: 15,
            //     searchText: '',
            // },
        });

        const tabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_INPUT'), name: 'input', keepAlive: true },
                { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_JSON'), name: 'json', keepAlive: true },
            ]),
            activeTab: 'input',
        });

        // const apiQuery = new ApiQueryHelper();
        // const getQuery = () => apiQuery.setFilters([{
        //     k: 'service_account_id',
        //     v: props.serviceAccountId,
        //     o: '=',
        // }, { v: state.options.searchText }])
        //     .setSort(state.options.sortBy, state.options.sortDesc)
        //     .setPage(
        //         state.options.pageStart,
        //         state.options.pageLimit,
        //     )
        //     .setOnly('secret_id', 'name', 'schema', 'created_at')
        //     .data;
        //
        // const api = SpaceConnector.client.secret.secret.list;
        //
        // const listCredentials = async () => {
        //     state.loading = true;
        //     try {
        //         const res = await api({ query: getQuery() });
        //         state.items = res.results;
        //     } catch (e) {
        //         ErrorHandler.handleError(e);
        //         state.items = [];
        //     } finally {
        //         state.loading = false;
        //     }
        // };

        // watch(() => props.serviceAccountId, (after, before) => {
        //     if (after !== before) listCredentials();
        // }, { immediate: true });

        /* Api */
        const getCredentialSchema = async (selectedSecretType) => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: selectedSecretType,
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

        watch(() => props.providerData, (providerData) => {
            const supportedSchema = providerData?.capability?.supported_schema;
            state.selectedSecretType = supportedSchema ? supportedSchema[0] : '';
        }, { immediate: true });
        watch(() => state.selectedSecretType, async (after, before) => {
            if (after && after !== before) {
                await getCredentialSchema(after);
            }
        }, { immediate: true });
        watch(() => state.formData, (formData) => {
            emit('change', formData);
        });
        watch(() => state.isAllValid, (isAllValid) => {
            emit('update:isValid', isAllValid);
        });

        return {
            ...toRefs(state),
            tabState,
            handleCredentialValidate,
        };
    },
};
</script>

<style lang="postcss">
.service-account-credentials {
    padding: 2rem 1rem;
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
</style>
