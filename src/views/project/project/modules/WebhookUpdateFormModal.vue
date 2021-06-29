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
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_LABEL_STATE')"
                required
            >
                <div class="toggle-wrapper">
                    <p-toggle-button
                        theme="secondary"
                        :value="enabled"
                        :disabled="loading"
                        @change="onToggleChange"
                    />
                    <span class="label">{{ enabled ? 'Enabled' : 'Disabled' }}</span>
                </div>
            </p-field-group>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_UPDATE_WEBHOOK_LABEL_VERSION')"
                required
            >
                <p-select-dropdown v-model="selectedVersion"
                                   :items="versions"
                                   :disabled="loading"
                                   use-fixed-menu-style
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PToggleButton, PFieldGroup, PTextInput, PSelectDropdown,
} from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { makeProxy } from '@/lib/compostion-util';
import { WEBHOOK_STATE } from '@/views/monitoring/alert-manager/lib/config';
import { i18n } from '@/translations';

export default {
    name: 'WebhookUpdateFormModal',
    components: {
        PButtonModal,
        PToggleButton,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
    },
    props: {
        webhookInfo: {
            type: Object,
            default: undefined,
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            proxyVisible: makeProxy('visible', props, emit),
            webhookName: props.webhookInfo.name,
            state: props.webhookInfo.state,
            enabled: computed(() => {
                if (state.state === WEBHOOK_STATE.ENABLED) return true;
                return false;
            }),
            versions: [],
            selectedVersion: props.webhookInfo.plugin_info.version,
            showValidation: false,
            nameInvalidText: computed(() => {
                if (!state.showValidation) return undefined;
                if (!state.webhookName) {
                    return vm.$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_REQUIRED');
                }
                if (state.webhookName.length > 40) {
                    return vm.$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
                }
                return undefined;
            }),
            isNameInvalid: computed(() => !!state.nameInvalidText),
        });

        /* api */
        const updateWebhook = async () => {
            try {
                await SpaceConnector.client.monitoring.webhook.update({
                    webhook_id: props.webhookInfo.webhook_id,
                    name: state.webhookName,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const enableWebhook = async () => {
            try {
                await SpaceConnector.client.monitoring.webhook.enable({
                    webhook_id: props.webhookInfo.webhook_id,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const disableWebhook = async () => {
            try {
                await SpaceConnector.client.monitoring.webhook.disable({
                    webhook_id: props.webhookInfo.webhook_id,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const updateWebhookVersion = async () => {
            const nowWebhookVersion = props.webhookInfo.plugin_info.version;
            const changedWebhookVersion = state.selectedVersion;
            if (nowWebhookVersion === changedWebhookVersion) return;

            try {
                await SpaceConnector.client.monitoring.webhook.updatePlugin({
                    webhook_id: props.webhookInfo.webhook_id,
                    version: state.selectedVersion,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getVersions = async () => {
            const { results } = await SpaceConnector.client.repository.plugin.getVersions({
                plugin_id: props.webhookInfo.plugin_info.plugin_id,
            });
            results.forEach((value, index) => {
                if (index === 0) {
                    state.versions.push({ type: 'item', label: `${value} (latest)`, name: value });
                } else {
                    state.versions.push({ type: 'item', label: value, name: value });
                }
            });
        };

        /* event */
        const onToggleChange = () => {
            if (state.state === WEBHOOK_STATE.ENABLED) state.state = WEBHOOK_STATE.DISABLED;
            else state.state = WEBHOOK_STATE.ENABLED;
        };
        const onUpdateConfirm = async () => {
            state.showValidation = true;
            if (state.isNameInvalid) return;
            state.loading = true;

            try {
                if (state.state === WEBHOOK_STATE.ENABLED) await enableWebhook();
                else await disableWebhook();

                await updateWebhook();

                await updateWebhookVersion();

                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_UPDATE_WEBHOOK'), '', vm.$root);
                state.proxyVisible = false;
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_UPDATE_WEBHOOK'), e, vm.$root);
            } finally {
                state.loading = false;
                emit('confirm');
            }
        };

        watch(() => props.visible, (after, before) => {
            if (after) getVersions();
        }, { immediate: true });

        return {
            ...toRefs(state),
            onToggleChange,
            onUpdateConfirm,
        };
    },

};
</script>

<style lang="postcss" scoped>
.toggle-wrapper {
    @apply flex items-center;
    .toggled + .label {
        @apply text-secondary;
    }
    .label {
        @apply text-gray-400;
        margin-left: 0.25rem;
        font-size: 0.875rem;
        line-height: 1.5;
    }
}
.p-select-dropdown {
    min-width: 11rem;
}
</style>
