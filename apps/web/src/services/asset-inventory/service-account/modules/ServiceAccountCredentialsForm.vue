<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PRadio, PTab, PJsonSchemaForm, PTextEditor, PSelectDropdown, PAnchor, PCopyButton, PI,
} from '@spaceone/design-system';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { isEmpty } from 'lodash';
import {
    computed, reactive, watch, onMounted,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import type {
    ActiveDataType, CredentialForm, ProviderModel, PageMode, AccountType,
    ServiceAccountModel,
} from '@/services/asset-inventory/service-account/type';


interface Props {
    editMode: PageMode;
    serviceAccountType: AccountType;
    provider?: string;
    isValid: boolean;
    originForm: Partial<CredentialForm>;
}

const props = withDefaults(defineProps<Props>(), {
    editMode: 'CREATE',
    serviceAccountType: 'GENERAL',
    provider: undefined,
    isValid: false,
    originForm: () => ({}),
});
const emit = defineEmits<{(e: 'update:isValid', value: boolean): void;
    (e: 'change', value: CredentialForm): void;
}>();
const store = useStore();
const { t } = useI18n();

const storeState = reactive({
    language: computed(() => store.state.user.language),
});
const state = reactive({
    providerData: {} as ProviderModel,
    showTrustedAccount: computed<boolean>(() => state.providerData?.capability?.support_trusted_service_account ?? false),
    trustedAccounts: [] as ServiceAccountModel[],
    trustedAccountMenuItems: computed<SelectDropdownMenu[]>(() => state.trustedAccounts.map((d) => ({
        name: d.service_account_id,
        label: d.name,
    }))),
    selectedTrustedAccountDataList: computed(() => {
        const selectedTrustedAccount = state.trustedAccounts.find((d) => d.service_account_id === formState.attachedTrustedAccountId);
        if (!selectedTrustedAccount) return [];
        const baseInfoProperties: Record<string, JsonSchema> = state.baseInformationSchema?.properties;
        let entries: Array<[string, JsonSchema]> = [];
        if (baseInfoProperties) entries = Object.entries(baseInfoProperties);
        return entries.map(([k, v]) => ({
            key: v.title,
            value: selectedTrustedAccount.data[k],
        }));
    }),
    secretTypes: computed<string[]>(() => {
        if (props.serviceAccountType === 'GENERAL') {
            if (formState.attachTrustedAccount) {
                return state.providerData?.capability?.general_service_account_schema ?? [];
            }
            return state.providerData?.capability?.supported_schema ?? [];
        }
        return state.providerData?.capability?.trusted_service_account_schema ?? [];
    }),
    credentialSchema: {} as JsonSchema,
    trustedAccountInfoLink: computed<string>(() => {
        const lang = storeState.language === 'en' ? '' : `${storeState.language}/`;
        return `https://cloudforet.io/${lang}docs/guides/asset-inventory/service-account/`;
    }),
    baseInformationSchema: computed<JsonSchema>(() => state.providerData.template?.service_account?.schema ?? null),
});
const formState = reactive({
    hasCredentialKey: true,
    selectedSecretType: '',
    customSchemaForm: {},
    credentialJson: '{}',
    attachTrustedAccount: false,
    attachedTrustedAccountId: undefined,
    attachedTrustedSecretId: undefined,
    formData: computed<CredentialForm>(() => ({
        hasCredentialKey: formState.hasCredentialKey,
        selectedSecretType: formState.selectedSecretType,
        customSchemaForm: formState.customSchemaForm,
        credentialJson: formState.credentialJson,
        activeDataType: tabState.activeTab as ActiveDataType,
        attachedTrustedAccountId: formState.attachedTrustedAccountId,
        attachedTrustedSecretId: formState.attachedTrustedSecretId,
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
        { label: t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_INPUT'), name: 'input', keepAlive: true },
        { label: t('IDENTITY.SERVICE_ACCOUNT.ADD.TAB_JSON'), name: 'json', keepAlive: true },
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
    tabState.activeTab = 'input';
};
const setOriginForm = (originForm: Partial<CredentialForm>) => {
    formState.hasCredentialKey = originForm?.hasCredentialKey;
    formState.attachTrustedAccount = !!originForm?.attachedTrustedAccountId;
    formState.attachedTrustedAccountId = originForm?.attachedTrustedAccountId;
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
        formState.selectedSecretType = supportedSchema ? supportedSchema[0] : '';
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
const getTrustedAccountCredentialData = async (serviceAccountId: string) => {
    try {
        const getQuery = () => apiQueryHelper
            .setFilters([{ k: 'service_account_id', v: serviceAccountId, o: '=' }]);
        const { results } = await SpaceConnector.client.secret.trustedSecret.list({ query: getQuery().data });
        if (results.length) {
            formState.attachedTrustedSecretId = results[0].trusted_secret_id;
        } else {
            formState.attachedTrustedSecretId = undefined;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        formState.attachedTrustedSecretId = undefined;
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

/* Mounted */
onMounted(async () => {
    if (!isEmpty(props.originForm)) setOriginForm(props.originForm);
});

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
    getTrustedAccountCredentialData(attachedTrustedAccountId);
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

</script>

<template>
    <div class="service-account-credentials-form">
        <p-field-group v-if="serviceAccountType !== ACCOUNT_TYPE.TRUSTED"
                       :label="t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: state.providerData.name })"
                       required
        >
            <div class="flex">
                <p-radio v-model:selected="formState.hasCredentialKey"
                         :value="true"
                         class="radio-text"
                >
                    {{ t('APP.MAIN.YES') }}
                </p-radio>
                <p-radio :selected="formState.hasCredentialKey"
                         :value="false"
                         @change="handleSelectNoCredentials"
                >
                    {{ t('APP.MAIN.NO') }}
                </p-radio>
            </div>
        </p-field-group>
        <template v-if="formState.hasCredentialKey">
            <p-field-group v-if="serviceAccountType !== ACCOUNT_TYPE.TRUSTED && state.showTrustedAccount"
                           :label="t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CREDENTIALS_LABEL')"
                           required
            >
                <template #help>
                    <span>{{ t('IDENTITY.SERVICE_ACCOUNT.ADD.TRUSTED_ACCOUNT_HELP_TEXT') }}</span>
                    <p-anchor class="see-more-text"
                              :text="t('IDENTITY.SERVICE_ACCOUNT.ADD.SEE_MORE')"
                              :href="state.trustedAccountInfoLink"
                    />
                </template>
                <div class="radio-wrapper">
                    <p-radio :selected="formState.attachTrustedAccount"
                             :value="false"
                             @change="handleChangeAttachTrustedAccount"
                    >
                        {{ t('APP.MAIN.NO') }}
                    </p-radio>
                    <br>
                    <p-radio :selected="formState.attachTrustedAccount"
                             :value="true"
                             @change="handleChangeAttachTrustedAccount"
                    >
                        {{ t('APP.MAIN.YES') }}<br>
                    </p-radio>
                    <div v-if="formState.attachTrustedAccount"
                         class="yes-dropdown"
                    >
                        <p-select-dropdown :selected="formState.attachedTrustedAccountId"
                                           :items="state.trustedAccountMenuItems"
                                           :disabled="!formState.attachTrustedAccount"
                                           @select="handleChangeAttachedTrustedAccountId"
                        />
                        <div v-if="formState.attachTrustedAccount && formState.attachedTrustedAccountId"
                             class="copy-text-wrapper"
                        >
                            <p-i name="ic_info-circle"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <div class="right-part">
                                <div v-for="(data, idx) in state.selectedTrustedAccountDataList"
                                     :key="`text-${data.key}-${idx}`"
                                >
                                    <b>{{ data.key }} </b>
                                    <p-copy-button size="sm">
                                        {{ data.value }}
                                    </p-copy-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </p-field-group>
            <p-field-group :label="t('IDENTITY.SERVICE_ACCOUNT.ADD.SECRET_TYPE_LABEL')"
                           required
                           class="mb-8"
            >
                <div class="flex">
                    <p-radio v-for="(type, idx) in state.secretTypes"
                             :key="idx"
                             :selected="formState.selectedSecretType"
                             :value="type"
                             class="radio-text"
                             @change="handleChangeSecretType"
                    >
                        {{ type }}
                    </p-radio>
                </div>
            </p-field-group>
            <p-tab v-model:active-tab="tabState.activeTab"
                   :tabs="tabState.tabs"
                   stretch
            >
                <template #input>
                    <p-json-schema-form v-model:form-data="formState.customSchemaForm"
                                        :schema="state.credentialSchema"
                                        :language="$store.state.user.language"
                                        class="custom-schema-box"
                                        @validate="handleCredentialValidate"
                    />
                </template>
                <template #json>
                    <p-field-group required
                                   class="json-form-wrapper"
                                   :invalid="!checkJsonStringAvailable(formState.credentialJson)"
                                   :invalid-text="t('IDENTITY.SERVICE_ACCOUNT.ADD.JSON_INVALID')"
                    >
                        <p-text-editor v-model:code="formState.credentialJson"
                                       :disable-auto-reformat="true"
                        />
                    </p-field-group>
                </template>
            </p-tab>
        </template>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-credentials-form {
    .radio-text {
        margin-right: 1.125rem;
    }
    .radio-wrapper {
        .p-radio {
            line-height: 1.5;
        }
        .yes-dropdown {
            @apply bg-gray-100;
            width: calc(66% - 1.5rem);
            padding: 0.5rem;
            margin-left: 1.5rem;
            margin-top: 0.25rem;
            .p-select-dropdown {
                width: 100%;
            }
            .copy-text-wrapper {
                display: flex;
                padding-top: 0.75rem;
                .right-part {
                    @apply text-gray-700;
                    display: grid;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    margin-left: 0.375rem;
                }
            }
        }
    }
    .custom-schema-box {
        padding: 2rem 2rem 0;
        width: 66%;

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            width: 100%;
        }
    }

    /* custom design-system component - p-tab */
    :deep(.p-field-group) {
        .see-more-text {
            @apply text-blue-700;
            margin-left: 0.25rem;
        }
    }

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        .json-form-wrapper {
            margin: 1rem;
        }

        /* custom design-system component - p-text-editor */
        .p-text-editor {
            .CodeMirror {
                font-family: Inconsolata, monospace;
                line-height: 1.5;
                height: 14.375rem;
                padding: 1rem;
            }
        }
    }

    @screen tablet {
        .custom-schema-box {
            width: 100%;
        }
    }
}
</style>
