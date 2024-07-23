<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';


import type { WebhookUpdateParameters } from '@/schema/monitoring/webhook/api-verbs/update';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    selectedItem?: any[];
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: () => ([]),
    visible: false,
});
const emit = defineEmits<{(e: 'confirm'): void}>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    webhookName: props.selectedItem[0].name,
    state: props.selectedItem[0].state,
    showValidation: false,
    nameInvalidText: computed(() => {
        if (!state.showValidation) return undefined;
        if (!state.webhookName) {
            return i18n.t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_REQUIRED');
        }
        if (state.webhookName.length > 40) {
            return i18n.t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
        }
        return undefined;
    }),
    isNameInvalid: computed(() => !!state.nameInvalidText),
});

/* api */
const updateWebhook = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.webhook.update<WebhookUpdateParameters>({
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
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_WEBHOOK'), '');
        state.proxyVisible = false;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_WEBHOOK'));
    } finally {
        state.loading = false;
        emit('confirm');
    }
};
</script>

<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_TITLE')"
        :visible.sync="state.proxyVisible"
        :loading="state.loading"
        size="sm"
        class="project-alert-webhook-update-modal"
        @confirm="onUpdateConfirm"
    >
        <template #body>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_LABEL_NAME')"
                required
                :invalid="state.isNameInvalid"
                :invalid-text="state.nameInvalidText"
            >
                <p-text-input
                    v-model="state.webhookName"
                    class="block w-full"
                    :invalid="state.isNameInvalid"
                    :placeholder="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_PLACEHOLDER')"
                    :disabled="state.loading"
                />
            </p-field-group>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_VERSION')"
                           required
            >
                <p-select-dropdown class="version-dropdown"
                                   :menu="[]"
                                   :visible-menu="false"
                                   :placeholder="props.selectedItem[0].plugin_info.version || ''"
                                   disabled
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.project-alert-webhook-update-modal {
    .version-dropdown {
        width: 100%;
    }
}
</style>
