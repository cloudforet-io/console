<script setup lang="ts">
import { computed, reactive } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useEventRuleApi } from '@/api-clients/alert-manager/event-rule/composables/use-event-rule-api';
import type { EventRuleDeleteParameters } from '@/api-clients/alert-manager/event-rule/schema/api-verbs/delete';
import type { EventRuleModel } from '@/api-clients/alert-manager/event-rule/schema/model';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'update:visible'): void;
}>();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    eventRuleList: computed<EventRuleModel[]>(() => serviceDetailPageState.eventRuleList),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

const { eventRuleAPI } = useEventRuleApi();
const { mutate: eventRuleDeleteMutation, isPending: eventRuleDeleteMutationPending } = useMutation({
    mutationFn: (params: EventRuleDeleteParameters) => eventRuleAPI.delete(params),
    onSuccess: async () => {
        await replaceUrlQuery({
            webhookId: undefined,
            eventRuleId: undefined,
        });
        // TODO: will be removed
        await serviceDetailPageStore.fetchEventRuleList({
            service_id: storeState.serviceId,
        });
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
        event_rule_id: storeState.eventRuleInfo.event_rule_id,
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
