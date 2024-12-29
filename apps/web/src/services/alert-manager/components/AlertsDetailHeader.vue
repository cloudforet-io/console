<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeadingLayout, PHeading, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/controls/context-menu/type';

import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { i18n } from '@/translations';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import AlertDetailDeleteModal from '@/services/alert-manager/components/AlertDetailDeleteModal.vue';
import AlertDetailEditModal from '@/services/alert-manager/components/AlertDetailEditModal.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useAlertDetailPageStore } from '@/services/alert-manager/stores/alert-detail-page-store';

type ModalType = 'edit' | 'delete';

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();
const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
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
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE.ALERTS._NAME,
    }));
};
const handleSelectDropdownMenu = (type: ModalType) => {
    modalState.modalVisible = true;
    modalState.type = type;
}; </script>

<template>
    <div class="alerts-detail-page pb-6">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="storeState.alertInfo.title || ''"
                           show-back-button
                           @click-back-button="handleRouteBackButton"
                >
                    <template #title-right-extra>
                        <span class="text-label-xl text-gray-700 mr-2">NO. {{ storeState.alertInfo.alert_id?.split('-')[2] }}</span>
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
                                     :visible.sync="modalState.modalVisible"
            />
            <alert-detail-delete-modal v-if="modalState.type === 'delete'"
                                       :visible.sync="modalState.modalVisible"
            />
        </div>
    </div>
</template>
