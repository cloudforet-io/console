<template>
    <p-button-modal
        class="alert-resolve-update-modal"
        fade
        size="sm"
        :header-title="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.TITLE')"
        :visible.sync="proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group
                :label="$t('MONITORING.ALERT.ALERT_LIST.UPDATE_RESOLVE_MODAL.LABEL_NOTE')"
            >
                <p-textarea v-model="noteInput" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PButtonModal, PTextarea, PFieldGroup,
} from '@spaceone/design-system';
import { makeProxy } from '@spaceone/console-core-lib';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import { ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';

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
        alert: {
            type: Object,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            noteInput: '',
            userId: computed(() => store.state.user.userId),
        });

        /* api */
        const updateToResolve = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.alert?.alert_id,
                    state: ALERT_STATE.RESOLVED,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const createNote = async () => {
            const params: any = {
                alert_id: props.alert.alert_id,
                user_id: state.userId,
            };

            if (state.noteInput) {
                params.note = state.noteInput;
            }

            await SpaceConnector.client.monitoring.note.create(params);
        };

        /* Handlers */
        const onClickConfirm = async () => {
            try {
                await updateToResolve();
                if (state.noteInput !== undefined) await createNote();
                emit('confirm');
                showSuccessMessage(vm.$t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'), e, root);
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
