<template>
    <general-page-layout class="add-service-account-container">
        <div class="page-navigation">
            <p-page-navigation :routes="routeState.routes" />
        </div>
        <p-page-title class="mb-6"
                      child
                      @goBack="onClickGoBack"
        >
            <template #title>
                <div class="page-title">
                    <p-lazy-img class="icon" :src="providerIcon" :alt="provider"
                                :loading="providerLoading"
                                error-icon="ic_provider_other"
                    />
                    {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TITLE') }}
                </div>
            </template>
        </p-page-title>
        <p-collapsible-panel v-if="description">
            <template #content>
                <p-markdown :markdown="description.options.markdown"
                            :data="description.options.markdown"
                            class="p-4"
                />
            </template>
        </p-collapsible-panel>

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
                    <p-text-input v-model="accountName" class="block" :class="{'invalid': invalid}"
                                  :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_NAME_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
            <p-json-schema-form :model.sync="accountModel" :schema="accountSchema" :is-valid.sync="isAccountModelValid" />
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
                    <p-icon-text-button
                        outline style-type="primary" :disabled="scope.disabled"
                        name="ic_plus_bold"
                        class="mb-2"
                        @click="scope.addPair($event)"
                    >
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TAG_ADD') }}
                    </p-icon-text-button>
                </template>
            </tags-input-group>
        </p-pane-layout>

        <p-pane-layout>
            <div class="title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIALS_TITLE') }}
            </div>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_LABEL')"
                           :invalid-text="credentialNameInvalidText"
                           :invalid="credentialName && !isCredentialNameValid"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="credentialName" class="block" :class="{'invalid': invalid}"
                                  :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIALS_NAME_PLACEHOLDER')"
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

        <project-tree-panel ref="projectRef" class="tree-panel"
                            :target-name="accountName"
        />
        <div class="button-group">
            <p-button class="text-button" style-type="primary-dark" size="lg"
                      :disabled="!isValid"
                      @click="onClickSave"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.SAVE') }}
            </p-button>
            <p-button class="text-button" style-type="outline gray900" size="lg"
                      @click="onClickGoBack"
            >
                {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.CANCEL') }}
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

import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
import ProjectTreePanel from '@/views/identity/service-account/modules/ProjectTreePanel.vue';
import TagsInputGroup from '@/views/common/components/tags/TagsInputGroup.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
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
import { TabItem } from '@/components/organisms/tabs/tab/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { ProviderModel } from '@/views/identity/service-account/type';
import { TranslateResult } from 'vue-i18n';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';

export default {
    name: 'AddServiceAccountPage',
    components: {
        PLazyImg,
        PTab,
        PTextInput,
        PJsonSchemaForm,
        PTextEditor,
        PMarkdown,
        PCollapsiblePanel,
        PPageTitle,
        PPageNavigation,
        PFieldGroup,
        TagsInputGroup,
        PPaneLayout,
        GeneralPageLayout,
        PIconTextButton,
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
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            providerLoading: true,
            providerObj: {} as ProviderModel,
            serviceAccountId: '',
            providerIcon: computed(() => get(state.providerObj, 'tags.icon', '')),
            description: computed(() => get(state.providerObj, 'metadata.view.layouts.help:service_account:create', undefined)),
            selectedSecretType: '',
            serviceAccountNames: [] as string[],
            credentialNames: [] as string[],
            secretTypes: computed(() => get(state.providerObj, 'capability.supported_schema', [])),
        });

        const tabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_INPUT'), name: 'input', keepAlive: true },
                { label: vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_JSON'), name: 'json', keepAlive: true },
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
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
                    } else if (state.serviceAccountNames.includes(formState.accountName)) {
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
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
            credentialName: undefined as undefined | string,
            credentialNameInvalidText: computed(() => {
                let invalidText: TranslateResult = '';
                if (typeof formState.credentialName === 'string') {
                    if (formState.credentialName.length < 2) {
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
                    } else if (state.credentialNames.includes(formState.credentialName)) {
                        invalidText = vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
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
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT'), path: '/identity/service-account' },
                { name: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT_ADD_ACCOUNT'), path: `/identity/service-account/add/${props.provider}` },
            ])),
        });
        const projectRef = ref<any>(null);

        const getProvider = async () => {
            state.providerLoading = true;
            try {
                const res = await SpaceConnector.client.identity.provider.get({
                    provider: props.provider,
                });
                state.providerObj = res;
                state.selectedSecretType = res.capability.supported_schema[0];
            } catch (e) {
                console.error(e);
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
                tags: formState.tags,
            };

            if (projectRef.value.firstSelectedNode) {
                item.project_id = projectRef.value.firstSelectedNode.node.data.id;
            }
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.create({
                    ...item,
                });
                state.serviceAccountId = res.service_account_id;
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'), e, vm.$root);
                console.error(e);
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
                        showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'), e, vm.$root);
                        await deleteServiceAccount();
                        return;
                    }
                }
                if (tabState.activeTab === 'input') await createSecretWithForm();
                vm.$router.back();
                showSuccessMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_S_CREATE_ACCOUNT_TITLE'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'), e, vm.$root);
                await deleteServiceAccount();
            }
        };

        const onClickSave = async () => {
            if (!formState.isValid) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_TITLE'),
                    vm.$t('IDENTITY.SERVICE_ACCOUNT.ADD.ALT_E_CREATE_ACCOUNT_FORM_INVALID'), vm.$root);
                return;
            }
            if (formState.isTagsValid && !projectRef.value.error) {
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
    .page-title {
        @apply flex items-center;
        .icon {
            margin-right: 0.5rem;
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
            &.p-json-schema-form::v-deep {
                .form-label {
                    margin-top: 1.5rem;
                }
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
