<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PJsonSchemaForm, PTextInput,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { TrustedAccountListParameters } from '@/schema/identity/trusted-account/api-verbs/list';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import { i18n } from '@/translations';

import type { Tag } from '@/common/components/forms/tags-input-group/type';
import TagsInput from '@/common/components/inputs/TagsInput.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import ServiceAccountProjectForm from '@/services/asset-inventory/components/ServiceAccountProjectForm.vue';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';
import type { BaseInformationForm, ProjectForm } from '@/services/asset-inventory/types/service-account-page-type';



interface Props {
    schema: any;
    mode: 'CREATE' | 'UPDATE';
}

const props = withDefaults(defineProps<Props>(), {
    schema: () => ({}),
    mode: 'CREATE',
});

const serviceAccountPageStore = useServiceAccountPageStore();

const {
    forms: { serviceAccountName },
    invalidState,
    invalidTexts,
    setForm,
} = useFormValidator({
    serviceAccountName: '',
}, {
    serviceAccountName: (val: string) => {
        if (val?.length < 2) {
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
        } if (state.allAccountNames.includes(val)) {
            if (state.originForm?.accountName === val) return true;
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
        }
        return true;
    },
});
const state = reactive({
    serviceAccountType: computed(() => serviceAccountPageStore.state.serviceAccountType),
    isTrustedAccount: computed(() => serviceAccountPageStore.state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    originServiceAccountData: computed<Partial<TrustedAccountModel & ServiceAccountModel>>(() => serviceAccountPageStore.state.originServiceAccountItem),
    originForm: computed(() => ({
        accountName: state.originServiceAccountData?.name,
        customSchemaForm: state.originServiceAccountData?.data,
        tags: state.originServiceAccountData?.tags,
        ...((!state.isTrustedAccount && state.originServiceAccountData && ('project_id' in state.originServiceAccountData)) && {
            projectForm: { selectedProjectId: state.originServiceAccountData?.project_id ?? '' },
        }),
    })),
    serviceAccountNames: [] as string[],
    trustedAccountNames: [] as string[],
    allAccountNames: computed<string[]>(() => [...state.serviceAccountNames, ...state.trustedAccountNames]),
    isLoadingNames: false,
    customSchemaForm: {},
    isCustomSchemaFormValid: undefined,
    tags: {},
    isTagsValid: true,
    projectForm: {} as ProjectForm,
    isProjectFormValid: false,
    formData: computed<BaseInformationForm>(() => ({
        accountName: serviceAccountName.value,
        customSchemaForm: state.customSchemaForm,
        projectForm: state.projectForm,
        tags: state.tags,
    })),
    isAllValid: computed(() => {
        // Name validation: must be valid (false means valid in invalidState)
        const isNameValid = invalidState.serviceAccountName === false;

        // Account name must have a value (not empty)
        const hasName = !!serviceAccountName.value;

        // Project form validation (only for non-trusted accounts)
        const isProjectValid = state.isTrustedAccount ? true : state.isProjectFormValid;

        // Tags validation
        const isTagsValidValue = state.isTagsValid;

        // Custom schema validation (account_id etc.)
        // When schema exists, validation must be true (not undefined or false)
        const isSchemaValid = isEmpty(props.schema) ? true : state.isCustomSchemaFormValid === true;

        return isNameValid && hasName && isProjectValid && isTagsValidValue && isSchemaValid;
    }),
    isChanged: false,
});

/* Util */
const initFormData = (originForm: Partial<BaseInformationForm>) => {
    setForm('serviceAccountName', originForm?.accountName);
    state.customSchemaForm = originForm?.customSchemaForm ?? {};
    state.tags = originForm?.tags ?? {};
    // init validation
    state.isCustomSchemaFormValid = true;
    state.projectForm.selectedProjectId = originForm?.projectForm?.selectedProjectId;
};

/* Api */
const listServiceAccounts = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
            query: {
                only: ['name'],
            },
        });
        state.serviceAccountNames = (results ?? []).map((v) => v.name);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.serviceAccountNames = [];
    }
};

const listTrustedAccounts = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.trustedAccount.list<TrustedAccountListParameters, ListResponse<TrustedAccountModel>>({
            query: {
                only: ['name'],
            },
        });
        state.trustedAccountNames = (results ?? []).map((v) => v.name);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.trustedAccountNames = [];
    }
};

