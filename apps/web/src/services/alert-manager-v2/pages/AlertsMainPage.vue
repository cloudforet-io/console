<script setup lang="ts">
import { PHeadingLayout, PHeading, PButton } from '@cloudforet/mirinae';

import AlertsManagementTable from '@/services/alert-manager-v2/components/AlertsManagementTable.vue';

const handleClickCreateButton = () => {
    console.log('TODO: handleClickCreateButton');
};
</script>

<template>
    <div class="alerts-main-page">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="$t('MENU.ALERT_MANAGER_ALERTS')" />
            </template>
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleClickCreateButton"
                >
                    {{ $t('ALERT_MANAGER.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <div class="mt-6">
            <alerts-management-table />
        </div>
    </div>
</template>
