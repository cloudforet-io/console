<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PHeading, PHeadingLayout, PSelectDropdown, PI, PTooltip, PButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import { MEMBERS_TYPE } from '@/schema/alert-manager/service/constants';
import { i18n } from '@/translations';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { gray } from '@/styles/colors';

import ServiceDetailDeleteModal from '@/services/alert-manager/v2/components/ServiceDetailDeleteModal.vue';
import ServiceDetailEditModal from '@/services/alert-manager/v2/components/ServiceDetailEditModal.vue';
import ServiceDetailMemberModal from '@/services/alert-manager/v2/components/ServiceDetailMemberModal.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import { useServiceListPageStore } from '@/services/alert-manager/v2/stores/service-list-page-store';
import type { Service } from '@/services/alert-manager/v2/types/alert-manager-type';

type ModalType = 'edit' | 'delete' | 'member' | 'alert';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const serviceListPageStore = useServiceListPageStore();

const router = useRouter();
const route = useRoute();

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    eventRuleList: computed<EventRuleModel[]>(() => serviceDetailPageState.eventRuleList),
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
});
const state = reactive({
    isSettingMode: computed<boolean>(() => route.query?.mode !== 'eventRule'),
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
    headingTitle: computed(() => {
        if (state.isSettingMode) {
            return storeState.serviceInfo.name || '';
        }
        return i18n.t('ALERT_MANAGER.EVENT_RULE.TITLE');
    }),
});
const modalState = reactive({
    modalVisible: false,
    type: '' as ModalType,
});

const handleClickAddRule = () => {
    serviceDetailPageStore.setEventRuleScopeModalVisible(true);
};
const handleActionModal = (type: ModalType) => {
    modalState.modalVisible = true;
    modalState.type = type;
};
const handleGoBackButton = () => {
    if (state.isSettingMode) {
        const validUnhealthyPage = (!Number.isNaN(serviceListPageStore.unhealthyThisPage) && serviceListPageStore.unhealthyThisPage > 0)
            ? serviceListPageStore.unhealthyThisPage
            : 1;
        const validHealthyPage = (!Number.isNaN(serviceListPageStore.healthyThisPage) && serviceListPageStore.healthyThisPage > 0)
            ? serviceListPageStore.healthyThisPage
            : 1;

        router.push({
            name: ALERT_MANAGER_ROUTE.SERVICE._NAME,
            query: {
                unhealthyPage: validUnhealthyPage.toString(),
                healthyPage: validHealthyPage.toString(),
                serviceName: route.query.filterService,
            },
        }).catch(() => {});
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
                    <p-heading :title="state.headingTitle"
                               show-back-button
                               @click-back-button="handleGoBackButton"
                    >
                        <template #title-right-extra>
                            <p-select-dropdown v-if="hasReadWriteAccess && state.isSettingMode"
                                               :menu="state.menuItems"
                                               style-type="icon-button"
                                               button-icon="ic_ellipsis-horizontal"
                                               use-fixed-menu-style
                                               class="bg-white rounded-full border border-gray-300"
                                               reset-selected-on-unmounted
                                               size="sm"
                                               @select="handleActionModal"
                            />
                            <div v-else
                                 class="inline-flex items-center gap-1 text-gray-700 text-label-sm"
                            >
                                <p-i name="ic_info-circle"
                                     class="title-tooltip"
                                     height="0.875rem"
                                     width="0.875rem"
                                />
                                <span>{{ $t('ALERT_MANAGER.EVENT_RULE.DESC') }}</span>
                            </div>
                        </template>
                    </p-heading>
                </template>
                <template v-if="hasReadWriteAccess && !state.isSettingMode && storeState.eventRuleList.length > 0"
                          #extra
                >
                    <p-button icon-left="ic_plus_bold"
                              class="self-start mx-auto"
                              @click="handleClickAddRule"
                    >
                        {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_ADD_RULE') }}
                    </p-button>
                </template>
            </p-heading-layout>
            <div v-if="state.isSettingMode"
                 class="flex items-center pl-10 text-label-sm gap-2"
            >
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
