<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PTableCheckModal, PLazyImg, PStatus } from '@cloudforet/mirinae';

import { useWebhookApi } from '@/api-clients/alert-manager/webhook/composables/use-webhook-api';
import type { WebhookDisableParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/disable';
import type { WebhookEnableParameters } from '@/api-clients/alert-manager/webhook/schema/api-verbs/enable';
import { WEBHOOK_STATE } from '@/api-clients/alert-manager/webhook/schema/constants';
import type { WebhookModel } from '@/api-clients/alert-manager/webhook/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { alertManagerStateFormatter } from '@/services/alert-manager/v2/composables/refined-table-data';
import { WEBHOOK_MANAGEMENT_TABLE_FIELDS } from '@/services/alert-manager/v2/constants/webhook-table-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface Props {
    selectedItem?: WebhookModel;
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => serviceDetailPageGetters.pluginsReferenceMap),
});

const emit = defineEmits<{(e: 'close'): void;
    (e: 'update:visible'): void
}>();

const state = reactive({
    headerTitle: computed<TranslateResult>(() => {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            return i18n.t('ALERT_MANAGER.WEBHOOK.MODAL_DISABLE_TITLE');
        }
        return i18n.t('ALERT_MANAGER.WEBHOOK.MODAL_ENABLE_TITLE');
    }),
    proxyVisible: useProxyValue('visible', props, emit),
});

const queryClient = useQueryClient();
const { webhookAPI } = useWebhookApi();
const { key: webhookListBaseQueryKey } = useServiceQueryKey('alert-manager', 'webhook', 'list');
const { mutateAsync: webhookStatusMutation, isPending: webhookStatusLoading } = useMutation({
    mutationFn: (params: WebhookDisableParameters|WebhookEnableParameters) => {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            return webhookAPI.disable(params);
        }
        return webhookAPI.enable(params);
    },
    onSuccess: () => {
        if (props.selectedItem?.state === WEBHOOK_STATE.ENABLED) {
            showSuccessMessage(i18n.t('ALERT_MANAGER.WEBHOOK.ALT_S_DISABLE_WEBHOOK'), '');
        } else {
            showSuccessMessage(i18n.t('ALERT_MANAGER.WEBHOOK.ALT_S_ENABLE_WEBHOOK'), '');
        }
        queryClient.invalidateQueries({ queryKey: webhookListBaseQueryKey.value });
        state.proxyVisible = false;
        emit('close');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});
const handleConfirm = async () => {
    webhookStatusMutation({
        webhook_id: props.selectedItem?.webhook_id || '',
    });
};
</script>

<template>
    <p-table-check-modal :visible.sync="state.proxyVisible"
                         :header-title="state.headerTitle"
                         :theme-color="props.selectedItem?.state === WEBHOOK_STATE.ENABLED ? 'alert' : 'primary'"
                         :fields="WEBHOOK_MANAGEMENT_TABLE_FIELDS"
                         :loading="webhookStatusLoading"
                         :items="[props.selectedItem]"
                         modal-size="md"
                         @confirm="handleConfirm"
    >
        <template #col-plugin_info.plugin_id-format="{value}">
            <div class="flex items-center gap-2">
                <p-lazy-img :src="storeState.plugins[value] ? storeState.plugins[value].icon : 'ic_webhook'"
                            error-icon="ic_webhook"
                            width="1.5rem"
                            height="1.5rem"
                />
                {{ storeState.plugins[value] ? storeState.plugins[value].label : value }}
            </div>
        </template>
        <template #col-state-format="{ value }">
            <p-status
                class="capitalize"
                v-bind="alertManagerStateFormatter(value)"
            />
        </template>
        <template #col-requests.total-format="{ value }">
            <span>{{ value || 0 }}</span>
        </template>
        <template #col-requests.error-format="{ value, item }">
            <span v-if="value"
                  class="col-failed-requests"
            >
                {{ value || 0 }}
                <span>({{ ((value / item?.requests?.total) * 100).toFixed(1) }}%)</span>
            </span>
        </template>
    </p-table-check-modal>
</template>
