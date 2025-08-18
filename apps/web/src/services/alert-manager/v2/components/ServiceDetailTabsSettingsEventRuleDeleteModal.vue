<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useEventRuleApi } from '@/api-clients/alert-manager/event-rule/composables/use-event-rule-api';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useEventRuleGetQuery } from '@/services/alert-manager/v2/composables/use-event-rule-get-query';
import { useEventRuleListQuery } from '@/services/alert-manager/v2/composables/use-event-rule-list-query';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'update:visible'): void;
}>();

const route = useRoute();
const serviceId = computed<string>(() => route.params.serviceId as string);

const queryClient = useQueryClient();
const { eventRuleAPI } = useEventRuleApi();
const { eventRuleData } = useEventRuleGetQuery();
const { eventRuleListQueryKey } = useEventRuleListQuery(serviceId);

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

const { mutate: eventRuleDeleteMutation, isPending: eventRuleDeleteMutationPending } = useMutation({
    mutationFn: eventRuleAPI.delete,
    onSuccess: async () => {
        await replaceUrlQuery({
            webhookId: undefined,
            eventRuleId: undefined,
        });
        queryClient.invalidateQueries({ queryKey: eventRuleListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleError(e, true);
    },
    onSettled: () => {
        handleClose();
    },
});
const handleConfirm = async () => {
    eventRuleDeleteMutation({
        event_rule_id: eventRuleData.value?.event_rule_id || '',
    });
};
const handleClose = () => {
    state.proxyVisible = false;
};
</script>

<template>
    <p-button-modal class="service-detail-tabs-settings-event-rule-delete-modal"
                    :header-title="$t('ALERT_MANAGER.EVENT_RULE.DELETE_MODAL_DESC')"
                    size="sm"
                    theme-color="alert"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :loading="eventRuleDeleteMutationPending"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    />
</template>
