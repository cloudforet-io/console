<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PHeading } from '@spaceone/design-system';

import type { RoleCreateParameters } from '@/schema/identity/role/api-verbs/create';
import type { RoleUpdateParameters } from '@/schema/identity/role/api-verbs/update';
import type { RoleModel } from '@/schema/identity/role/model';
import type { Policy } from '@/schema/identity/role/type';
import { i18n } from '@/translations';

import type { PagePermission } from '@/lib/access-control/config';

import { useFormValidator } from '@/common/composables/form-validator';

import PolicyListDataTable from '@/services/administration/components/PolicyListDataTable.vue';
import RoleUpdatePageAccessForm from '@/services/administration/components/RoleUpdatePageAccessForm.vue';
import RoleUpdatePageBaseInformation from '@/services/administration/components/RoleUpdatePageBaseInformation.vue';
import { FORM_TYPE } from '@/services/administration/constants/role-constant';
import type { BaseInfoFormData } from '@/services/administration/types/role-form-type';

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
    baseInfoFormData: {} as BaseInfoFormData,
    pageAccessFormData: [] as PagePermission[],
    initialSelectedPolicyList: [] as Policy[],
    isAllValid: computed<boolean>(() => isPolicySectionValid.value && state.isBaseInformationValid),
    formData: computed<RoleCreateParameters|RoleUpdateParameters>(() => {
        const baseData = {
            name: state.baseInfoFormData.roleName.trim(),
            // TODO: will be check after api is merged
            api_permissions: [],
            page_permissions: state.pageAccessFormData,
            tags: {
                description: state.baseInfoFormData.roleDescription,
            },
        };
        return props.formType === FORM_TYPE.CREATE
            ? {
                ...baseData,
                role_type: state.baseInfoFormData.roleType,
            }
            : {
                ...baseData,
                role_id: props.initialRoleData.role_id,
            };
    }),
});

const {
    forms: {
        selectedApiPermissionList,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid: isPolicySectionValid,
} = useFormValidator({
    selectedApiPermissionList: [] as string[],
}, {
    selectedApiPermissionList(val: string[]) {
        if (!val.length) return i18n.t('IAM.ROLE.FORM.VALIDATION_API_POLICY');
        return true;
    },
});

const handleUpdatePolicy = (value) => { setForm('selectedApiPermissionList', value); };
const handleBaseInfoValidate = (value: boolean) => {
    state.isBaseInformationValid = value;
};
const handleUpdateBaseInfoForm = (value) => { state.baseInfoFormData = value; };
const handleUpdatePageAccessForm = (value) => { state.pageAccessFormData = value; };

watch(() => state.isAllValid, (after) => {
    emit('update-validation', after);
});
watch(() => state.formData, (after) => {
    emit('update-form-data', after);
});
watch(() => props.initialRoleData, (initialRoleData) => {
    const isObjectEmpty = !Object.keys(initialRoleData).length;
    if (isObjectEmpty) return;
    state.baseInfoFormData = {
        roleName: initialRoleData?.name,
        roleDescription: initialRoleData?.tags?.description,
        roleType: initialRoleData?.role_type,
    };
    state.pageAccessFormData = props.initialRoleData?.page_permissions;
    if (initialRoleData?.api_permissions?.length) {
        state.initialSelectedPolicyList = initialRoleData.api_permissions;
        setForm('selectedApiPermissionList', initialRoleData.api_permissions);
    }
});
</script>

<template>
    <div class="role-update-form">
        <role-update-page-base-information :initial-form-data="state.baseInfoFormData"
                                           :role-type-input-disabled="props.formType===FORM_TYPE.UPDATE"
                                           @update-validation="handleBaseInfoValidate"
                                           @update-form="handleUpdateBaseInfoForm"
        />
        <role-update-page-access-form :initial-page-permissions="state.pageAccessFormData"
                                      :role-type="state.baseInfoFormData.roleType"
                                      @update-form="handleUpdatePageAccessForm"
        />
        <policy-list-data-table class="policy-list-data-table"
                                :initial-policy-list="state.initialSelectedPolicyList"
                                :selectable="true"
                                @update-selected-policy-list="handleUpdatePolicy"
        >
            <template #panel-top>
                <p-heading heading-type="sub"
                           :title="$t('IAM.ROLE.DETAIL.API_POLICY')"
                >
                    <template #extra>
                        <span class="selected-count">({{ selectedApiPermissionList.length }} {{ $t('IAM.ROLE.FORM.SELECTED') }})</span>
                    </template>
                </p-heading>
            </template>
            <template #toolbox-table-bottom>
                <div class="help-text-wrapper">
                    <p v-if="invalidState.selectedApiPermissionList"
                       class="policy-list-invalid-text"
                    >
                        {{ invalidTexts.selectedApiPermissionList }}
                    </p>
                </div>
            </template>
        </policy-list-data-table>
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
