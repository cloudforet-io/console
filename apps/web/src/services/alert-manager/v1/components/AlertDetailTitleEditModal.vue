<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertPageStore } from '@/services/alert-manager/v1/stores/alert-page-store';

const props = withDefaults(defineProps<{
    visible?: boolean;
    alertId?: string;
}>(), {
    visible: false,
    alertId: '',
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    alertTitleInput: '',
    nameInvalidText: computed(() => {
        if (state.alertTitleInput.length === 0) {
            return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
        }
        return undefined;
    }),
    isNameInvalid: computed(() => !!state.nameInvalidText),
});

const updateAlertTitle = async () => {
    try {
        state.loading = true;
        await alertPageStore.updateAlertData({
            alertId: props.alertId,
            updateParams: {
                title: state.alertTitleInput,
            },
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_UPDATE_TITLE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_UPDATE_TITLE'));
    } finally {
        state.loading = false;
    }
};
const onClickConfirm = async () => {
    await updateAlertTitle();
    state.proxyVisible = false;
    emit('confirm');
};

watch(() => alertPageState.alertData?.title, (alertTitle) => {
    if (alertTitle) state.alertTitleInput = alertTitle;
}, { immediate: true });
</script>

<template>
    <p-button-modal
        :header-title="$t('MONITORING.ALERT.DETAIL.EDIT_MODAL_TITLE')"
        centered
        size="sm"
        fade
        backdrop
        :loading="state.loading"
        :visible.sync="state.proxyVisible"
        :disabled="state.isNameInvalid"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="state.nameInvalidText"
                           :invalid="state.isNameInvalid"
                           required
            >
                <template #default>
                    <p-text-input v-model="state.alertTitleInput"
                                  class="block w-full"
                                  :invalid="state.isNameInvalid"
                                  :placeholder="alertPageState.alertData?.title"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>
