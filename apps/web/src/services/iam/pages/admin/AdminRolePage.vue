<script lang="ts" setup>
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHorizontalLayout, PHeading, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import RoleManagementTab from '@/services/iam/components/RoleManagementTab.vue';
import RoleManagementTable from '@/services/iam/components/RoleManagementTable.vue';
import { ADMIN_IAM_ROUTE } from '@/services/iam/routes/admin/route-constant';
import { useRolePageStore } from '@/services/iam/store/role-page-store';

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();

/* Component */
const handleCreateRole = () => {
    router.push({ name: ADMIN_IAM_ROUTE.ROLE.CREATE._NAME });
};

onUnmounted(() => {
    rolePageStore.$dispose();
    rolePageStore.$reset();
});
</script>

<template>
    <section class="role-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.ROLE.ROLE')"
                           use-selected-count
                           use-total-count
                           :total-count="rolePageState.totalCount"
                           :selected-count="rolePageState.selectedIndices.length"
                />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateRole"
                >
                    {{ $t('IAM.ROLE.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <role-management-table :table-height="height"
                                       :has-read-write-access="hasReadWriteAccess"
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
