<script lang="ts" setup>
import {
    PHorizontalLayout, PHeading,
} from '@spaceone/design-system';
import {
    onUnmounted, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import UserManagementTab from '@/services/administration/iam/user/modules/user-management-tab/UserManagementTab.vue';
import UserManagementTable from '@/services/administration/iam/user/modules/UserManagementTable.vue';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const { t } = useI18n();

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    hasManagePermission: useManagePermissionState(),
});

onUnmounted(() => {
    userPageStore.$dispose();
    userPageStore.$reset();
});

</script>

<template>
    <section class="user-page">
        <p-heading :title="t('IDENTITY.USER.MAIN.TITLE')"
                   use-selected-count
                   use-total-count
                   :total-count="userPageState.totalCount"
                   :selected-count="userPageState.selectedIndices.length"
        />
        <p-horizontal-layout class="user-toolbox-layout">
            <template #container="{ height }">
                <user-management-table :table-height="height"
                                       :manage-disabled="!state.hasManagePermission"
                />
            </template>
        </p-horizontal-layout>
        <user-management-tab :manage-disabled="!state.hasManagePermission" />
    </section>
</template>

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
