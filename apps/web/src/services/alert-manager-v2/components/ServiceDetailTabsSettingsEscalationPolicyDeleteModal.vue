<script lang="ts" setup>
import {
    reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal,
} from '@cloudforet/mirinae';

import type { EscalationPolicyDeleteParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/delete';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    visible: boolean;
    selectedItem: EscalationPolicyModel;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    selectedItem: undefined,
});

const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'close'): void;
}>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
});
const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.escalationPolicy.delete<EscalationPolicyDeleteParameters>({
            escalation_policy_id: props.selectedItem.escalation_policy_id,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.ESCALATION_POLICY.ALT_S_DELETE_POLICY'), '');
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
    <p-button-modal class="service-detail-tabs-settings-escalation-policy-delete-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="$t('ALERT_MANAGER.ESCALATION_POLICY.MODAL_DELETE_TITLE')"
                    :loading="state.loading"
                    theme-color="alert"
                    size="sm"
                    @confirm="handleConfirm"
    >
        <template #confirm-button>
            {{ $t('ALERT_MANAGER.ESCALATION_POLICY.MODAL_DELETE_BUTTON') }}
        </template>
    </p-button-modal>
</template>
