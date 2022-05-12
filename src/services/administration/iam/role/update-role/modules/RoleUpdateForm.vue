<template>
    <div class="role-update-form">
        <role-update-page-base-information @update-validation="handleBaseInfoValidate" />
        <role-update-page-access-form />
        <policy-list-data-table class="policy-list-data-table"
                                :selectable="true"
                                :anchor-icon-visible="true"
                                @update-selected-policy-id="handleUpdate"
        >
            <template #panel-top>
                <p-panel-top>
                    <!-- song-lang -->
                    API Policy Attachment
                    <template #extra>
                        <!--song-lang-->
                        <span class="selected-count">({{ selectedPolicyIdList.length }} {{ $t('selected') }})</span>
                    </template>
                </p-panel-top>
            </template>
            <template #toolbox-table-bottom>
                <div class="help-text-wrapper">
                    <p v-if="!isPolicySectionValid" class="policy-list-invalid-text">
                        {{ invalidTexts.selectedPolicyIdList }}
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
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { useFormValidator } from '@/common/composables/form-validator';
import { i18n } from '@/translations';

export default {
    name: 'RoleUpdateForm',
    components: {
        RoleUpdatePageAccessForm,
        RoleUpdatePageBaseInformation,
        PolicyListDataTable,
        PPanelTop,
    },
    setup(props, { emit }) {
        const {
            forms: {
                selectedPolicyIdList,
            },
            setForm,
            invalidTexts,
            isAllValid: isPolicySectionValid,
        } = useFormValidator({
            selectedPolicyIdList: [],
        }, {
            selectedPolicyIdList(value: string[]) { return value.length ? '' : i18n.t('At least one API policy must be attached.'); }, // song-lang
        });
        const state = reactive({
            isBaseInformationValid: false,
            isAllValid: computed(() => isPolicySectionValid.value && state.isBaseInformationValid),
        });
        const handleUpdate = (value) => { setForm('selectedPolicyIdList', value); };
        const handleBaseInfoValidate = (value: boolean) => {
            state.isBaseInformationValid = value;
        };

        watch(() => state.isAllValid, (after) => {
            emit('update-validation', after);
        });
        return {
            ...toRefs(state),
            handleUpdate,
            handleBaseInfoValidate,
            selectedPolicyIdList,
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
