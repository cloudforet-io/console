<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertUpdateMutation } from '@/services/alert-manager/v2/composables/use-alert-update-mutation';


interface Props {
    visible: boolean;
    alertTitle?: string;
    alertId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    alertTitle: '',
    alertId: '',
});

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});
const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    isAllValid,
} = useFormValidator({
    name: props.alertTitle,
}, {
    name(value: string) {
        if (!value) return ' ';
        return '';
    },
});

const { mutate: alertUpdateMutate, isPending } = useAlertUpdateMutation({
    onSettled: () => {
        handleClose();
    },
});

const handleClose = () => {
    state.proxyVisible = false;
};

const handleConfirm = () => {
    alertUpdateMutate({
        alert_id: props.alertId,
        title: name.value,
    });
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
                    :loading="isPending"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group :label="$t('ALERT_MANAGER.ALERTS.LABEL_NAME')"
                               class="input-form"
                               :invalid="invalidState.name"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="name"
                                      class="text-input"
                                      :invalid="invalid"
                                      block
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>
