<script setup lang="ts">
import { computed } from 'vue';

import { PFieldTitle, PDataTable } from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n } from '@/translations';

import { useAssociatedCategoriesToPackage } from '@/services/ops-flow/composables/use-associated-categories-to-package';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();
const { associatedCategoriesToPackage } = useAssociatedCategoriesToPackage({
    packageId: computed(() => taskManagementPageStore.state.targetPackageId),
});
const fields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: i18n.t('OPSFLOW.NAME') as string,
        width: '30%',
    },
    {
        name: 'description',
        label: i18n.t('OPSFLOW.DESCRIPTION') as string,
        width: '70%',
    },
]);
</script>

<template>
    <div>
        <p-field-title class="mb-2"
                       color="gray"
        >
            {{ $t('OPSFLOW.TARGET_LIST', {target: $t('OPSFLOW.CATEGORY')}) }}
        </p-field-title>
        <p-data-table :fields="fields"
                      :items="associatedCategoriesToPackage"
        />
    </div>
</template>

