<script lang="ts" setup>
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertPageStore } from '@/services/alert-manager/store/alert-page-store';

interface Props {
    visible: boolean;
    alertId: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits(['update:visible', 'confirm']);
const { t } = useI18n();

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.$state;

const state = reactive({
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    alertTitleInput: '',
    nameInvalidText: computed(() => {
        if (state.alertTitleInput.length === 0) {
            return t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
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
        showSuccessMessage(t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_UPDATE_TITLE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_UPDATE_TITLE'));
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
});

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        :header-title="t('MONITORING.ALERT.DETAIL.EDIT_MODAL_TITLE')"
        centered
        size="sm"
        fade
        backdrop
        :disabled="state.isNameInvalid"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group :label="t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
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
