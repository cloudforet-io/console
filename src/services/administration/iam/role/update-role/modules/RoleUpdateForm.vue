<template>
    <div class="role-update-form">
        <role-update-page-base-information />
        <role-update-page-access-form />
        <policy-list-data-table :selectable="true"
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
        </policy-list-data-table>
    </div>
</template>

<script lang="ts">
import RoleUpdatePageBaseInformation from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageBaseInformation.vue';
import RoleUpdatePageAccessForm from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageAccessForm.vue';
import PolicyListDataTable from '@/services/administration/modules/PolicyListDataTable.vue';
import { PPanelTop } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'RoleUpdateForm',
    components: {
        RoleUpdatePageAccessForm,
        RoleUpdatePageBaseInformation,
        PolicyListDataTable,
        PPanelTop,
    },
    setup() {
        const state = reactive({
            selectedPolicyIdList: [] as string[],
        });
        const handleUpdate = (value: string[]) => { state.selectedPolicyIdList = value; };
        return {
            ...toRefs(state),
            handleUpdate,
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
}
</style>
