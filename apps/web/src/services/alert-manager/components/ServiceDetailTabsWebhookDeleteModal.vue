<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PTextInput } from '@cloudforet/mirinae';

import type { WebhookDeleteParameters } from '@/schema/alert-manager/webhook/api-verbs/delete';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import { i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    selectedItem?: WebhookModel;
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
    visible: false,
});

const emit = defineEmits<{(e: 'close'): void,
    (e: 'update:visible'): void
}>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    inputWebhookName: '',
    isNameValid: computed<boolean>(() => {
        const selectedWebhook = props.selectedItem;
        if (!selectedWebhook) return false;
        return state.inputWebhookName === selectedWebhook.name;
    }),
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.webhook.delete<WebhookDeleteParameters>({
            webhook_id: props.selectedItem?.webhook_id || '',
        });
        showSuccessMessage(_i18n.t('ALERT_MANAGER.WEBHOOK.ALT_S_DELETE_WEBHOOK'), '');
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
    <delete-modal :header-title="$t('ALERT_MANAGER.WEBHOOK.MODAL_DELETE_TITLE')"
                  :confirm-text="$t('ALERT_MANAGER.WEBHOOK.MODAL_DELETE_BUTTON')"
                  :visible.sync="state.proxyVisible"
                  :disabled="!state.isNameValid"
                  :loading="state.loading"
                  @confirm="handleConfirm"
    >
        <template #default>
            <div class="my-4">
                <p class="desc pb-6">
                    {{ $t('ALERT_MANAGER.WEBHOOK.MODAL_DELETE_CONTENT_1') }}
                </p>
                <i18n path="ALERT_MANAGER.WEBHOOK.MODAL_DELETE_CONTENT_2">
                    <template #webhookName>
                        <strong>{{ props.selectedItem.name || '' }}</strong>
                    </template>
                </i18n>
                <p-text-input v-model="state.inputWebhookName"
                              block
                              class="mt-2"
                />
            </div>
        </template>
    </delete-modal>
</template>
