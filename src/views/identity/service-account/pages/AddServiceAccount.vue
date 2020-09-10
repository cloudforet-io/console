<template>
    <general-page-layout class="add-service-account-container">
        <div class="page-navigation">
            <p-page-navigation :routes="route" />
        </div>
        <p-page-title
            class="mb-6"
            title="Add Service Account"
            child
            @goBack="onClickGoBack"
        >
            <template #before-title>
                <div class="icon">
                    <img v-if="providerIcon"
                         width="32px" height="32px"
                         :src="providerIcon" :alt="provider"
                    >
                    <p-i v-else name="ic_provider_other"
                         width="32px" height="32px"
                    />
                </div>
            </template>
        </p-page-title>
        <p-collapsible-panel v-if="description">
            <template #content>
                <p-markdown
                    :markdown="description.options.markdown"
                    :data="description.options.markdown"
                />
            </template>
        </p-collapsible-panel>

        <p-pane-layout>
            <div class="title">
                Base Information
            </div>
            <p-dynamic-form :schema="accountBasicSchema" :model="accountBasicModel" :options="inputOptions"
                            :is-valid.sync="isAccountBasicValid" :validation-mode="validationMode"
            />
            <p-dynamic-form :schema="accountCustomSchema" :model="accountCustomModel" :options="inputOptions"
                            :is-valid.sync="isAccountCustomValid" :validation-mode="validationMode"
            />
            <div class="tag-title">
                {{ $t('PANEL.TAG') }}
            </div>
            <div class="tag-help-msg">
                <i18n path="ACTION.DICT.ADD_TAG_BY">
                    <template #name>
                        <span v-if="accountBasicModel.name" class="font-bold">[{{ accountBasicModel.name }}]</span>
                        <span v-else> Account</span>
                    </template>
                </i18n>
                <br>
                {{ $t('ACTION.DICT.HELPMSG') }}
            </div>
            <p-dict-input-group
                v-bind="tagsTS.state"
                :items.sync="tagsTS.syncState.items"
                :show-header="true"
                v-on="tagsTS.events"
            >
                <template #addButton="scope">
                    <p-icon-text-button
                        outline style-type="primary" :disabled="scope.disabled"
                        name="ic_plus_bold"
                        @click="scope.addPair($event)"
                    >
                        {{ $t('BTN.ADD_TAG') }}
                    </p-icon-text-button>
                </template>
            </p-dict-input-group>
        </p-pane-layout>

        <p-pane-layout>
            <div class="title">
                Credentials
            </div>
            <p-select-btn-group :buttons="credentialInputOptionButton" :selected.sync="selectedCredentialInputOption" class="pt-20 float-right" />
            <p-dynamic-form :schema="credentialBasicSchema" :model="credentialBasicModel" :options="inputOptions"
                            :is-valid.sync="isCredentialBasicValid" :validation-mode="validationMode"
            />

            <p-field-group label="Secret Type" required>
                <div class="flex">
                    <span v-for="(type, idx) in secretTypes" :key="idx" class="secret-type-text">
                        <p-radio v-model="selectedSecretType" :value="type" />
                        {{ type }}
                    </span>
                </div>
            </p-field-group>
            <div v-if="selectedCredentialInputOption === 'Input Form'" class="custom-schema-box">
                <p-dynamic-form :schema="credentialCustomSchema" :model="credentialCustomModel" :options="inputOptions"
                                :is-valid.sync="isCredentialCustomValid"
                                :validation-mode="validationMode"
                />
            </div>
            <div v-if="selectedCredentialInputOption === 'Json Code'">
                <p-monaco-editor :style="'height: 272px;'" :code.sync="jsonForCredential" />
            </div>
        </p-pane-layout>

        <s-project-tree-panel ref="projectRef" class="tree-panel"
                              :resource-name="$t('WORD.SERVICE_ACCOUNT')"
                              :target-name="accountBasicModel.name"
        />
        <div class="button-lap">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      @click="onClickSave"
            >
                {{ $t('BTN.SAVE') }}
            </p-button>
            <p-button class="text-button" style-type="outline gray900" size="lg"
                      @click="onClickGoBack"
            >
                {{ $t('BTN.CANCEL') }}
            </p-button>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import { get, map, random } from 'lodash';
import VueFormGenerator from 'vue-form-generator/dist/vfg';

