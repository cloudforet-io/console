<script lang="ts" setup>
import {
    reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PSelectCard,
} from '@cloudforet/mirinae';


import type { ProjectAlertConfigUpdateParameters } from '@/schema/monitoring/project-alert-config/api-verbs/update';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';
import type { ProjectAlertConfigNotiUrgency } from '@/schema/monitoring/project-alert-config/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { red } from '@/styles/colors';

const URGENCY_COLOR = red[400];

interface Props {
    projectId?: string;
    visible: boolean;
    selectOptions: {
        name: string;
        label: string;
        icon?: string;
    }[];
    selectedOption?: ProjectAlertConfigNotiUrgency;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    visible: false,
    selectOptions: () => ([]),
    selectedOption: undefined,
});
const emit = defineEmits<{(e: 'confirm'): void}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    notificationUrgency: undefined as ProjectAlertConfigNotiUrgency|undefined,
});

const onClickConfirm = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.projectAlertConfig.update<ProjectAlertConfigUpdateParameters, ProjectAlertConfigModel>({
            project_id: props.projectId,
            options: {
                notification_urgency: state.notificationUrgency,
            },
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_NOTIFICATION_POLICY'), '');
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_NOTIFICATION_POLICY'));
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
        :header-title="$t('PROJECT.DETAIL.ALERT.SET_NOTIFICATION_POLICY_MODAL_TITLE')"
        size="sm"
        fade
        :visible.sync="state.proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="content-wrapper">
                <p>{{ $t('PROJECT.DETAIL.ALERT.SET_NOTIFICATION_MODAL_HELP_TEXT') }}</p>
                <div class="select-card-wrapper">
                    <p-select-card v-for="(option, index) in selectOptions"
                                   :key="option.name"
                                   v-model="state.notificationUrgency"
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
