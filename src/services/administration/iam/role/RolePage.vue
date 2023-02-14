<template>
    <section class="role-page">
        <p-heading :title="$t('IAM.ROLE.ROLE')"
                   use-selected-count
                   use-total-count
                   :total-count="totalCount"
                   :selected-count="selectedIndices.length"
        />
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <role-management-table :table-height="height"
                                       :manage-disabled="!hasManagePermission"
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
} from 'vue';

import {
    PHorizontalLayout, PHeading,
} from '@spaceone/design-system';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import RoleManagementTab from '@/services/administration/iam/role/modules/role-management-tab/RoleManagementTab.vue';
import RoleManagementTable from '@/services/administration/iam/role/modules/role-managemnet-table/RoleManagementTable.vue';

export default defineComponent({
    name: 'RolePage',
    components: {
        RoleManagementTab,
        PHorizontalLayout,
        PHeading,
        RoleManagementTable,
    },
    setup() {
        const state = reactive({
            totalCount: 0,
            selectedIndices: [] as number[],
            hasManagePermission: useManagePermissionState(),
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

/* custom design-system component - p-horizontal-layout */
:deep(.role-toolbox-layout) {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
