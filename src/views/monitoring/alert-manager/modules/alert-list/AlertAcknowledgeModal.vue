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
                <p-check-box v-model="isAssignedToMe">
                    <span> {{ $t('MONITORING.ALERT.ALERT_LIST.UPDATE_ACKNOWLEDGE_MODAL.ASSIGN_TO_ME_YES') }}</span>
                </p-check-box>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from '@vue/composition-api';
import { PButtonModal, PCheckBox } from '@spaceone/design-system';
import { makeProxy } from '@spaceone/console-core-lib';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';
import { i18n } from '@/translations';
import { store } from '@/store';
import { AlertStateUpdateParams } from '@/views/monitoring/alert-manager/type';

export default {
    name: 'AlertAcknowledgeModalModal',
    components: {
        PButtonModal,
        PCheckBox,
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
            isAssignedToMe: true,
        });

        /* api */
        const updateToAcknowledge = async () => {
            try {
                const params: AlertStateUpdateParams = {
                    alerts: props.alerts?.map(d => d.alert_id),
                    state: ALERT_STATE.ACKNOWLEDGED,
                };
                if (state.isAssignedToMe) params.assignee = store.state.user.userId;
                await SpaceConnector.client.monitoring.alert.updateState(params);
            } catch (e) {
                console.error(e);
            }
        };

        const onClickConfirm = async () => {
            try {
                await updateToAcknowledge();
                emit('confirm');
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'), e, root);
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
