<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';

import {
    PHeading,
    PButton,
    PHeadingLayout,
} from '@cloudforet/mirinae';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import AlertCreateModal from '@/services/alert-manager/v2/components/AlertCreateModal.vue';
import AlertsManagementTable from '@/services/alert-manager/v2/components/AlertsManagementTable.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';


const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo?.service_id),
});
const state = reactive({
    modalVisible: false,
});
const handleCreateAlertModal = () => {
    state.modalVisible = true;
};
</script>

<template>
    <div class="service-detail-tabs-alert">
        <p-heading-layout class="pt-8 px-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.ALERTS.TITLE')"
                />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button icon-left="ic_plus_bold"
                          class="self-start mx-auto"
                          @click="handleCreateAlertModal"
                >
                    {{ $t('ALERT_MANAGER.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <alerts-management-table />
        <alert-create-modal v-if="state.modalVisible"
                            :service-id="storeState.serviceId"
                            :visible.sync="state.modalVisible"
        />
    </div>
</template>
