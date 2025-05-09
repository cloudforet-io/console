<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PScopedNotification, PLink, PDataTable, PStatus, PI, PLazyImg,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EscalationPolicyListParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import type { ServiceChannelDeleteParameters } from '@/schema/alert-manager/service-channel/api-verbs/delete';
import { SERVICE_CHANNEL_TYPE } from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { alertManagerStateFormatter, getProtocolInfo } from '@/services/alert-manager/v2/composables/refined-table-data';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { ProtocolCardItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    selectedItem?: ServiceChannelModel;
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
    visible: false,
});

const emit = defineEmits<{(e: 'close'): void,
    (e: 'update:visible'): void
}>();

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const storeState = reactive({
    service: computed<ServiceModel>(() => serviceDetailPageState.serviceInfo),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    escalationPolicyList: [] as EscalationPolicyModel[],
    notificationProtocolList: computed<ProtocolCardItemType[]>(() => serviceDetailPageGetters.notificationProtocolList),
});
const tableState = reactive({
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'protocol_id', label: 'Channel' },
        { name: 'state', label: 'State' },
    ],
    filteredItems: computed<Partial<ServiceChannelModel>[]>(() => [{
        name: props.selectedItem?.name,
        protocol_id: props.selectedItem?.channel_type === SERVICE_CHANNEL_TYPE.FORWARD ? 'forward' : props.selectedItem?.protocol_id,
        state: props.selectedItem?.state,
    }]),
});

const hasNotificationValue = (): boolean => {
    if (!props.selectedItem?.channel_id) return false;
    return state.escalationPolicyList.some((item) => item.rules.some((rule) => rule.channels.includes(props.selectedItem?.channel_id || '')));
};
const getEscalationPolicyLink = () => ({
    name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
    query: {
        tab: SERVICE_DETAIL_TABS.SETTINGS,
        filterNotificationId: props.selectedItem?.channel_id,
    },
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.serviceChannel.delete<ServiceChannelDeleteParameters>({
            channel_id: props.selectedItem?.channel_id || '',
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALT_S_DELETED'), '');
        state.proxyVisible = false;
        emit('close');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};
const fetchEscalationPolicyList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>({
            service_id: storeState.service.service_id,
        });
        state.escalationPolicyList = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationPolicyList = [];
    }
};

onMounted(() => {
    fetchEscalationPolicyList();
});
</script>

<template>
    <p-button-modal :header-title="i18n.t('ALERT_MANAGER.SERVICE.MODAL.DELETE_NOTIFICATION_TITLE')"
                    theme-color="alert"
                    :loading="state.loading"
                    :visible.sync="state.proxyVisible"
                    :disabled="hasNotificationValue()"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="flex flex-col gap-8">
                <p-scoped-notification v-if="hasNotificationValue()"
                                       type="danger"
                                       layout="in-section"
                >
                    <p class="pt-1 pb-2">
                        <span>{{ $t('ALERT_MANAGER.SERVICE.MODAL.DELETE_NOTIFICATION_DESC', { name: props.selectedItem?.name }) }} </span>
                        <span class="font-bold">{{ $t('ALERT_MANAGER.SERVICE.MODAL.DELETE_NOTIFICATION_DESC_BOLD', { name: props.selectedItem?.name }) }}</span>
                    </p>
                    <p-link :to="getEscalationPolicyLink()"
                            action-icon="internal-link"
                            class="mt-1"
                            highlight
                            new-tab
                    >
                        {{ $t('ALERT_MANAGER.SERVICE.MODAL.ESCALATION_LINK_TEXT') }}
                    </p-link>
                </p-scoped-notification>
                <p-data-table :fields="tableState.fields"
                              :items="tableState.filteredItems"
                >
                    <template #col-state-format="{ value }">
                        <p-status
                            class="capitalize"
                            v-bind="alertManagerStateFormatter(value)"
                        />
                    </template>
                    <template #col-protocol_id-format="{value, item}">
                        <div class="flex items-center gap-2">
                            <p-i v-if="value === 'forward'"
                                 name="ic_notification-protocol_users"
                                 width="1rem"
                                 height="1rem"
                            />
                            <p-lazy-img v-else
                                        :src="assetUrlConverter(getProtocolInfo(value, state.notificationProtocolList, item.data).icon || '')"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span>{{ getProtocolInfo(value, state.notificationProtocolList, item.data).name }}</span>
                        </div>
                    </template>
                </p-data-table>
            </div>
        </template>
        <template #confirm-button>
            <span>{{ $t('ALERT_MANAGER.SERVICE.MODAL.REMOVE') }}</span>
        </template>
    </p-button-modal>
</template>
