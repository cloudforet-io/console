<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { EventRuleDeleteParameters } from '@/schema/alert-manager/event-rule/api-verbs/delete';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';

interface Props {
    visible: boolean;
    id?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    id: '',
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'update:visible'): void;
}>();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
});
const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.eventRule.delete<EventRuleDeleteParameters>({
            event_rule_id: props.id,
        });
        await serviceDetailPageStore.fetchEventRuleList({
            service_id: storeState.serviceId,
        });
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
        handleClose();
    }
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
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    />
</template>
