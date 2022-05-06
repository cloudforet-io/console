<template>
    <section class="role-page">
        <p-page-title title="Role"
                      use-selected-count
                      use-total-count
                      :total-count="totalCount"
                      :selected-count="selectedIndices.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <role-management-table :table-height="height"
                                       @update-selected-indices="handleUpdate"
                                       @update-total-count="handleUpdate"
                />
            </template>
        </p-horizontal-layout>
        <role-management-tab />
    </section>
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PPageTitle, PToolboxTable, PSelectDropdown,
} from '@spaceone/design-system';
import RoleManagementTable from '@/services/administration/iam/role/modules/RoleManagementTable.vue';
import RoleManagementTab from '@/services/administration/iam/role/modules/RoleManagementTab.vue';

export default defineComponent({
    name: 'RolePage',
    components: {
        RoleManagementTab,
        PHorizontalLayout,
        PPageTitle,
        PToolboxTable,
        PSelectDropdown,
        RoleManagementTable,
    },
    setup() {
        const state = reactive({
            totalCount: 0,
            selectedIndices: [] as number[],
        });
        const handleUpdate = (value: number[] | number) => {
            if (Array.isArray(value)) {
                state.selectedIndices = value;
            } else {
                state.totalCount = value;
            }
        };

        return {
            ...toRefs(state),
            handleUpdate,
        };
    },

});
</script>

<style lang="postcss" scoped>
.role-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
