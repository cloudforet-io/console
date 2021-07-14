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
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@spaceone/design-system';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { makeProxy } from '@spaceone/console-core-lib';
import { i18n } from '@/translations';

export default {
    name: 'WebhookUpdateFormModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
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
    setup(props, { emit, root }) {
        const state = reactive({
            loading: false,
            proxyVisible: makeProxy('visible', props, emit),
            webhookName: props.selectedItem[0].name,
            state: props.selectedItem[0].state,
            versions: [],
            selectedVersion: props.selectedItem[0].plugin_info.version,
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
                console.error(e);
            }
        };
        const updateWebhookVersion = async () => {
            const nowWebhookVersion = props.selectedItem[0].plugin_info.version;
            const changedWebhookVersion = state.selectedVersion;
            if (nowWebhookVersion === changedWebhookVersion) return;

            try {
                await SpaceConnector.client.monitoring.webhook.updatePlugin({
                    // eslint-disable-next-line camelcase
                    webhook_id: props.selectedItem[0].webhook_id,
                    version: state.selectedVersion,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getVersions = async () => {
            const { results } = await SpaceConnector.client.repository.plugin.getVersions({
                plugin_id: props.selectedItem[0].plugin_info.plugin_id,
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
        const onUpdateConfirm = async () => {
            state.showValidation = true;
            if (state.isNameInvalid) return;
            state.loading = true;

            try {
                await updateWebhook();
                await updateWebhookVersion();
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_WEBHOOK'), '', root);
                state.proxyVisible = false;
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_WEBHOOK'), e, root);
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
