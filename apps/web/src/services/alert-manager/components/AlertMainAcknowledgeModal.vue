<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import { PButtonModal, PCheckbox } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModel } from '@/schema/monitoring/alert/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { AlertStateUpdateParams } from '@/services/alert-manager/types/alert-type';

const props = defineProps<{
    visible: boolean;
    alerts: AlertModel[];
}>();
const emit = defineEmits<{(event: 'update:visible', value: boolean): void;
    (event: 'confirm'): void;
}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    isAssignedToMe: true,
});

/* api */
const updateToAcknowledge = async () => {
    const params: AlertStateUpdateParams = {
        alerts: props.alerts?.map((d) => d.alert_id),
        state: ALERT_STATE.ACKNOWLEDGED,
    };
    if (state.isAssignedToMe) params.assignee = store.state.user.userId;
    await SpaceConnector.client.monitoring.alert.updateState(params);
};

const onClickConfirm = async () => {
    try {
        await updateToAcknowledge();
        emit('confirm');
        showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'));
    } finally {
        state.proxyVisible = false;
    }
};

/* initiators */
const reset = async () => {
    state.isAssignedToMe = true;
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
