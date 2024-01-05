<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import { PButtonModal, PCheckbox } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AlertAssignUserParameters } from '@/schema/monitoring/alert/api-verbs/assign-user';
import type { AlertUpdateParameters } from '@/schema/monitoring/alert/api-verbs/update';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModel } from '@/schema/monitoring/alert/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

const props = defineProps<{
    visible: boolean;
    alerts: AlertModel[];
}>();
const emit = defineEmits<{(event: 'update:visible', value: boolean): void;
    (event: 'confirm'): void;
}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    isAssignedToMe: false,
});

/* api */
const updateToAcknowledgeAndAssignToMe = async (alertId: string) => {
    try {
        await SpaceConnector.clientV2.monitoring.alert.update<AlertUpdateParameters>({
            alert_id: alertId,
            state: ALERT_STATE.ACKNOWLEDGED,
        });
        if (state.isAssignedToMe) {
            await SpaceConnector.clientV2.monitoring.alert.assignUser<AlertAssignUserParameters>({
                alert_id: alertId,
                assignee: store.state.user.userId,
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        throw new Error(alertId);
    }
};
const updateToAcknowledge = async () => {
    const promises = props.alerts?.map((d) => updateToAcknowledgeAndAssignToMe(d.alert_id));
    const results = await Promise.allSettled(promises);
    const rejected = results.filter((d) => d.status === 'rejected');
    if (rejected.length > 0) {
        throw new Error(`Error occurred during updating state to acknowledge or assignee for ${rejected.map((d) => (d as any).reason.message).join(', ')}`);
    }
};


const onClickConfirm = async () => {
    try {
        await updateToAcknowledge();
        emit('confirm');
        showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '');
    } catch (e) {
        showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'), e);
    } finally {
        state.proxyVisible = false;
    }
};

/* initiators */
const reset = async () => {
    state.isAssignedToMe = false;
};

watch(() => props.visible, async (visible) => {
    if (visible) await reset();
});
</script>

<template>
    <p-button-modal
        class="alert-acknowledge-update-modal"
        fade
        size="sm"
        :header-title="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.TITLE', {count: props.alerts.length})"
        :visible.sync="state.proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="body-inner">
                <p>{{ $t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_YOU') }}</p>
                <p-checkbox v-model="state.isAssignedToMe">
                    <span> {{ $t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_ME_YES') }}</span>
                </p-checkbox>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.body-inner {
    padding: 2rem 0 2.75rem;
    p {
        padding-bottom: 0.75rem;
    }
}
</style>
