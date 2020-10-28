<template>
    <general-page-layout class="add-service-account-container">
        <div class="page-navigation">
            <p-page-navigation :routes="routeState.routes" />
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
            <p-field-group label="name"
                           :invalid-text="accountNameInvalidText"
                           :invalid="accountName && !isAccountNameValid"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="accountName" class="block" :class="{'invalid': invalid}"
                                  placeholder="Cloud Account Name"
                    />
                </template>
            </p-field-group>
            <p-json-schema-form :model.sync="accountModel" :schema="accountSchema" :is-valid.sync="isAccountModelValid" />
            <div class="tag-title">
                {{ $t('PANEL.TAG') }}
            </div>
            <div class="tag-help-msg">
                <i18n path="ACTION.DICT.ADD_TAG_BY">
                    <template #name>
                        <span v-if="accountName" class="font-bold">[{{ accountName }}]</span>
                        <span v-else> Account</span>
                    </template>
                </i18n>
                <br>
                {{ $t('ACTION.DICT.HELPMSG') }}
            </div>
            <p-dict-input-group ref="dictRef"
                                :dict="tags"
                                show-validation
                                show-header
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
            <p-field-group label="name"
                           :invalid-text="credentialNameInvalidText"
                           :invalid="credentialName && !isCredentialNameValid"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="credentialName" class="block" :class="{'invalid': invalid}"
                                  placeholder="Credentials Name"
                    />
                </template>
            </p-field-group>

            <p-field-group label="Secret Type" required>
                <div class="flex">
                    <span v-for="(type, idx) in secretTypes" :key="idx" class="secret-type-text">
                        <p-radio v-model="selectedSecretType" :value="type" />
                        {{ type }}
                    </span>
                </div>
            </p-field-group>
            <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab">
                <template #input>
                    <p-json-schema-form :model.sync="credentialModel" :schema="credentialSchema" :is-valid.sync="isCredentialModelValid"
                                        class="custom-schema-box"
                    />
                </template>
                <template #json>
                    <p-text-editor :code.sync="jsonForCredential" mode="edit" />
                </template>
            </p-tab>
        </p-pane-layout>

        <s-project-tree-panel ref="projectRef" class="tree-panel"
                              :resource-name="$t('WORD.SERVICE_ACCOUNT')"
                              :target-name="accountName"
        />
        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      :disabled="!isValid"
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
/* eslint-disable camelcase */
import { get } from 'lodash';

