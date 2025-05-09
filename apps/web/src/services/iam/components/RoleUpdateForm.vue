<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleCreateParameters } from '@/api-clients/identity/role/schema/api-verbs/create';
import type { RoleUpdateParameters } from '@/api-clients/identity/role/schema/api-verbs/update';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';

import RoleUpdateFormBaseInformation from '@/services/iam/components/RoleUpdateFormBaseInformation.vue';
import RoleUpdateFormPermissionForm from '@/services/iam/components/RoleUpdateFormPermissionForm.vue';
import RoleUpdateFormRoleType from '@/services/iam/components/RoleUpdateFormRoleType.vue';
import { FORM_TYPE } from '@/services/iam/constants/role-constant';
import type { RoleFormData } from '@/services/iam/types/role-type';

interface Props {
    initialRoleData?: RoleModel;
    formType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    initialRoleData: undefined,
    formType: FORM_TYPE.CREATE,
});

const emit = defineEmits<{(e: 'update-validation', after: boolean): void,
    (e: 'update-form-data', after: RoleCreateParameters|RoleUpdateParameters): void,
}>();

const state = reactive({
    isBaseInformationValid: false,
    baseInfoFormData: '' as string,
    roleTypeData: ROLE_TYPE.DOMAIN_ADMIN as RoleType,
    pageAccessFormData: ['*'] as string[],
    changedPageAccessFormData: ['*'] as string[],
    permissionsData: undefined as string[]|undefined,
    isPageAccessValid: false,
    isPolicyValid: true,
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
                role_id: props.initialRoleData?.role_id || '',
            };
    }),
});

/* Components */
const handleBaseInfoValidate = (value: boolean) => {
    state.isBaseInformationValid = value;
};
const handleUpdateForm = (formData: RoleFormData) => {
    if (formData.name) state.baseInfoFormData = formData.name;
    if (formData.role_type) {
        state.roleTypeData = formData.role_type;
        state.pageAccessFormData = props.formType === FORM_TYPE.CREATE ? ['*'] : state.pageAccessFormData;
    }
    if (formData.page_access) state.changedPageAccessFormData = formData.page_access;
    if (formData.permissions) state.permissionsData = formData.permissions;
};

/* Watcher */
watch(() => state.isAllValid, (after) => {
    emit('update-validation', after);
});
watch(() => state.formData, (after) => {
    emit('update-form-data', after);
});
// update mode
watch(() => props.initialRoleData, (initialRoleData) => {
    if (isEmpty(initialRoleData)) return;
    state.baseInfoFormData = initialRoleData?.name;
    state.roleTypeData = initialRoleData?.role_type;
    state.pageAccessFormData = initialRoleData?.page_access;
    state.permissionsData = initialRoleData?.permissions;
});
</script>

<template>
    <div class="role-update-form">
        <role-update-form-base-information :initial-data="state.baseInfoFormData"
                                           @update-validation="handleBaseInfoValidate"
                                           @update-form="handleUpdateForm"
        />
        <role-update-form-role-type :initial-data="state.roleTypeData"
                                    :form-type="props.formType"
                                    @update-form="handleUpdateForm"
        />
        <role-update-form-permission-form :initial-page-access="state.pageAccessFormData"
                                          :initial-permissions="state.permissionsData"
                                          :is-page-access-valid.sync="state.isPageAccessValid"
                                          :is-policy-valid.sync="state.isPolicyValid"
                                          :role-type="state.roleTypeData"
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
