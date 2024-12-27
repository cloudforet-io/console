<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PTableCheckModal, PLazyImg, PStatus } from '@cloudforet/mirinae';

import type { ServiceChannelDisableParameters } from '@/schema/alert-manager/service-channel/api-verbs/disable';
import type { ServiceChannelEnableParameters } from '@/schema/alert-manager/service-channel/api-verbs/enable';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import { WEBHOOK_STATE } from '@/schema/alert-manager/webhook/constants';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { alertManagerStateFormatter } from '@/services/alert-manager/composables/refined-table-data';
import { NOTIFICATION_MANAGEMENT_TABLE_FIELDS } from '@/services/alert-manager/constants/notification-table-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { ProtocolInfo, ProtocolCardItemType } from '@/services/alert-manager/types/alert-manager-type';

interface Props {
    selectedItem?: ServiceChannelModel;
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const storeState = reactive({
    notificationProtocolList: computed<ProtocolCardItemType[]>(() => serviceDetailPageState.notificationProtocolList),
});

const emit = defineEmits<{(e: 'close'): void;
    (e: 'update:visible'): void
}>();

const state = reactive({
    loading: false,
    headerTitle: computed<TranslateResult>(() => {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            return i18n.t('ALERT_MANAGER.WEBHOOK.MODAL_DISABLE_TITLE');
        }
        return i18n.t('ALERT_MANAGER.WEBHOOK.MODAL_ENABLE_TITLE');
    }),
    proxyVisible: useProxyValue('visible', props, emit),
});

const getProtocolInfo = (id: string): ProtocolInfo => {
    const protocol = storeState.notificationProtocolList.find((item) => item.protocol_id === id);
    return {
        name: protocol?.name || '',
        icon: protocol?.icon || '',
    };
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            await SpaceConnector.clientV2.alertManager.serviceChannel.disable<ServiceChannelDisableParameters>({
                channel_id: props.selectedItem?.channel_id || '',
            });
            showSuccessMessage(i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALT_S_DISABLED'), '');
        } else {
            await SpaceConnector.clientV2.alertManager.serviceChannel.enable<ServiceChannelEnableParameters>({
                channel_id: props.selectedItem?.channel_id || '',
            });
            showSuccessMessage(i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALT_S_ENABLED'), '');
        }
        state.proxyVisible = false;
        emit('close');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <p-table-check-modal :visible.sync="state.proxyVisible"
                         :header-title="state.headerTitle"
                         :theme-color="props.selectedItem?.state === WEBHOOK_STATE.ENABLED ? 'alert' : 'primary'"
                         :fields="NOTIFICATION_MANAGEMENT_TABLE_FIELDS"
                         :loading="state.loading"
                         :items="[props.selectedItem]"
                         modal-size="md"
                         @confirm="handleConfirm"
    >
        <template #col-state-format="{ value }">
            <p-status
                class="capitalize"
                v-bind="alertManagerStateFormatter(value)"
            />
        </template>
        <template #col-protocol_id-format="{value}">
            <div class="flex items-center gap-2">
                <p-lazy-img :src="assetUrlConverter(getProtocolInfo(value).icon)"
                            width="1rem"
                            height="1rem"
                            class="service-img"
                />
                <span>{{ getProtocolInfo(value).name }}</span>
            </div>
        </template>
    </p-table-check-modal>
</template>
