<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PHeadingLayout, PHeading, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import AlertDetailDeleteModal from '@/services/alert-manager/v2/components/AlertDetailDeleteModal.vue';
import AlertDetailEditModal from '@/services/alert-manager/v2/components/AlertDetailEditModal.vue';
import { useAlertDetailGetQuery } from '@/services/alert-manager/v2/composables/use-alert-detail-get-query';
import { ALERT_PERIOD_DROPDOWN_MENU } from '@/services/alert-manager/v2/constants/alert-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/v2/stores/alert-page-store';
import type { Period } from '@/services/alert-manager/v2/types/alert-manager-type';

type ModalType = 'edit' | 'delete';

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const router = useRouter();
const route = useRoute();

const { hasReadWriteAccess } = usePageEditableStatus();
const { alertData } = useAlertDetailGetQuery(route.params.alertId as string);

const storeState = reactive({
    selectedServiceId: computed<string>(() => alertPageState.selectedServiceId),
    selectedStatus: computed<string>(() => alertPageState.selectedStatus),
    selectedUrgency: computed<string>(() => alertPageState.selectedUrgency),
    selectedSearchFilter: computed<string[]|undefined>(() => alertPageState.selectedSearchFilter),
    selectedLabels: computed<string|undefined>(() => (alertPageState.selectedLabels.length > 0 ? alertPageState.selectedLabels[0].name : undefined)),
    period: computed<Period>(() => alertPageState.selectedPeriod),
    selectedPeriodRange: computed<string>(() => alertPageState.selectedPeriodRange),
});
const state = reactive({
    menuItems: computed<MenuItem[]>(() => [
        {
            icon: 'ic_edit',
            name: 'edit',
            label: i18n.t('ALERT_MANAGER.EDIT_NAME'),
        },
        {
            icon: 'ic_delete',
            name: 'delete',
            label: i18n.t('ALERT_MANAGER.DELETE'),
        },
    ]),
});
const modalState = reactive({
    modalVisible: false,
    type: '' as ModalType,
});

const handleRouteBackButton = () => {
    const serviceId = route.params?.serviceId;
    if (serviceId) {
        router.go(-1);
    } else {
        router.push({
            name: ALERT_MANAGER_ROUTE.ALERTS._NAME,
            query: {
                serviceId: storeState.selectedServiceId,
                status: storeState.selectedStatus,
                urgency: storeState.selectedUrgency,
                filters: storeState.selectedSearchFilter,
                labels: storeState.selectedLabels,
                period: storeState.selectedPeriodRange === ALERT_PERIOD_DROPDOWN_MENU.CUSTOM ? `start=${storeState.period.start}&end=${storeState.period.end}` : undefined,
                range: storeState.selectedPeriodRange,
            },
        }).catch(() => {});
    }
};
const handleSelectDropdownMenu = (type: ModalType) => {
    modalState.modalVisible = true;
    modalState.type = type;
}; </script>

<template>
    <div class="alerts-detail-page pb-6">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="alertData?.title || ''"
                           show-back-button
                           @click-back-button="handleRouteBackButton"
                >
                    <template #title-right-extra>
                        <p-select-dropdown v-if="hasReadWriteAccess"
                                           :menu="state.menuItems"
                                           style-type="icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           use-fixed-menu-style
                                           class="bg-white rounded-full border border-gray-300"
                                           reset-selected-on-unmounted
                                           size="sm"
                                           @select="handleSelectDropdownMenu"
                        />
                    </template>
                </p-heading>
            </template>
        </p-heading-layout>
        <div v-if="hasReadWriteAccess && modalState.modalVisible">
            <alert-detail-edit-modal v-if="modalState.type === 'edit'"
                                     :alert-title="alertData?.title || ''"
                                     :alert-id="alertData?.alert_id || ''"
                                     :visible.sync="modalState.modalVisible"
            />
            <alert-detail-delete-modal v-if="modalState.type === 'delete'"
                                       :alert-id="alertData?.alert_id || ''"
                                       :visible.sync="modalState.modalVisible"
            />
        </div>
    </div>
</template>
