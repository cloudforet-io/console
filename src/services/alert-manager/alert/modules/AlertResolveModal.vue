<template>
    <p-button-modal
        class="alert-resolve-update-modal"
        fade
        size="sm"
        :header-title="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.TITLE', {count: alerts.length})"
        :visible.sync="proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group
                :label="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.LABEL_NOTE')"
                class="mt-4"
            >
                <p-textarea v-model="noteInput" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PButtonModal, PTextarea, PFieldGroup,
} from '@spaceone/design-system';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import { i18n } from '@/translations';
import { AlertStateUpdateParams } from '@/services/alert-manager/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'AlertResolveModal',
    components: {
        PButtonModal,
        PTextarea,
        PFieldGroup,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        alerts: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            noteInput: '',
        });

        /* api */
        const updateToResolve = async () => {
            try {
                const params: AlertStateUpdateParams = {
                    alerts: props.alerts?.map(d => d.alert_id),
                    state: ALERT_STATE.RESOLVED,
                };
                if (state.noteInput) params.note = state.noteInput;
                await SpaceConnector.client.monitoring.alert.updateState(params);
            } catch (e) {
                throw e;
            }
        };

        /* Handlers */
        const onClickConfirm = async () => {
            try {
                await updateToResolve();
                emit('confirm');
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'));
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

        return {
            ...toRefs(state),
            onClickConfirm,
        };
    },
};
</script>