import {
    ComponentRenderProxy, getCurrentInstance,
    reactive, computed, ref, toRefs, watch,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import SProjectTreePanel from '@/views/identity/service-account/modules/ProjectTreePanel.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PDynamicForm from '@/components/organisms/forms/dynamic-form/PDynamicForm.vue';
import PCollapsiblePanel from '@/components/molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import PMarkdown from '@/components/molecules/markdown/PMarkdown.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/PDictInputGroup.toolset';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { fluentApi } from '@/lib/fluent-api';
import { ProviderModel } from '@/lib/fluent-api/identity/provider';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/PSelectBtnGroup.vue';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/PMonacoEditor.vue';
import { SpaceConnector } from '@/lib/space-connector';

const credentialInputOptionButton = ['Input Form', 'Json Code'];

export default {
    name: 'AddServiceAccount',
    components: {
        PMonacoEditor,
        PSelectBtnGroup,
        PMarkdown,
        PDynamicForm,
        PCollapsiblePanel,
        PPageTitle,
        PPageNavigation,
        PFieldGroup,
        PDictInputGroup,
        PPaneLayout,
        GeneralPageLayout,
        PIconTextButton,
        PButton,
        PRadio,
        SProjectTreePanel,
        PI,
    },
    props: {
        provider: {
            type: String,
            default: null,
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            providerObj: {} as ProviderModel,
            serviceAccountId: '',
            providerIcon: computed(() => get(state.providerObj, 'tags.icon', '')),
            description: computed(() => get(state.providerObj, 'metadata.view.layouts.help:service_account:create', undefined)),
            selectedSecretType: '',
            serviceAccountNames: [] as string[],
            credentialNames: [] as string[],
            secretTypes: computed(() => get(state.providerObj, 'capability.supported_schema', [])),
            //
            isAccountBasicValid: false,
            accountBasicModel: { name: '' },
            accountBasicSchema: {
                fields: [
                    {
                        id: 'accountName',
                        type: 'input',
                        inputType: 'text',
                        label: vm.$t('COMMON.NAME'),
                        model: 'name',
                        placeholder: 'Cloud Account Name',
                        min: 2,
                        required: true,
                        validator: [VueFormGenerator.validators.string.locale({
                            fieldIsRequired: 'should NOT be shorter than 2 characters',
                            textTooSmall: 'should NOT be shorter than 2 characters',
                        }), (value) => {
                            if (state.serviceAccountNames.includes(value)) {
                                return ['Name is duplicated'];
                            }
                            return [];
                        }],
                    },
                ],
            },
            isAccountCustomValid: false,
            accountCustomModel: {},
            accountCustomSchema: {},
            //
            selectedCredentialInputOption: 'Input Form',
            jsonForCredential: '',
            isCredentialBasicValid: false,
            credentialBasicModel: { name: '' },
            credentialBasicSchema: {
                fields: [
                    {
                        id: 'credentialName',
                        type: 'input',
                        inputType: 'text',
                        label: vm.$t('COMMON.NAME'),
                        placeholder: 'Credentials Name',
                        model: 'name',
                        min: 2,
                        required: true,
                        validator: [VueFormGenerator.validators.string.locale({
                            fieldIsRequired: 'should NOT be shorter than 2 characters',
                            textTooSmall: 'should NOT be shorter than 2 characters',
                        }), (value) => {
                            if (state.credentialNames.includes(value)) {
                                return ['Name is duplicated'];
                            }
                            return [];
                        }],
                    },
                ],
            },
            isCredentialCustomValid: false,
            credentialCustomSchema: {},
            credentialCustomModel: {},
            //
            inputOptions: {
                validateAfterLoad: true,
                validateAfterChanged: true,
                validateAsync: true,
            },
            validationMode: false,
            isValid: computed(() => {
                if (state.selectedCredentialInputOption === 'Json Code') {
                    return state.isAccountBasicValid && state.isAccountCustomValid && state.isCredentialBasicValid;
                }
                return state.isAccountBasicValid && state.isAccountCustomValid && state.isCredentialBasicValid && state.isCredentialCustomValid;
            }),
            // TODO: tagsTS should be deprecated
            tagsTS: new DictIGToolSet({ showValidation: true }),
        });
        const routeState = reactive({
            route: [{ name: 'Identity', path: '/identity' }, { name: 'Service Account', path: '/identity/service-account' },
                { name: 'Add Account', path: `/identity/service-account/add/${props.provider}` }],
        });
        const projectRef = ref<any>(null);

        const convertMetaSchemaToCustomSchema = (schema) => {
            const customSchema = { fields: [] as object[] };
            const customModel = {};
            map(schema.properties, (v, k) => {
                const field: any = {};
                field.id = random(10000);
                field.model = k;
                field.label = v.title;
                if (v.minLength) field.min = v.minLength;
                if (schema.required.includes(k)) field.required = true;
                if (v.examples) field.placeholder = v.examples;
                if (v.type === 'number' || v.type === 'integer') {
                    field.type = 'input';
                    field.inputType = 'number';
                    if (schema.required.includes(k)) field.validator = ['integer', 'required'];
                } else if (v.type === 'enum') {
                    field.type = 'select';
                    field.values = v.enum;
                    if (schema.required.includes(k)) field.validator = ['select', 'required'];
                } else {
                    field.type = 'input';
                    field.inputType = 'text';
                    if (schema.required.includes(k)) {
                        field.validator = VueFormGenerator.validators.string.locale({
                            fieldIsRequired: `should NOT be shorter than ${v.minLength} characters`,
                            textTooSmall: `should NOT be shorter than ${v.minLength} characters`,
                        });
                    }
                }
                customSchema.fields.push(field);
                customModel[k] = null; // todo:
            });
            return [customSchema, customModel];
        };

        const getProvider = async () => {
            const res = await SpaceConnector.client.identity.provider.get({
                provider: props.provider,
            });
            state.providerObj = res;
            state.selectedSecretType = res.capability.supported_schema[0];
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
            const schema = state.providerObj.template.service_account.schema;
            [state.accountCustomSchema, state.accountCustomModel] = convertMetaSchemaToCustomSchema(schema);
        };
        const getCredentialSchema = async (selectedSecretType) => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: selectedSecretType,
                only: ['schema'],
            });
            const schema = res.schema;
            [state.credentialCustomSchema, state.credentialCustomModel] = convertMetaSchemaToCustomSchema(schema);
        };

        const deleteServiceAccount = async () => {
            await SpaceConnector.client.identity.serviceAccount.delete({
                // eslint-disable-next-line camelcase
                service_account_id: state.serviceAccountId,
            });
            state.serviceAccountId = '';
        };
        const createServiceAccount = async () => {
            const item: any = {
                name: state.accountBasicModel.name,
                provider: props.provider,
                data: state.accountCustomModel,
                tags: state.tagsTS.vdState.newDict,
            };

            if (projectRef.value.selectNode) {
                // eslint-disable-next-line camelcase
                item.project_id = projectRef.value.selectNode.node.data.id;
            }
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.create({
                    ...item,
                });
                state.serviceAccountId = res.service_account_id;
            } catch (e) {
                console.error(e);
                showErrorMessage('Request Fail', e, context.root);
            }
        };
        const createSecretWithForm = async () => {
            await SpaceConnector.client.secret.secret.create({
                name: state.credentialBasicModel.name,
                data: state.credentialCustomModel,
                schema: state.selectedSecretType,
                // eslint-disable-next-line camelcase
                secret_type: 'CREDENTIALS',
                // eslint-disable-next-line camelcase
                service_account_id: state.serviceAccountId,
            });
        };
        const createSecretWithJson = async (jsonData) => {
            await SpaceConnector.client.secret.secret.create({
                data: jsonData,
                name: state.credentialBasicModel.name,
                schema: state.selectedSecretType,
                // eslint-disable-next-line camelcase
                secret_type: 'CREDENTIALS',
                // eslint-disable-next-line camelcase
                service_account_id: state.serviceAccountId,
            });
        };
        const createSecret = async () => {
            try {
                if (state.selectedCredentialInputOption === 'Json Code') {
                    try {
                        const json = JSON.parse(state.jsonForCredential);
                        await createSecretWithJson(json);
                    } catch (e) {
                        console.error(e);
                        showErrorMessage('Fail to Add Account', 'Please put the appropriate json format in the form.', context.root);
                        await deleteServiceAccount();
                        return;
                    }
                }
                if (state.selectedCredentialInputOption === 'Input Form') await createSecretWithForm();
                vm.$router.back();
                showSuccessMessage('Add Success', 'Service Account has been successfully registered.', vm);
            } catch (e) {
                await deleteServiceAccount();
                showErrorMessage('Fail to Add Account', e, context.root);
            }
        };

        const onClickSave = async () => {
            state.validationMode = true;
            if (!state.isValid) {
                showErrorMessage('Fail to Add Account', 'Please check all input forms.', context.root);
                return;
            }
            if (state.tagsTS.allValidation() && !projectRef.value.error) {
                await createServiceAccount();
                if (state.serviceAccountId) {
                    if (state.credentialCustomModel.private_key) {
                        // eslint-disable-next-line camelcase
                        state.credentialCustomModel.private_key = state.credentialCustomModel.private_key.replace(/\\n/g, '\n');
                    }
                    await createSecret();
                }
            }
        };
        const onClickGoBack = () => {
            const nextPath = vm?.$route.query.nextPath as string|undefined;
            if (nextPath) vm.$router.push(nextPath);
            else vm.$router.back();
        };

        const init = async () => {
            await getProvider();
            await getServiceAccountNames();
            await getCredentialNames();
            //
            await getServiceAccountSchema();
        };
        init();

        watch(() => state.selectedSecretType, async (after, before) => {
            if (after && after !== before) {
                await getCredentialSchema(after);
            }
        }, { immediate: true });

        return {
            credentialInputOptionButton,
            ...toRefs(state),
            ...toRefs(routeState),
            projectRef,
            onClickSave,
            onClickGoBack,
        };
    },
};
</script>

<style lang="postcss">
.add-service-account-container {
    .p-page-title {
        .icon {
            display: inline-block;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
            margin-top: -0.25rem;
        }
    }
    .p-pane-layout {
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
        .vue-form-generator {
            .form-group {
                .form-control {
                    max-width: 100%;
                    @screen lg {
                        max-width: 50%;
                    }
                }
            }
        }
        .secret-type-text {
            margin-right: 4.375rem;
        }
        .custom-schema-box {
            @apply border border-gray-200;
            border-radius: 0.125rem;
            border-left-width: 0.25rem;
            padding: 1.25rem 2rem;
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

    .button-lap {
        display: flex;
        flex-direction: row-reverse;
        margin-top: 1rem;
        .text-button {
            margin-left: 1rem;
        }
    }
}
</style>
