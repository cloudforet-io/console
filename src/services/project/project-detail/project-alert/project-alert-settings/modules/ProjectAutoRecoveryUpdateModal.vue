<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_MODAL_TITLE')"
        size="sm"
        fade
        :visible.sync="proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="content-wrapper">
                <p>{{ $t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_MODAL_HELP_TEXT') }}</p>
                <p-select-card v-for="option in selectOptions" :key="option.name"
                               v-model="recoveryMode"
                               :value="option.name"
                               :label="option.label"
                               block
                />
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    PButtonModal, PSelectCard,
} from '@spaceone/design-system';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import ErrorHandler from '@/common/composables/error/errorHandler';

const RECOVERY_MODE = Object.freeze({
    MANUAL: 'MANUAL',
    AUTO: 'AUTO',
});
type RECOVERY_MODE = typeof RECOVERY_MODE[keyof typeof RECOVERY_MODE];

export default {
    name: 'ProjectAutoRecoveryUpdateModal',
    components: {
        PButtonModal,
        PSelectCard,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        visible: {
            type: Boolean,
            required: true,
        },
        selectedOption: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            selectOptions: computed(() => ([
                {
                    name: RECOVERY_MODE.AUTO,
                    label: i18n.t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_YES'),
                },
                {
                    name: RECOVERY_MODE.MANUAL,
                    label: i18n.t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_NO'),
                },
            ])),
            recoveryMode: undefined as RECOVERY_MODE | undefined,
        });

        const onClickConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.update({
                    project_id: props.projectId,
                    options: {
                        recovery_mode: state.recoveryMode,
                    },
                });
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_AUTO_RECOVERY'), '', root);
                emit('confirm');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_AUTO_RECOVERY'));
            } finally {
                state.proxyVisible = false;
            }
        };

        watch([() => props.selectedOption, () => props.visible], ([selectedOption]) => {
            state.recoveryMode = selectedOption;
        });

        return {
            ...toRefs(state),
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.content-wrapper {
    @apply grid gap-2;
    line-height: 1.6;
    padding: 1rem 0;
}
</style>