import {
    ComponentRenderProxy, getCurrentInstance,
    reactive, computed, ref, toRefs, watch,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import SProjectTreePanel from '@/views/identity/service-account/modules/ProjectTreePanel.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PCollapsiblePanel from '@/components/molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import PMarkdown from '@/components/molecules/markdown/PMarkdown.vue';
import PTextEditor from '@/components/molecules/text-editor/text-editor/PTextEditor.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { TabItem } from '@/components/organisms/tabs/tab/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { ProviderModel } from '@/views/identity/service-account/type';

export default {
    name: 'AddServiceAccount',
    components: {
        PTab,
        PTextInput,
        PJsonSchemaForm,
        PTextEditor,
        PMarkdown,
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
            tags: {},
            dictRef: null as any,
        });

        const tabState = reactive({
            tabs: [
                { label: 'Input Form', name: 'input', keepAlive: true },
                { label: 'Json Code', name: 'json', keepAlive: true },
            ] as TabItem[],
            activeTab: 'input',
        });

        const formState = reactive({
            /* static input */
            accountName: undefined as undefined | string,
            accountNameInvalidText: computed(() => {
                let invalidText = '';
                if (typeof formState.accountName === 'string') {
                    if (formState.accountName.length < 2) {
                        invalidText = 'should NOT be shorter than 2 characters';
                    } else if (state.serviceAccountNames.includes(formState.accountName)) {
                        invalidText = 'Name is duplicated';
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
            credentialName: undefined as undefined | string,
            credentialNameInvalidText: computed(() => {
                let invalidText = '';
                if (typeof formState.credentialName === 'string') {
                    if (formState.credentialName.length < 2) {
                        invalidText = 'should NOT be shorter than 2 characters';
                    } else if (state.credentialNames.includes(formState.credentialName)) {
                        invalidText = 'Name is duplicated';
                    }
                }
                return invalidText;
            }),
            isCredentialNameValid: computed(() => {
                if (formState.credentialName) {
                    return !(formState.credentialName.length < 2 || state.credentialNames.includes(formState.credentialName));
                }
                return false;
            }),
            /* schema input */
            accountModel: {},
            accountSchema: {},
            isAccountModelValid: false,
            //
            credentialModel: {},
            credentialSchema: {},
            isCredentialModelValid: false,
            //
            jsonForCredential: '',
            //
            isValid: computed(() => {
                if (tabState.activeTab === 'json') {
                    return formState.isAccountNameValid && formState.isAccountModelValid && formState.isCredentialNameValid;
                }
                return formState.isAccountNameValid && formState.isAccountModelValid && formState.isCredentialNameValid && formState.isCredentialModelValid;
            }),
        });

        const routeState = reactive({
            routes: [{ name: 'Identity', path: '/identity' }, { name: 'Service Account', path: '/identity/service-account' },
                { name: 'Add Account', path: `/identity/service-account/add/${props.provider}` }],
        });
        const projectRef = ref<any>(null);

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
            formState.accountSchema = state.providerObj.template.service_account.schema;
        };
        const getCredentialSchema = async (selectedSecretType) => {
            const res = await SpaceConnector.client.repository.schema.get({
                name: selectedSecretType,
                only: ['schema'],
            });
            formState.credentialSchema = res.schema;
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
                tags: state.dictRef.getDict(),
            };

            if (projectRef.value.selectNode) {
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
                name: formState.credentialName,
                data: formState.credentialModel,
                schema: state.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
            });
        };
        const createSecretWithJson = async (jsonData) => {
            await SpaceConnector.client.secret.secret.create({
                data: jsonData,
                name: formState.credentialName,
                schema: state.selectedSecretType,
                secret_type: 'CREDENTIALS',
                service_account_id: state.serviceAccountId,
            });
        };
        const createSecret = async () => {
            try {
                if (tabState.activeTab === 'json') {
                    try {
                        const json = JSON.parse(formState.jsonForCredential);
                        await createSecretWithJson(json);
                    } catch (e) {
                        console.error(e);
                        showErrorMessage('Fail to Add Account', e, context.root);
                        await deleteServiceAccount();
                        return;
                    }
                }
                if (tabState.activeTab === 'input') await createSecretWithForm();
                vm.$router.back();
                showSuccessMessage('Add Success', 'Service Account has been successfully registered.', vm);
            } catch (e) {
                await deleteServiceAccount();
                showErrorMessage('Fail to Add Account', e, context.root);
            }
        };

        const onClickSave = async () => {
            if (!formState.isValid) {
                showErrorMessage('Fail to Add Account', 'Please check all input forms.', context.root);
                return;
            }
            if (state.dictRef.allValidation() && !projectRef.value.error) {
                await createServiceAccount();
                if (state.serviceAccountId) {
                    if (formState.credentialModel.private_key) {
                        formState.credentialModel.private_key = formState.credentialModel.private_key.replace(/\\n/g, '\n');
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
            ...toRefs(state),
            ...toRefs(formState),
            routeState,
            tabState,
            projectRef,
            onClickSave,
            onClickGoBack,
        };
    },
};
</script>

<style lang="postcss" scoped>
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
        .p-field-group {
            .p-text-input {
                width: 100%;
                @screen lg {
                    max-width: 50%;
                }
                &.invalid {
                    @apply border border-red-500;
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
            padding-left: 2rem;
            padding-right: 2rem;
            padding-bottom: 2rem;
            margin-bottom: -2rem;
            .form-label {
                margin-top: 1.5rem;
            }
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
}
</style>
