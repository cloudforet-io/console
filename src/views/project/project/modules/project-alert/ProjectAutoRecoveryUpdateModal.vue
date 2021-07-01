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
                               v-model="isAutoRecovery"
                               :value="option.name"
                               :label="option.label"
                               block
                />
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    PButtonModal, PSelectCard,
} from '@spaceone/design-system';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { makeProxy } from '@/core-lib/compostion-util';
import { SpaceConnector } from '@/core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/core-lib/helper/notice-alert-helper';
import { i18n } from '@/translations';


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
            type: Boolean,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            selectOptions: computed(() => ([
                {
                    name: true,
                    label: i18n.t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_YES'),
                },
                {
                    name: false,
                    label: i18n.t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_NO'),
                },
            ])),
            isAutoRecovery: undefined,
        });

        const onClickConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.update({
                    project_id: props.projectId,
                    options: {
                        auto_recovery: state.isAutoRecovery,
                    },
                });
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_AUTO_RECOVERY'), '', root);
                emit('confirm');
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_AUTO_RECOVERY'), e, root);
            } finally {
                state.proxyVisible = false;
            }
        };

        watch([() => props.selectedOption, () => props.visible], ([selectedOption]) => {
            state.isAutoRecovery = selectedOption;
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
