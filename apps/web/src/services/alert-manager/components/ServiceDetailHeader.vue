<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PHeadingLayout, PSelectDropdown, PLink, PI, PTooltip,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/controls/context-menu/type';

import { MEMBERS_TYPE } from '@/schema/alert-manager/service/constants';
import { i18n } from '@/translations';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { gray } from '@/styles/colors';

import ServiceDetailDeleteModal from '@/services/alert-manager/components/ServiceDetailDeleteModal.vue';
import ServiceDetailEditModal from '@/services/alert-manager/components/ServiceDetailEditModal.vue';
import ServiceDetailMemberModal from '@/services/alert-manager/components/ServiceDetailMemberModal.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { Service } from '@/services/alert-manager/types/alert-manager-type';

type ModalType = 'edit' | 'delete' | 'member';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
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

const handleActionModal = (type: ModalType) => {
    modalState.modalVisible = true;
    modalState.type = type;
};
const handleGoBackButton = () => {
    router.push(getProperRouteLocation({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }));
};
</script>

<template>
    <div class="service-detail-header">
        <div class="flex flex-col pb-6 gap-1">
            <p-heading-layout>
                <template #heading>
                    <p-heading :title="storeState.serviceInfo.name"
                               show-back-button
                               @click-back-button="handleGoBackButton"
                    >
                        <template #title-right-extra>
                            <p-select-dropdown :menu="state.menuItems"
                                               style-type="icon-button"
                                               button-icon="ic_ellipsis-horizontal"
                                               use-fixed-menu-style
                                               class="bg-white rounded-full border border-gray-300"
                                               reset-selected-on-unmounted
                                               size="sm"
                                               @select="handleActionModal"
                            />
                        </template>
                    </p-heading>
                </template>
                <template #extra>
                    <p-link :to="getProperRouteLocation({ name: ALERT_MANAGER_ROUTE.ALERTS._NAME })"
                            action-icon="internal-link"
                            new-tab
                            class="text-label-md"
                    >
                        <span class="pr-0.5">{{ $t('ALERT_MANAGER.SERVICE.SHOW_IN_ALERTS') }}</span>
                    </p-link>
                </template>
            </p-heading-layout>
            <div class="flex items-center pl-10 text-label-sm gap-2">
                <div class="service-member flex items-center text-gray-700 gap-0.5"
                     @click="handleActionModal('member')"
                >
                    <p-i class="select-marker"
                         name="ic_member"
                         width="0.75rem"
                         height="0.75rem"
                    />
                    <span>{{ storeState.serviceInfo.members[MEMBERS_TYPE.USER_GROUP]?.length }}</span>
                    <span>{{ $t('ALERT_MANAGER.SERVICE.USER_GROUP') }}</span>
                    <span> / </span>
                    <span>{{ storeState.serviceInfo.members[MEMBERS_TYPE.USER]?.length }}</span>
                    <span>{{ $t('ALERT_MANAGER.SERVICE.MEMBERS') }}</span>
                </div>
                <p-i v-if="storeState.serviceInfo?.description"
                     name="ic_dot"
                     width="0.125rem"
                     height="0.125rem"
                     :color="gray[500]"
                     class="dot"
                />
                <p class="flex-1 truncate">
                    <p-tooltip position="bottom"
                               tag="p"
                               class="flex-1 truncate"
                               :contents="storeState.serviceInfo?.description || ''"
                    >
                        {{ storeState.serviceInfo?.description }}
                    </p-tooltip>
                </p>
            </div>
        </div>
        <div v-if="modalState.modalVisible">
            <service-detail-edit-modal v-if="modalState.type === 'edit'"
                                       :visible.sync="modalState.modalVisible"
            />
            <service-detail-delete-modal v-if="modalState.type === 'delete'"
                                         :visible.sync="modalState.modalVisible"
            />
            <service-detail-member-modal v-if="modalState.type === 'member'"
                                         :visible.sync="modalState.modalVisible"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-header {
    .service-member {
        &:hover {
            @apply cursor-pointer;
        }
    }
}
</style>
