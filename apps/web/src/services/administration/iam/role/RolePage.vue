<script lang="ts" setup>
import {
    PHorizontalLayout, PHeading,
} from '@spaceone/design-system';
import {
    onUnmounted, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import RoleManagementTab from '@/services/administration/iam/role/modules/role-management-tab/RoleManagementTab.vue';
import RoleManagementTable from '@/services/administration/iam/role/modules/role-managemnet-table/RoleManagementTable.vue';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const { t } = useI18n();

const state = reactive({
    hasManagePermission: useManagePermissionState(),
});

onUnmounted(() => {
    rolePageStore.$dispose();
    rolePageStore.$reset();
});

</script>

<template>
    <section class="role-page">
        <p-heading :title="t('IAM.ROLE.ROLE')"
                   use-selected-count
                   use-total-count
                   :total-count="rolePageState.totalCount"
                   :selected-count="rolePageState.selectedIndices.length"
        />
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <role-management-table :table-height="height"
                                       :manage-disabled="!state.hasManagePermission"
                />
            </template>
        </p-horizontal-layout>
        <role-management-tab />
    </section>
</template>

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
