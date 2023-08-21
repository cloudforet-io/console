<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PSelectCard,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

const RECOVERY_MODE = Object.freeze({
    MANUAL: 'MANUAL',
    AUTO: 'AUTO',
});
type RecoveryMode = typeof RECOVERY_MODE[keyof typeof RECOVERY_MODE];

interface Props {
    projectId: string;
    visible: boolean;
    selectedOption: RecoveryMode;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    selectOptions: computed(() => ([
        {
            name: RECOVERY_MODE.AUTO,
            label: t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_YES'),
        },
        {
            name: RECOVERY_MODE.MANUAL,
            label: t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_NO'),
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
        showSuccessMessage(t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_AUTO_RECOVERY'), '');
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_AUTO_RECOVERY'));
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
        v-model:visible="state.proxyVisible"
        :header-title="t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_MODAL_TITLE')"
        size="sm"
        fade
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="content-wrapper">
                <p>{{ t('PROJECT.DETAIL.ALERT.SET_AUTO_RECOVERY_MODAL_HELP_TEXT') }}</p>
                <div class="select-card-wrapper">
                    <p-select-card v-for="(option, index) in state.selectOptions"
                                   :key="option.name"
                                   v-model:selected="state.recoveryMode"
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
