<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch, onMounted,
} from 'vue';

import { isEmpty } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PRadio, PCodeEditor, PSelectDropdown, PLink, PCopyButton, PI, PTab, PJsonSchemaForm,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { useServiceAccountSchemaListQuery } from '@/services/service-account/composables/queries/use-service-account-schema-list-query';
import { useTrustedAccountListQuery } from '@/services/service-account/composables/queries/use-trusted-account-list-query';
import { useServiceAccountProviderSchema } from '@/services/service-account/composables/use-service-account-provider-schema';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';
import type { ActiveDataType, CredentialForm } from '@/services/service-account/types/service-account-page-type';

interface Props {
    originForm?: Partial<CredentialForm>;
    createMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    originForm: () => ({}),
    createMode: false,
});

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const userStore = useUserStore();

interface State {
    showTrustedAccount: ComputedRef<boolean>;
    isTrustedAccount: ComputedRef<boolean>;
    // trustedAccounts: TrustedAccountModel[];
    trustedAccountMenuItems: ComputedRef<SelectDropdownMenuItem[]>;
    selectedTrustedAccountDataList: ComputedRef<Array<{ key: string|undefined; value: string }>>;
    // secretTypes: SchemaModel[];
    credentialSchema: ComputedRef<JsonSchema>;
    trustedAccountInfoLink: ComputedRef<string>;
    baseInformationSchema: ComputedRef<JsonSchema|undefined>;
}

const {
    generalAccountSchema,
    trustedAccountSchema,
    trustingSecretSchemaList,
} = useServiceAccountProviderSchema();

const referenceMap = useAllReferenceDataModel();
const storeState = reactive({
    language: computed<string|undefined>(() => userStore.state.language),
    providerName: computed(() => {
        if (!serviceAccountSchemaStore.state.currentProvider) return '';
        return referenceMap.provider[serviceAccountSchemaStore.state.currentProvider]?.name || serviceAccountSchemaStore.state.currentProvider || '';
    }),
    provider: computed(() => serviceAccountPageStore.state.selectedProvider),
});
const state = reactive<State>({
    showTrustedAccount: computed<boolean>(() => !!trustingSecretSchemaList.value),
    isTrustedAccount: computed<boolean>(() => serviceAccountPageStore.state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    trustedAccountMenuItems: computed<SelectDropdownMenuItem[]>(() => (trustedAccountList.value ?? [])?.map((d) => ({
        name: d.trusted_account_id,
        label: d.name,
    }))),
    selectedTrustedAccountDataList: computed<Array<{ key: string|undefined; value: string }>>(() => {
        const selectedTrustedAccount = (trustedAccountList.value ?? [])?.find((d) => d.trusted_account_id === formState.attachedTrustedAccountId);
        if (!selectedTrustedAccount) return [];
        const baseInfoProperties: Record<string, JsonSchema> | undefined = state.baseInformationSchema?.properties;
        let entries: Array<[string, JsonSchema]> = [];
        if (baseInfoProperties) entries = Object.entries(baseInfoProperties);
        return entries.map(([k, v]) => ({
            key: v.title,
            value: selectedTrustedAccount.data[k],
        }));
    }),
    credentialSchema: computed<JsonSchema>(() => formState.selectedSecretType?.schema ?? null),
    trustedAccountInfoLink: computed<string>(() => {
        const lang = storeState.language === 'en' ? '' : `${storeState.language}/`;
        return `https://cloudforet.io/${lang}docs/guides/asset-inventory/service-account/`;
    }),
    baseInformationSchema: computed<JsonSchema|undefined>(() => generalAccountSchema.value?.schema),
});
const formState = reactive({
    hasCredentialKey: true,
    selectedSecretType: {} as SchemaModel,
    credentialJson: '{}',
    customSchemaForm: {},
    attachTrustedAccount: false,
    attachedTrustedAccountId: undefined,
    formData: computed<CredentialForm>(() => ({
        hasCredentialKey: formState.hasCredentialKey,
        selectedSecretSchema: formState.selectedSecretType,
        attachedTrustedAccountId: formState.attachedTrustedAccountId,
        customSchemaForm: formState.customSchemaForm,
        activeDataType: tabState.activeTab as ActiveDataType,
        credentialJson: formState.credentialJson,
    })),
    isCustomSchemaFormValid: false,
    isCredentialJsonValid: computed<boolean>(() => checkJsonStringAvailable(formState.credentialJson)),
    isAllValid: computed<boolean>(() => {
        if (!formState.hasCredentialKey) return true;
        if (!state.isTrustedAccount) {
            if (formState.attachTrustedAccount && !formState.attachedTrustedAccountId) return false;
        }
        if (schemaList.value?.length) {
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
    formState.selectedSecretType = schemaList.value?.[0];
    formState.credentialJson = '{}';
    formState.customSchemaForm = {};
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

const { data: trustedAccountList } = useTrustedAccountListQuery({
    params: computed(() => ({
        query: new ApiQueryHelper().setFilters([{ k: 'provider', v: storeState.provider, o: '=' }]).data,
    })),
    enabled: computed(() => !!storeState.provider),
});


const getTrustedAccountCredentialData = (trustedAccountId: string) => {
    const trustedAccount:TrustedAccountModel|undefined = trustedAccountList.value?.find((d:TrustedAccountModel) => d.trusted_account_id === trustedAccountId);
    if (!trustedAccount) return;
    formState.credentialJson = JSON.stringify(trustedAccount.data, null, 2);
};

/* Event */
const handleCredentialValidate = (isValid) => {
    formState.isCustomSchemaFormValid = isValid;
};
const handleChangeSecretType = (val: string) => {
    if (formState.selectedSecretType !== val) {
        formState.credentialJson = '{}';
        formState.customSchemaForm = {};
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
        formState.credentialJson = '{}';
        formState.customSchemaForm = {};
        formState.attachTrustedAccount = val;
        if (val) formState.attachedTrustedAccountId = trustedAccountList.value?.[0]?.trusted_account_id;
    }
};
const handleChangeAttachedTrustedAccountId = (val?: string) => {
    if (formState.attachedTrustedAccountId !== val) {
        formState.attachedTrustedAccountId = val;
    }
};

const schemaApiQueryHelper = new ApiQueryHelper();

const { data: schemaList } = useServiceAccountSchemaListQuery({
    params: computed(() => {
        const trustedAccountRelatedSchemas = formState.attachTrustedAccount ? trustingSecretSchemaList.value : (trustedAccountSchema.value?.related_schemas ?? []);
        const generalAccountRelatedSchemas = generalAccountSchema.value?.related_schemas ?? [];
        schemaApiQueryHelper.setFilters([
            { k: 'schema_type', v: formState.attachTrustedAccount ? 'TRUSTING_SECRET' : 'SECRET', o: '=' },
            { k: 'schema_id', v: state.isTrustedAccount ? trustedAccountRelatedSchemas : generalAccountRelatedSchemas, o: '=' },
        ]);
        return {
            query: schemaApiQueryHelper.data,
        };
    }),
});

/* Mounted */
onMounted(async () => {
    if (!isEmpty(props.originForm)) setOriginForm(props.originForm);
});

/* Watcher */
watch(schemaList, (_schemaList) => {
    if (_schemaList?.length) formState.selectedSecretType = _schemaList[0];
}, { immediate: true });
watch(() => formState.attachedTrustedAccountId, (attachedTrustedAccountId) => {
    getTrustedAccountCredentialData(attachedTrustedAccountId);
    formState.isCustomSchemaFormValid = true;
});
watch(() => formState.formData, (formData) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.credential = formData;
    });
});
watch(() => formState.isAllValid, (isAllValid) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.isCredentialFormValid = isAllValid;
    });
});

