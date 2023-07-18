<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    visible: boolean;
    selectedItem: any[];
}

const props = withDefaults(defineProps<Props>(), {
    selectedItem: () => [],
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    webhookName: props.selectedItem[0].name,
    state: props.selectedItem[0].state,
    showValidation: false,
    nameInvalidText: computed(() => {
        if (!state.showValidation) return undefined;
        if (!state.webhookName) {
            return t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_REQUIRED');
        }
        if (state.webhookName.length > 40) {
            return t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
        }
        return undefined;
    }),
    isNameInvalid: computed(() => !!state.nameInvalidText),
});

/* api */
const updateWebhook = async () => {
    try {
        await SpaceConnector.client.monitoring.webhook.update({
            // eslint-disable-next-line camelcase
            webhook_id: props.selectedItem[0].webhook_id,
            name: state.webhookName,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* event */
const onUpdateConfirm = async () => {
    state.showValidation = true;
    if (state.isNameInvalid) return;
    state.loading = true;

    try {
        await updateWebhook();
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_UPDATE_WEBHOOK'), '');
        state.proxyVisible = false;
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_UPDATE_WEBHOOK'));
    } finally {
        state.loading = false;
        emit('confirm');
    }
};

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        :header-title="t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_TITLE')"
        :loading="state.loading"
        size="sm"
        @confirm="onUpdateConfirm"
    >
        <template #body>
            <p-field-group
                :label="t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_LABEL_NAME')"
                required
                :invalid="state.isNameInvalid"
                :invalid-text="state.nameInvalidText"
            >
                <p-text-input
                    v-model:value="state.webhookName"
                    class="block w-full"
                    :invalid="state.isNameInvalid"
                    :placeholder="t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_PLACEHOLDER')"
                    :disabled="state.loading"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.p-select-dropdown {
    min-width: 11rem;
}
</style>
