<script lang="ts" setup>
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHorizontalLayout, PHeading, PButton,
} from '@spaceone/design-system';

import RoleManagementTab from '@/services/administration/components/RoleManagementTab.vue';
import RoleManagementTable from '@/services/administration/components/RoleManagementTable.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const router = useRouter();

/* Component */
const handleCreateRole = () => {
    router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME });
};

onUnmounted(() => {
    rolePageStore.$dispose();
    rolePageStore.$reset();
});
</script>

<template>
    <section class="role-page">
        <p-heading :title="$t('IAM.ROLE.ROLE')"
                   use-selected-count
                   use-total-count
                   :total-count="rolePageState.totalCount"
                   :selected-count="rolePageState.selectedIndices.length"
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateRole"
                >
                    {{ $t('IAM.ROLE.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <role-management-table :table-height="height" />
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
