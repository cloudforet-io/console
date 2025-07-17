<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleCreateParameters } from '@/api-clients/identity/role/schema/api-verbs/create';
import type { RoleUpdateParameters } from '@/api-clients/identity/role/schema/api-verbs/update';
import type { RoleType } from '@/api-clients/identity/role/type';

import RoleUpdateFormBaseInformation from '@/services/iam/components/RoleUpdateFormBaseInformation.vue';
import RoleUpdateFormPermissionForm from '@/services/iam/components/RoleUpdateFormPermissionForm.vue';
import RoleUpdateFormRoleType from '@/services/iam/components/RoleUpdateFormRoleType.vue';
import { useRoleGetQuery } from '@/services/iam/composables/use-role-get-query';
import { FORM_TYPE } from '@/services/iam/constants/role-constant';
import type { RoleFormData } from '@/services/iam/types/role-type';

interface Props {
    roleId?: string;
    formType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    roleId: undefined,
    formType: FORM_TYPE.CREATE,
});

const emit = defineEmits<{(e: 'update-validation', after: boolean): void,
    (e: 'update-form-data', after: RoleCreateParameters|RoleUpdateParameters): void,
}>();

const { roleData } = useRoleGetQuery(props.roleId ?? '');

const state = reactive({
    isBaseInformationValid: false,
    baseInfoFormData: '' as string,
    roleTypeData: ROLE_TYPE.DOMAIN_ADMIN as RoleType,
    pageAccessFormData: ['*'] as string[],
    changedPageAccessFormData: ['*'] as string[],
    permissionsData: undefined as string[]|undefined,
    isPolicyValid: true,
    isPageAccessValid: false,
    isAllValid: computed<boolean>(() => {
        const isPageAccessCheckRequired = state.roleTypeData !== ROLE_TYPE.DOMAIN_ADMIN;
        return state.isBaseInformationValid && (!isPageAccessCheckRequired || state.isPageAccessValid) && state.isPolicyValid;
    }),
    formData: computed<RoleCreateParameters|RoleUpdateParameters>(() => {
        const baseData = {
            name: state.baseInfoFormData.trim(),
            permissions: state.permissionsData,
            page_access: state.changedPageAccessFormData,
        };
        return props.formType === FORM_TYPE.CREATE
            ? {
                ...baseData,
                role_type: state.roleTypeData,
            }
            : {
                ...baseData,
                role_id: roleData.value?.role_id || '',
            };
    }),
});

/* Components */
const handleBaseInfoValidate = (value: boolean) => {
    state.isBaseInformationValid = value;
    emit('update-validation', state.isAllValid);
};
const handleUpdateForm = (formData: RoleFormData) => {
    if (formData.name) state.baseInfoFormData = formData.name;
    if (formData.role_type) {
        state.roleTypeData = formData.role_type;
        state.pageAccessFormData = props.formType === FORM_TYPE.CREATE ? ['*'] : state.pageAccessFormData;
    }
    if (Array.isArray(formData.page_access)) {
        state.changedPageAccessFormData = formData.page_access;
        state.isPageAccessValid = formData.page_access.length > 0;
    } else {
        state.isPageAccessValid = false;
    }
    if (formData.permissions) state.permissionsData = formData.permissions;
};

/* Watcher */
watch(() => state.isAllValid, (after) => {
    emit('update-validation', after);
}, { immediate: true });
watch(() => state.formData, (after) => {
    emit('update-form-data', after);
});
</script>

<template>
    <div class="role-update-form">
        <role-update-form-base-information
            @update-validation="handleBaseInfoValidate"
            @update-form="handleUpdateForm"
        />
        <role-update-form-role-type
            :form-type="props.formType"
            @update-form="handleUpdateForm"
        />
        <role-update-form-permission-form
            :is-policy-valid.sync="state.isPolicyValid"
            :is-page-access-valid.sync="state.isPageAccessValid"
            :form-type="props.formType"
            @update-form="handleUpdateForm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.role-update-form {
    @apply flex flex-col flex-wrap gap-4;

    .selected-count {
        @apply text-gray-500;
        font-size: 1.125rem;
        line-height: 1.40625rem;
    }

    .policy-list-data-table {
        /* custom design-system component - p-data-table */
        :deep(& .p-data-table) {
            min-height: unset;
        }
        .help-text-wrapper {
            height: 4.84375rem;
            .policy-list-invalid-text {
                @apply text-red-500;
                font-size: 0.875rem;
                line-height: 1.5rem;
                margin: 1rem 0 2.5rem 1rem;
            }
        }
    }
}
</style>
