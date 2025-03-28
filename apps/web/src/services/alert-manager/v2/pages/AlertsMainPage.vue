<script setup lang="ts">
import { reactive } from 'vue';

import { PHeadingLayout, PHeading, PButton } from '@cloudforet/mirinae';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import AlertCreateModal from '@/services/alert-manager/v2/components/AlertCreateModal.vue';
import AlertsManagementTable from '@/services/alert-manager/v2/components/AlertsManagementTable.vue';

const { hasReadWriteAccess } = usePageEditableStatus();

const state = reactive({
    createModalVisible: false,
});

const handleClickCreateButton = () => {
    state.createModalVisible = true;
};
</script>

<template>
    <div class="alerts-main-page">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="$t('MENU.ALERT_MANAGER_ALERTS')" />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
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
        <alert-create-modal v-if="hasReadWriteAccess && state.createModalVisible"
                            :visible.sync="state.createModalVisible"
        />
    </div>
</template>
