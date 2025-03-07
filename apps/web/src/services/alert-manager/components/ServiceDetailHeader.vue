<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHeading, PHeadingLayout, PSelectDropdown, PI, PTooltip, PButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/controls/context-menu/type';

import { MEMBERS_TYPE } from '@/schema/alert-manager/service/constants';
import { i18n } from '@/translations';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

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

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
});
const state = reactive({
    menuItems: computed<MenuItem[]>(() => [
        {
            icon: 'ic_settings',
            name: 'edit',
            label: i18n.t('ALERT_MANAGER.UPDATE'),
        },
        { type: 'divider' },
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
    if (state.isSettingMode) {
        router.push({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }).catch(() => {});
        return;
    }
    replaceUrlQuery({
        mode: 'settings',
    });
};
</script>

<template>
    <div class="service-detail-header">
        <div class="flex flex-col pb-6 gap-1">
            <p-heading-layout>
                <template #heading>
                    <p-heading :title="storeState.serviceInfo.name || ''"
                               show-back-button
                               class="flex items-center gap-2"
                               @click-back-button="handleGoBackButton"
                    >
                        <template #title-right-extra>
                            <p-button style-type="tertiary"
                                      size="sm"
                                      class="flex gap-0.5"
                                      @click="handleActionModal('member')"
                            >
                                <p-i class="select-marker"
                                     name="ic_member"
                                     width="0.75rem"
                                     height="0.75rem"
                                />
                                <span>{{ $t('ALERT_MANAGER.SERVICE.USER_GROUP') }}</span>
                                <span>({{ storeState.serviceInfo.members[MEMBERS_TYPE.USER_GROUP]?.length }}) </span>
                                <span> / </span>
                                <span> {{ $t('ALERT_MANAGER.SERVICE.MEMBERS') }}</span>
                                <span>({{ storeState.serviceInfo.members[MEMBERS_TYPE.USER]?.length }})</span>
                            </p-button>
                            <p-select-dropdown v-if="hasReadWriteAccess"
                                               :menu="state.menuItems"
                                               style-type="icon-button"
                                               button-icon="ic_ellipsis-horizontal"
                                               use-fixed-menu-style
                                               class="bg-white rounded-md border border-gray-300"
                                               reset-selected-on-unmounted
                                               size="sm"
                                               @select="handleActionModal"
                            />
                        </template>
                    </p-heading>
                </template>
            </p-heading-layout>
            <div class="flex items-center pl-10 text-label-sm gap-2">
                <p class="flex-1 truncate">
                    <p-tooltip position="bottom"
                               tag="p"
                               class="desc truncate"
                               :contents="storeState.serviceInfo?.description || ''"
                    >
                        {{ storeState.serviceInfo?.description }}
                    </p-tooltip>
                </p>
            </div>
        </div>
        <div v-if="modalState.modalVisible">
            <service-detail-edit-modal v-if="hasReadWriteAccess && modalState.type === 'edit'"
                                       :visible.sync="modalState.modalVisible"
            />
            <service-detail-delete-modal v-if="hasReadWriteAccess && modalState.type === 'delete'"
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
    .desc {
        width: fit-content;
        max-width: 100%;
    }
}
</style>
