<script setup lang="ts">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ServiceChannelDeleteParameters } from '@/schema/alert-manager/service-channel/api-verbs/delete';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

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

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
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
</script>

<template>
    <delete-modal :header-title="$t('ALERT_MANAGER.NOTIFICATIONS.MODAL_DELETE_TITLE')"
                  :confirm-text="$t('ALERT_MANAGER.NOTIFICATIONS.MODAL_DELETE_BUTTON')"
                  :visible.sync="state.proxyVisible"
                  :loading="state.loading"
                  @confirm="handleConfirm"
    />
</template>
