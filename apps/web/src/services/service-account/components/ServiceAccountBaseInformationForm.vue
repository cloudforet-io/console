<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { isEmpty, isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PJsonSchemaForm, PTextInput,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import TagsInput from '@/common/components/inputs/TagsInput.vue';
import { useFormValidator } from '@/common/composables/form-validator';
import type { Tag } from '@/common/modules/tags/type';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import ServiceAccountProjectForm from '@/services/service-account/components/ServiceAccountProjectForm.vue';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import type { BaseInformationForm, ProjectForm } from '@/services/service-account/types/service-account-page-type';



interface Props {
    schema: any;
    mode: 'CREATE' | 'UPDATE';
}

const props = withDefaults(defineProps<Props>(), {
    schema: () => ({}),
    mode: 'CREATE',
});

const userStore = useUserStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageGetters = serviceAccountPageStore.getters;

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
        } if (state.serviceAccountNames.includes(val)) {
            if (state.originForm?.accountName === val) return true;
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_DUPLICATED');
        }
        return true;
    },
});
const state = reactive({
    serviceAccountType: computed(() => serviceAccountPageStore.state.serviceAccountType),
    originServiceAccountData: computed<Partial<TrustedAccountModel & ServiceAccountModel>>(() => serviceAccountPageStore.state.originServiceAccountItem),
    originForm: computed(() => ({
        accountName: state.originServiceAccountData?.name,
        customSchemaForm: state.originServiceAccountData?.data,
        tags: state.originServiceAccountData?.tags,
        serviceAccountManagerId: state.originServiceAccountData?.service_account_mgr_id,
        ...((!serviceAccountPageGetters.isTrustedAccount && state.originServiceAccountData && ('project_id' in state.originServiceAccountData)) && {
            projectForm: { selectedProjectId: state.originServiceAccountData?.project_id ?? '' },
        }),
    })),
    serviceAccountNames: [] as string[],
    customSchemaForm: {},
    isCustomSchemaFormValid: undefined,
    tags: {},
    isTagsValid: true,
    projectForm: {} as ProjectForm,
    serviceAccountManagerId: '',
    isProjectFormValid: false,
    formData: computed<BaseInformationForm>(() => ({
        accountName: serviceAccountName.value,
        customSchemaForm: state.customSchemaForm,
        serviceAccountManagerId: state.serviceAccountManagerId,
        ...(!serviceAccountPageGetters.isTrustedAccount && { projectForm: state.projectForm }),
        tags: state.tags,
    })),
    isSameValueWithOrigin: computed(() => isEqual(state.formData, state.originForm)),
    isAllValid: computed(() => ((invalidState.serviceAccountName === false)
        && !state.isSameValueWithOrigin
        && (serviceAccountPageGetters.isTrustedAccount ? true : (state.isProjectFormValid || state.originForm?.projectForm?.selectedProjectId))
        && state.isTagsValid
        && (isEmpty(props.schema) ? true : state.isCustomSchemaFormValid))),
    language: computed<string|undefined>(() => userStore.state.language),
});

/* Util */
const initFormData = (originForm: Partial<BaseInformationForm>) => {
    setForm('serviceAccountName', originForm?.accountName);
    state.customSchemaForm = originForm?.customSchemaForm ?? {};
    state.tags = originForm?.tags ?? {};
    // init validation
    state.isCustomSchemaFormValid = true;
    state.projectForm.selectedProjectId = originForm?.projectForm?.selectedProjectId;
    state.serviceAccountManagerId = originForm?.serviceAccountManagerId ?? '';
};

/* Api */
const listServiceAccounts = async () => {
    const { results } = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
        query: {
            only: ['name'],
        },
    });
    state.serviceAccountNames = (results ?? []).map((v) => v.name);
};

/* Event */
const handleUpdateTags = (tags: Tag) => {
    state.tags = tags;
};
const handleAccountValidate = (isValid) => {
    state.isCustomSchemaFormValid = isValid;
};

const handleChangeProjectForm = (projectForm) => {
    state.projectForm = projectForm;
};

const handleUpdateServiceAccountName = (value: string) => {
    setForm('serviceAccountName', value);
};

const handleServiceAccountManagerId = (value: string) => {
    state.serviceAccountManagerId = value;
};

const handleFormatSelectedIds = (value: Record<string, any>) => {
    if (Array.isArray(value.USER) && value.USER.length === 0) {
        state.serviceAccountManagerId = '';
    }
};

/* Init */
(async () => {
    await listServiceAccounts();
})();

/* Watcher */
watch(() => state.isAllValid, (isAllValid) => {
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
                              @update:value="handleUpdateServiceAccountName"
                />
            </template>
        </p-field-group>
        <p-field-group v-if="!serviceAccountPageGetters.isTrustedAccount"
                       :label="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SERVICE_ACCOUNT_MANAGER')"
        >
            <user-select-dropdown class="account-name block"
                                  :show-user-group-list="false"
                                  :selected-id="state.serviceAccountManagerId"
                                  :placeholder="$t('IDENTITY.SERVICE_ACCOUNT.ADD.SERVICE_ACCOUNT_MANAGER')"
                                  :show-delete-all-button="false"
                                  @formatted-selected-ids="handleFormatSelectedIds"
                                  @update:selected-id="handleServiceAccountManagerId"
            />
        </p-field-group>
        <p-json-schema-form v-if="props.schema"
                            class="p-json-schema-form"
                            :form-data.sync="state.customSchemaForm"
                            :schema="props.schema"
                            :language="state.language"
                            @validate="handleAccountValidate"
        />
        <p-field-group v-if="!serviceAccountPageGetters.isTrustedAccount"
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

    /* custom design-system component - p-select-dropdown */
    :deep(.dropdown-button-component) {
        max-width: 30rem;
        width: 100%;
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