</script>

<template>
    <div class="service-account-credentials-form">
        <p-field-group v-if="!state.isTrustedAccount"
                       :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.CREDENTIAL_HELP_TEXT', { provider: storeState.providerName })"
                       required
        >
            <div class="flex">
                <p-radio v-model="formState.hasCredentialKey"
                         :value="true"
                         class="radio-text"
                >
                    {{ $t('APP.MAIN.YES') }}
                </p-radio>
                <p-radio :selected="formState.hasCredentialKey"
                         :value="false"
                         @change="handleSelectNoCredentials"
                >
                    {{ $t('APP.MAIN.NO') }}
                </p-radio>
            </div>
        </p-field-group>
        <template v-if="formState.hasCredentialKey">
            <p-field-group v-if="!state.isTrustedAccount && state.showTrustedAccount"
                           class="mt-6"
                           :label="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CREDENTIALS_LABEL')"
                           required
            >
                <template #help>
                    <span>{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.TRUSTED_ACCOUNT_HELP_TEXT') }}</span>
                    <p-link class="see-more-text"
                            :text="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SEE_MORE')"
                            action-icon="external-link"
                            :href="state.trustedAccountInfoLink"
                    />
                </template>
                <div class="radio-wrapper">
                    <p-radio :selected="formState.attachTrustedAccount"
                             :value="false"
                             @change="handleChangeAttachTrustedAccount"
                    >
                        {{ $t('APP.MAIN.NO') }}
                    </p-radio>
                    <br>
                    <p-radio :selected="formState.attachTrustedAccount"
                             :value="true"
                             @change="handleChangeAttachTrustedAccount"
                    >
                        {{ $t('APP.MAIN.YES') }}<br>
                    </p-radio>
                    <div v-if="formState.attachTrustedAccount"
                         class="yes-dropdown"
                    >
                        <p-select-dropdown :selected="formState.attachedTrustedAccountId"
                                           :menu="state.trustedAccountMenuItems"
                                           :disabled="!formState.attachTrustedAccount"
                                           block
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
                                     class="content-wrapper"
                                >
                                    <b>{{ data.key }} </b>
                                    <p-copy-button size="sm"
                                                   class="copy-button-wrap"
                                    >
                                        {{ data.value }}
                                    </p-copy-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </p-field-group>
            <p-field-group :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SECRET_TYPE_LABEL')"
                           required
                           class="mb-8 mt-6"
            >
                <div class="flex">
                    <p-radio v-for="(type, idx) in schemaList"
                             :key="idx"
                             :selected="formState.selectedSecretType"
                             :value="type"
                             class="radio-text"
                             @change="handleChangeSecretType"
                    >
                        {{ type.name }}
                    </p-radio>
                </div>
            </p-field-group>

            <p-tab :tabs="tabState.tabs"
                   :active-tab.sync="tabState.activeTab"
                   stretch
            >
                <template #input>
                    <p-json-schema-form v-if="state.credentialSchema"
                                        :form-data.sync="formState.customSchemaForm"
                                        :schema="state.credentialSchema"
                                        :language="storeState.language"
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
                        <p-code-editor :code.sync="formState.credentialJson"
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
            .copy-text-wrapper {
                display: flex;
                align-items: center;
                padding-top: 0.75rem;
                .right-part {
                    @apply text-gray-700;
                    display: grid;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    margin-left: 0.375rem;

                    .content-wrapper {
                        @apply flex items-center gap-1;

                        .copy-button-wrap {
                            display: inline-block;
                            height: 1.125rem;
                        }
                    }
                }
            }
        }
    }
    .custom-schema-box {
        padding: 2rem 2rem 0 2rem;
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
