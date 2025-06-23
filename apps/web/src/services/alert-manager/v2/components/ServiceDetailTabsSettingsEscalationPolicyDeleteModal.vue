<script lang="ts" setup>
import {
    reactive,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal,
} from '@cloudforet/mirinae';

import { useEscalationPolicyApi } from '@/api-clients/alert-manager/escalation-policy/composables/use-escalation-policy-api';
import type { EscalationPolicyModel } from '@/api-clients/alert-manager/escalation-policy/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
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

const queryClient = useQueryClient();
const { escalationPolicyAPI } = useEscalationPolicyApi();
const { key: escalationPolicyListBaseQueryKey } = useServiceQueryKey('alert-manager', 'escalation-policy', 'list');
const { mutate: escalationPolicyMutation, isPending: escalationPolicyMutationPending } = useMutation({
    mutationFn: escalationPolicyAPI.delete,
    onSuccess: () => {
        showSuccessMessage(i18n.t('ALERT_MANAGER.ESCALATION_POLICY.ALT_S_DELETE_POLICY'), '');
        queryClient.invalidateQueries({ queryKey: escalationPolicyListBaseQueryKey.value });
        state.proxyVisible = false;
        emit('close');
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});

const handleConfirm = async () => {
    escalationPolicyMutation({
        escalation_policy_id: props.selectedItem.escalation_policy_id,
    });
};
</script>

<template>
    <p-button-modal class="service-detail-tabs-settings-escalation-policy-delete-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="$t('ALERT_MANAGER.ESCALATION_POLICY.MODAL_DELETE_TITLE')"
                    :loading="escalationPolicyMutationPending"
                    theme-color="alert"
                    size="sm"
                    @confirm="handleConfirm"
    >
        <template #confirm-button>
            {{ $t('ALERT_MANAGER.ESCALATION_POLICY.MODAL_DELETE_BUTTON') }}
        </template>
    </p-button-modal>
</template>
