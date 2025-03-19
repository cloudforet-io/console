<script setup lang="ts">
import { reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PTextarea, PFieldGroup,
} from '@cloudforet/mirinae';


import type { AlertUpdateParameters } from '@/schema/monitoring/alert/api-verbs/update';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModelV1 } from '@/schema/monitoring/alert/model';
import type { NoteCreateParameters } from '@/schema/monitoring/note/api-verbs/create';
import type { NoteModel } from '@/schema/monitoring/note/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

const props = withDefaults(defineProps<{
    visible: boolean;
    alerts?: AlertModelV1[];
}>(), {
    visible: false,
    alerts: () => [],
});
const emit = defineEmits<{(event: 'update:visible', value: boolean): void;
    (event: 'confirm'): void;
}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    noteInput: '',
});

/* api */
const updateAlertAndCreateNote = async (alertId: string) => {
    try {
        await SpaceConnector.clientV2.monitoring.alert.update<AlertUpdateParameters, AlertModelV1>({
            alert_id: alertId,
            state: ALERT_STATE.RESOLVED,
        });
        if (state.noteInput) {
            await SpaceConnector.clientV2.monitoring.note.create<NoteCreateParameters, NoteModel>({
                alert_id: alertId,
                note: state.noteInput,
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        throw new Error(alertId);
    }
};
const updateToResolve = async () => {
    const promises = props.alerts?.map((d) => updateAlertAndCreateNote(d.alert_id));
    const results = await Promise.allSettled(promises);
    const rejected = results.filter((d) => d.status === 'rejected');
    if (rejected.length > 0) {
        throw new Error(`Error occurred during updating state to resolved or creating note for ${rejected.map((d) => (d as any).reason.message).join(', ')}`);
    }
};

/* Handlers */
const onClickConfirm = async () => {
    try {
        await updateToResolve();
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
    state.noteInput = '';
};

watch(() => props.visible, async (visible) => {
    if (visible) await reset();
});
</script>

<template>
    <p-button-modal
        class="alert-resolve-update-modal"
        fade
        size="sm"
        :header-title="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.TITLE', {count: props.alerts.length})"
        :visible.sync="state.proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group
                :label="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.LABEL_NOTE')"
                class="mt-4"
            >
                <p-textarea v-model="state.noteInput" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>
