<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PTableCheckModal, PLazyImg, PStatus, PI,
} from '@cloudforet/mirinae';

import { useServiceChannelApi } from '@/api-clients/alert-manager/service-channel/composables/use-service-channel-api';
import type { ServiceChannelDisableParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/disable';
import type { ServiceChannelEnableParameters } from '@/api-clients/alert-manager/service-channel/schema/api-verbs/enable';
import type { ServiceChannelModel } from '@/api-clients/alert-manager/service-channel/schema/model';
import { WEBHOOK_STATE } from '@/api-clients/alert-manager/webhook/schema/constants';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { alertManagerStateFormatter, getProtocolInfo } from '@/services/alert-manager/v2/composables/refined-table-data';
import { useNotificationProtocolListQuery } from '@/services/alert-manager/v2/composables/use-notification-protocol-list-query';
import { NOTIFICATION_MANAGEMENT_TABLE_FIELDS } from '@/services/alert-manager/v2/constants/notification-table-constant';

interface Props {
    selectedItem?: ServiceChannelModel;
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
    visible: false,
});

const queryClient = useQueryClient();
const { notificationProtocolListData } = useNotificationProtocolListQuery();
const { serviceChannelAPI } = useServiceChannelApi();

const { key: serviceChannelListBaseQueryKey } = useServiceQueryKey('alert-manager', 'service-channel', 'list');

const emit = defineEmits<{(e: 'close'): void;
    (e: 'update:visible'): void
}>();

const state = reactive({
    headerTitle: computed<TranslateResult>(() => {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            return i18n.t('ALERT_MANAGER.NOTIFICATIONS.MODAL_DISABLE_TITLE');
        }
        return i18n.t('ALERT_MANAGER.NOTIFICATIONS.MODAL_ENABLE_TITLE');
    }),
    proxyVisible: useProxyValue('visible', props, emit),
});

const { mutate: serviceChannelChangeStatusMutate, isPending: changeStatusLoading } = useMutation({
    mutationFn: (params: ServiceChannelDisableParameters | ServiceChannelEnableParameters) => {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            return serviceChannelAPI.disable(params);
        }
        return serviceChannelAPI.enable(params);
    },
    onSuccess: () => {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            showSuccessMessage(i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALT_S_DISABLED'), '');
        } else {
            showSuccessMessage(i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALT_S_ENABLED'), '');
        }
        queryClient.invalidateQueries({ queryKey: serviceChannelListBaseQueryKey.value });
        state.proxyVisible = false;
        emit('close');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});

const handleConfirm = () => {
    serviceChannelChangeStatusMutate({
        channel_id: props.selectedItem?.channel_id || '',
    });
};
</script>

<template>
    <p-table-check-modal :visible.sync="state.proxyVisible"
                         :header-title="state.headerTitle"
                         :theme-color="props.selectedItem?.state === WEBHOOK_STATE.ENABLED ? 'alert' : 'primary'"
                         :fields="NOTIFICATION_MANAGEMENT_TABLE_FIELDS"
                         :loading="changeStatusLoading"
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
                <p-i v-if="value === 'forward'"
                     name="ic_notification-protocol_users"
                     width="1rem"
                     height="1rem"
                />
                <p-lazy-img v-else
                            :src="assetUrlConverter(getProtocolInfo(value, notificationProtocolListData).icon || '')"
                            width="1rem"
                            height="1rem"
                />
                <span>{{ getProtocolInfo(value, notificationProtocolListData).name }}</span>
            </div>
        </template>
    </p-table-check-modal>
</template>
