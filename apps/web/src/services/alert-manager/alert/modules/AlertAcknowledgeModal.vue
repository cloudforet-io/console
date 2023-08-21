<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PCheckbox } from '@spaceone/design-system';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import type { AlertStateUpdateParams } from '@/services/alert-manager/type';

interface Props {
    visible: boolean;
    alerts: any[];
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    alerts: () => [],
});
const emit = defineEmits(['update:visible', 'confirm']);
const { t } = useI18n();
const store = useStore();

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
        showSuccessMessage(t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'));
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
        v-model:visible="state.proxyVisible"
        class="alert-acknowledge-update-modal"
        fade
        size="sm"
        :header-title="t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.TITLE', {count: alerts.length})"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="body-inner">
                <p>{{ t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_YOU') }}</p>
                <p-checkbox v-model:selected="state.isAssignedToMe">
                    <span> {{ t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_ME_YES') }}</span>
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
