<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_TITLE')"
        :visible.sync="proxyVisible"
        :loading="loading"
        size="sm"
        @confirm="onUpdateConfirm"
    >
        <template #body>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_LABEL_NAME')"
                required
                :invalid="isNameInvalid"
                :invalid-text="nameInvalidText"
            >
                <p-text-input
                    v-model="webhookName"
                    class="block w-full"
                    :invalid="isNameInvalid"
                    :placeholder="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_PLACEHOLDER')"
                    :disabled="loading"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

export default {
    name: 'WebhookUpdateFormModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
    },
    props: {
        selectedItem: {
            type: Array,
            default: () => [],
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
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
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_WEBHOOK'), '');
                state.proxyVisible = false;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_WEBHOOK'));
            } finally {
                state.loading = false;
                emit('confirm');
            }
        };

        return {
            ...toRefs(state),
            onUpdateConfirm,
        };
    },

};
</script>

<style lang="postcss" scoped>
.p-select-dropdown {
    min-width: 11rem;
}
</style>
