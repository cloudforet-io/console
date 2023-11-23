<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PSelectCard,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


const RECOVERY_MODE = Object.freeze({
    MANUAL: 'MANUAL',
    AUTO: 'AUTO',
});
type RecoveryMode = typeof RECOVERY_MODE[keyof typeof RECOVERY_MODE];

interface Props {
    projectId?: string;
    visible?: boolean;
    selectedOption?: RecoveryMode;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    visible: false,
    selectedOption: undefined,
});
const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'update:visible'): void;
}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
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
    recoveryMode: undefined as RecoveryMode | undefined,
});

const onClickConfirm = async () => {
    try {
        await SpaceConnector.client.monitoring.projectAlertConfig.update({
            project_id: props.projectId,
            options: {
                recovery_mode: state.recoveryMode,
            },
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_AUTO_RECOVERY'), '');
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
</script>

<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_MODAL_TITLE')"
        size="sm"
        fade
        :visible.sync="state.proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="content-wrapper">
                <p>{{ $t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_MODAL_HELP_TEXT') }}</p>
                <div class="select-card-wrapper">
                    <p-select-card v-for="(option, index) in state.selectOptions"
                                   :key="option.name"
                                   v-model="recoveryMode"
                                   :tab-index="index"
                                   :value="option.name"
                                   :label="option.label"
                                   block
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.content-wrapper {
    @apply grid gap-2;
    line-height: 1.6;
    padding: 1rem 0;
}
.select-card-wrapper {
    @apply grid gap-2;
}
</style>
