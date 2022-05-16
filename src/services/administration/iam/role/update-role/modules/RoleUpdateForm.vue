<template>
    <div class="role-update-form">
        <role-update-page-base-information :initial-form-data="baseInfoFormData" @update-validation="handleBaseInfoValidate"
                                           @update-form="handleUpdateBaseInfoForm"
        />
        <role-update-page-access-form :initial-page-permissions="pageAccessFormData"
                                      @update-form="handleUpdatePageAccessForm"
        />
        <policy-list-data-table class="policy-list-data-table"
                                :initial-ploicy-list="selectedPolicyList"
                                :selectable="true"
                                :anchor-icon-visible="true"
                                @update-selected-policy-list="handleUpdatePolicy"
        >
            <template #panel-top>
                <p-panel-top>
                    {{ $t('IAM.ROLE.DETAIL.API_POLICY') }}
                    <template #extra>
                        <span class="selected-count">({{ selectedPolicyList.length }} {{ $t('IAM.ROLE.FORM.SELECTED') }})</span>
                    </template>
                </p-panel-top>
            </template>
            <template #toolbox-table-bottom>
                <div class="help-text-wrapper">
                    <p v-if="!isPolicySectionValid" class="policy-list-invalid-text">
                        {{ invalidTexts.selectedPolicyList }}
                    </p>
                </div>
            </template>
        </policy-list-data-table>
    </div>
</template>

<script lang="ts">
import RoleUpdatePageBaseInformation from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageBaseInformation.vue';
import RoleUpdatePageAccessForm from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageAccessForm.vue';
import PolicyListDataTable from '@/services/administration/modules/PolicyListDataTable.vue';
import { PPanelTop } from '@spaceone/design-system';
import {
    computed, PropType, reactive, toRefs, watch,
} from '@vue/composition-api';
import { useFormValidator } from '@/common/composables/form-validator';
import { i18n } from '@/translations';
import { ROLE_TYPE } from '@/services/administration/iam/role/config';
import { PagePermission } from '@/lib/access-control/page-permission-helper';
import { Policy, RoleData } from '@/services/administration/iam/role/type';

export interface BaseInfoFormData {
    roleName: string;
    roleDescription?: string;
    roleType: ROLE_TYPE;
}
export default {
    name: 'RoleUpdateForm',
    components: {
        RoleUpdatePageAccessForm,
        RoleUpdatePageBaseInformation,
        PolicyListDataTable,
        PPanelTop,
    },
    props: {
        initialRoleData: {
            type: Object as PropType<RoleData>,
            default: {},
        },
    },
    setup(props, { emit }) {
        const {
            forms: {
                selectedPolicyList,
            },
            setForm,
            invalidTexts,
            isAllValid: isPolicySectionValid,
        } = useFormValidator({
            selectedPolicyList: [],
        }, {
            selectedPolicyList(value: Policy[]) { return value.length ? '' : i18n.t('IAM.ROLE.FORM.VALIDATION_API_POLICY'); },
        });
        const state = reactive({
            isBaseInformationValid: false,
            baseInfoFormData: {} as BaseInfoFormData,
            pageAccessFormData: [] as PagePermission[],
            isAllValid: computed(() => isPolicySectionValid.value && state.isBaseInformationValid),
            formData: computed(() => ({
                name: state.baseInfoFormData.roleName,
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
            if (!initialRoleData) return;
            state.baseInfoFormData = {
                roleName: initialRoleData.name,
                roleDescription: initialRoleData.tags?.description,
                roleType: initialRoleData.role_type,
            };
            state.pageAccessFormData = props.initialRoleData.page_permissions;
            setForm('selectedPolicyList', initialRoleData.policies?.map(p => p.policy_id));
        });
        return {
            ...toRefs(state),
            handleUpdatePolicy,
            handleBaseInfoValidate,
            handleUpdateBaseInfoForm,
            handleUpdatePageAccessForm,
            selectedPolicyList,
            invalidTexts,
            isPolicySectionValid,
        };
    },
};
</script>
<style lang="postcss" scoped>
.role-update-form {
    @apply flex flex-col flex-wrap gap-4;

    .selected-count {
        @apply text-gray-500;
        font-size: 1.125rem;
        line-height: 1.40625rem;
    }
    .policy-list-data-table {
        &::v-deep .p-data-table {
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
