<template>
    <p-button-modal
        class="alert-acknowledge-update-modal"
        fade
        size="sm"
        :header-title="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.TITLE', {count: alerts.length})"
        :visible.sync="proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="body-inner">
                <p>{{ $t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_YOU') }}</p>
                <p-checkbox v-model="isAssignedToMe">
                    <span> {{ $t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_ME_YES') }}</span>
                </p-checkbox>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    reactive, toRefs, watch,
} from 'vue';

import { PButtonModal, PCheckbox } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import type { AlertStateUpdateParams } from '@/services/alert-manager/type';

export default {
    name: 'AlertAcknowledgeModalModal',
    components: {
        PButtonModal,
        PCheckbox,
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
    setup(props, { emit }: SetupContext) {
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

        return {
            ...toRefs(state),
            onClickConfirm,
        };
    },
};
</script>
<style lang="postcss" scoped>
.body-inner {
    padding: 2rem 0 2.75rem;
    p {
        padding-bottom: 0.75rem;
    }
}
</style>
