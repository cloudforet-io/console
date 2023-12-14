<script lang="ts" setup>
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHorizontalLayout, PHeading, PButton,
} from '@spaceone/design-system';

import AppManagementTable from '@/services/administration/components/AppManagementTable.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';

const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const router = useRouter();

/* Component */
const handleCreateApp = () => {
    router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME });
};

onUnmounted(() => {
    appPageStore.$dispose();
    appPageStore.$reset();
});
</script>

<template>
    <section class="app-page">
        <p-heading :title="$t('IAM.APP.TITLE')"
                   use-selected-count
                   use-total-count
                   :total-count="appPageState.totalCount"
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateApp"
                >
                    {{ $t('IAM.APP.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <app-management-table :table-height="height" />
            </template>
        </p-horizontal-layout>
    </section>
</template>

<style lang="postcss" scoped>
.app-page {
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