const fetchAllAccountNames = async () => {
    state.isLoadingNames = true;
    try {
        await Promise.all([
            listServiceAccounts(),
            listTrustedAccounts(),
        ]);
    } finally {
        state.isLoadingNames = false;
    }
};

/* Event */
const handleUpdateTags = (tags: Tag) => {
    state.tags = tags;
    if (props.mode !== 'UPDATE') return;
    state.isChanged = true;
};
const handleAccountValidate = (isValid) => {
    state.isCustomSchemaFormValid = isValid;
    if (props.mode !== 'UPDATE') return;
    if (state.customSchemaForm?.account_id && state.originForm.customSchemaForm?.account_id !== state.customSchemaForm.account_id) {
        state.isChanged = true;
    }
};

const handleChangeProjectForm = (projectForm) => {
    state.projectForm = projectForm;
    if (props.mode !== 'UPDATE') return;
    if (state.originForm?.projectForm.selectedProjectId !== state.projectForm.selectedProjectId) {
        state.isChanged = true;
    }
};

/* Init */
(async () => {
    await fetchAllAccountNames();
})();

/* Watcher */
watch([() => state.isAllValid, () => state.isChanged], ([isAllValid, isChanged]) => {
    // UPDATE 모드: validation + changed 모두 체크
    if (props.mode === 'UPDATE') {
        serviceAccountPageStore.$patch((_state) => {
            _state.formState.isBaseInformationFormValid = isAllValid && isChanged;
        });
        return;
    }
    // CREATE 모드: validation만 체크
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.isBaseInformationFormValid = isAllValid;
    });
}, { immediate: true });
watch(() => state.formData, (formData) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.baseInformation = formData;
    });
});
watch(() => state.originForm, (originForm) => {
    if (!isEmpty(originForm) && props.mode === 'UPDATE') initFormData(originForm);
}, { immediate: true });

</script>

<template>
    <div class="service-account-base-information-form">
        <p-field-group v-if="props.mode === 'CREATE'"
                       :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_LABEL')"
                       :invalid="invalidState.serviceAccountName"
                       :invalid-text="invalidTexts.serviceAccountName"
                       :required="true"
        >
            <template #default="{invalid}">
                <p-text-input :value="serviceAccountName"
                              class="account-name-input block"
                              :invalid="invalid"
                              :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.BASE_NAME_PLACEHOLDER')"
                              @update:value="setForm('serviceAccountName', $event)"
                />
            </template>
        </p-field-group>
        <p-json-schema-form v-if="props.schema"
                            class="p-json-schema-form"
                            :form-data.sync="state.customSchemaForm"
                            :schema="props.schema"
                            :language="$store.state.user.language"
                            @validate="handleAccountValidate"
        />
        <p-field-group v-if="!state.isTrustedAccount"
                       class="project-field"
                       required
                       :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')"
        >
            <service-account-project-form :is-valid.sync="state.isProjectFormValid"
                                          :project-id="state.originForm?.projectForm?.selectedProjectId ?? ''"
                                          @change="handleChangeProjectForm"
            />
        </p-field-group>
        <div class="account-tags">
            <tags-input :tags="state.tags"
                        @update:tags="handleUpdateTags"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-base-information-form {
    .account-tags {
        width: 100%;
        max-width: 30rem;
        margin-bottom: 2rem;
    }

    /* custom design-system component - p-text-input */
    :deep(.account-name-input) {
        .input-container {
            max-width: 30rem;
            width: 100%;
        }
    }

    /* custom design-system component - p-field-group */
    :deep(.project-field) {
        margin-bottom: 1.5rem;
    }

    /* custom design-system component - p-json-schema-form */
    :deep(.p-json-schema-form) {
        .p-field-group {
            margin-bottom: 1.5rem;
        }

        .p-text-input {
            width: 100%;
            .input-container {
                max-width: 30rem;
                width: 100%;
            }
        }
    }

    @screen tablet {
        .account-tags {
            width: 100%;
        }

        /* custom design-system component - p-text-input */
        :deep(.account-name-input) {
            .input-container {
                width: 100%;
            }
        }

        /* custom design-system component - p-json-schema-form */
        :deep(.p-json-schema-form) {
            .p-text-input {
                .input-container {
                    width: 100%;
                }
            }
        }
    }
}
</style>
