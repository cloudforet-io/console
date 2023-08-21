<script lang="ts" setup>
/* eslint-disable camelcase */

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PTextarea, PFieldGroup,
} from '@spaceone/design-system';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

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
const emit = defineEmits<{(e:'update:visible', value: boolean): void;
    (e:'confirm'): void;
}>();
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    noteInput: '',
});

/* api */
const updateToResolve = async () => {
    const params: AlertStateUpdateParams = {
        alerts: props.alerts?.map((d) => d.alert_id),
        state: ALERT_STATE.RESOLVED,
    };
    if (state.noteInput) params.note = state.noteInput;
    await SpaceConnector.client.monitoring.alert.updateState(params);
};

/* Handlers */
const onClickConfirm = async () => {
    try {
        await updateToResolve();
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
    state.noteInput = '';
};

watch(() => props.visible, async (visible) => {
    if (visible) await reset();
});

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        class="alert-resolve-update-modal"
        fade
        size="sm"
        :header-title="t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.TITLE', {count: alerts.length})"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group
                :label="t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.LABEL_NOTE')"
                class="mt-4"
            >
                <p-textarea v-model:value="state.noteInput" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>
