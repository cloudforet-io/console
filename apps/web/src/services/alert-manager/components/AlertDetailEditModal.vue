<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { AlertModel } from '@/schema/alert-manager/alert/model';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertDetailPageStore } from '@/services/alert-manager/stores/alert-detail-page-store';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
});
const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: storeState.alertInfo.title,
}, {
    name(value: string) {
        if (!value) return ' ';
        return '';
    },
});

const handleClose = () => {
    state.proxyVisible = false;
};

const handleConfirm = async () => {
    state.loading = true;
    try {
        await alertDetailPageStore.updateAlertDetail({
            alert_id: storeState.alertInfo.alert_id,
            title: name.value,
        });
    } finally {
        state.loading = false;
        handleClose();
    }
};
</script>

<template>
    <p-button-modal class="alert-detail-edit-modal"
                    :header-title="$t('ALERT_MANAGER.ALERTS.MODAL_EDIT_ALERT')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :disabled="!isAllValid"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group :label="$t('ALERT_MANAGER.ALERTS.LABEL_NAME')"
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               class="input-form"
                               required
                >
                    <p-text-input :value="name"
                                  :invalid="invalidState.name"
                                  class="text-input"
                                  block
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>
