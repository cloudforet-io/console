<script lang="ts" setup>
import { PHeading } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type { RawPagePermission } from '@/lib/access-control/config';

import { useFormValidator } from '@/common/composables/form-validator';

import type { FormType } from '@/services/administration/iam/role/config';
import { FORM_TYPE } from '@/services/administration/iam/role/config';
import RoleUpdatePageAccessForm from '@/services/administration/iam/role/role-update/modules/RoleUpdatePageAccessForm.vue';
import RoleUpdatePageBaseInformation from '@/services/administration/iam/role/role-update/modules/RoleUpdatePageBaseInformation.vue';
import type { Policy, RoleData, BaseInfoFormData } from '@/services/administration/iam/role/type';
import PolicyListDataTable from '@/services/administration/modules/PolicyListDataTable.vue';

interface Props {
    initialRoleData: RoleData;
    formType: FormType;
}

const props = withDefaults(defineProps<Props>(), {
    initialRoleData: () => ({}) as RoleData,
    formType: FORM_TYPE.CREATE,
});
const emit = defineEmits(['update-validation', 'update-form-data']);
const { t } = useI18n();

const {
    forms: {
        selectedPolicyList,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid: isPolicySectionValid,
} = useFormValidator({
    selectedPolicyList: [] as Policy[],
}, {
    selectedPolicyList(val: Policy[]) {
        if (!val.length) return t('IAM.ROLE.FORM.VALIDATION_API_POLICY');
        return true;
    },
});
const state = reactive({
    isBaseInformationValid: false,
    baseInfoFormData: {} as BaseInfoFormData,
    pageAccessFormData: [] as RawPagePermission[],
    initialSelectedPolicyList: [] as Policy[],
    isAllValid: computed(() => isPolicySectionValid.value && state.isBaseInformationValid),
    formData: computed(() => ({
        name: state.baseInfoFormData.roleName?.trim(),
        role_type: state.baseInfoFormData.roleType,
        policies: selectedPolicyList.value,
        page_permissions: state.pageAccessFormData,
        tags: {
            description: state.baseInfoFormData.roleDescription,
        },
    })),
});
const handleUpdatePolicy = (value) => { setForm('selectedPolicyList', value); };
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
    if (initialRoleData?.policies?.length) {
        state.initialSelectedPolicyList = initialRoleData.policies;
        setForm('selectedPolicyList', initialRoleData.policies);
    }
});

</script>

<template>
    <div class="role-update-form">
        <role-update-page-base-information :initial-form-data="state.baseInfoFormData"
                                           :role-type-input-disabled="formType===FORM_TYPE.UPDATE"
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
                           :title="t('IAM.ROLE.DETAIL.API_POLICY')"
                >
                    <template #extra>
                        <span class="selected-count">({{ selectedPolicyList.length }} {{ t('IAM.ROLE.FORM.SELECTED') }})</span>
                    </template>
                </p-heading>
            </template>
            <template #toolbox-table-bottom>
                <div class="help-text-wrapper">
                    <p v-if="invalidState.selectedPolicyList"
                       class="policy-list-invalid-text"
                    >
                        {{ invalidTexts.selectedPolicyList }}
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
