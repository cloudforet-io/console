<template>
    <section class="user-page">
        <p-heading :title="$t('IDENTITY.USER.MAIN.TITLE')"
                   use-selected-count
                   use-total-count
                   :total-count="userPageState.totalCount"
                   :selected-count="userPageState.selectedIndices.length"
        />
        <p-horizontal-layout class="user-toolbox-layout">
            <template #container="{ height }">
                <user-management-table :table-height="height"
                                       :manage-disabled="!hasManagePermission"
                />
            </template>
        </p-horizontal-layout>
        <user-management-tab :manage-disabled="!hasManagePermission" />
    </section>
</template>

<script lang="ts">
import {
    onUnmounted, reactive, toRefs,
} from 'vue';

import {
    PHorizontalLayout, PHeading,
} from '@spaceone/design-system';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import UserManagementTab from '@/services/administration/components/UserManagementTab.vue';
import UserManagementTable from '@/services/administration/components/UserManagementTable.vue';
import { userStateFormatter } from '@/services/administration/helpers/user-management-tab-helpers';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

export default {
    name: 'UserPage',
    components: {
        UserManagementTable,
        UserManagementTab,
        PHorizontalLayout,
        PHeading,
    },
    setup() {
        const userPageStore = useUserPageStore();
        const userPageState = userPageStore.$state;

        const state = reactive({
            hasManagePermission: useManagePermissionState(),
        });

        onUnmounted(() => {
            userPageStore.$dispose();
            userPageStore.$reset();
        });

        return {
            ...toRefs(state),
            userPageState,
            userStateFormatter,
        };
    },

};
</script>

<style lang="postcss" scoped>
.user-page {
    @apply mx-0;
    max-width: 100%;
}

/* custom design-system component - p-horizontal-layout */
:deep(.user-toolbox-layout) {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
