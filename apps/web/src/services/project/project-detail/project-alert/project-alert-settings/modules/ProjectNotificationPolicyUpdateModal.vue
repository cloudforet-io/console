<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PSelectCard,
} from '@spaceone/design-system';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { red } from '@/styles/colors';

interface Props {
    projectId: string;
    visible: boolean;
    selectOptions: Array<{
        name: string;
        label: string;
        icon?: string;
    }>;
    selectedOption: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
    selectOptions: () => [],
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    notificationUrgency: undefined as string | undefined,
});
const URGENCY_COLOR = red[400];

const onClickConfirm = async () => {
    try {
        await SpaceConnector.client.monitoring.projectAlertConfig.update({
            project_id: props.projectId,
            options: {
                notification_urgency: state.notificationUrgency,
            },
        });
        showSuccessMessage(t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_NOTIFICATION_POLICY'), '');
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_NOTIFICATION_POLICY'));
    } finally {
        state.proxyVisible = false;
    }
};

watch([() => props.selectedOption, () => props.visible], ([selectedOption]) => {
    state.notificationUrgency = selectedOption;
});

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        :header-title="t('PROJECT.DETAIL.ALERT.SET_NOTIFICATION_POLICY_MODAL_TITLE')"
        size="sm"
        fade
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="content-wrapper">
                <p>{{ t('PROJECT.DETAIL.ALERT.SET_NOTIFICATION_MODAL_HELP_TEXT') }}</p>
                <div class="select-card-wrapper">
                    <p-select-card v-for="(option, index) in selectOptions"
                                   :key="option.name"
                                   v-model:selected="state.notificationUrgency"
                                   :tab-index="index"
                                   :value="option.name"
                                   :label="option.label"
                                   :icon="option.icon"
                                   :icon-color="URGENCY_COLOR"
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
