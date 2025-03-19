<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown, PLazyImg,
} from '@cloudforet/mirinae';


import type { WebhookUpdateParameters } from '@/schema/alert-manager/webhook/api-verbs/update';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import { i18n } from '@/translations';

import type { PluginItem, PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface Props {
    selectedItem?: WebhookModel;
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const emit = defineEmits<{(e: 'close'): void;
    (e: 'update:visible'): void
}>();

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => serviceDetailPageGetters.pluginsReferenceMap),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    selectedPlugin: computed<PluginItem>(() => storeState.plugins[props.selectedItem?.plugin_info.plugin_id || '']),
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
    name: props.selectedItem?.name || '',
}, {
    name(value: string) {
        if (!value) return ' ';
        if (value.length >= 40) {
            return i18n.t('ALERT_MANAGER.WEBHOOK.VALIDATION_NAME_MAX');
        }
        return '';
    },
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.webhook.update<WebhookUpdateParameters>({
            webhook_id: props.selectedItem?.webhook_id || '',
            name: name.value,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.WEBHOOK.ALT_S_UPDATE_WEBHOOK'), '');
        state.proxyVisible = false;
        emit('close');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <p-button-modal class="service-detail-tabs-webhook-update-modal"
                    :header-title="$t('ALERT_MANAGER.WEBHOOK.MODAL_UPDATE_TITLE')"
                    :visible.sync="state.proxyVisible"
                    :loading="state.loading"
                    :disalbed="!isAllValid"
                    size="sm"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="webhook-item">
                <p-lazy-img :src="state.selectedPlugin ? state.selectedPlugin.icon : 'ic_webhook'"
                            error-icon="ic_webhook"
                            width="4rem"
                            height="4rem"
                />
                <div class="info">
                    <p class="text-label-xl font-bold">
                        {{ state.selectedPlugin ? state.selectedPlugin.label : state.selectedPlugin }}
                    </p>
                    <p class="text-label-sm text-gray-600">
                        {{ state.selectedPlugin.description }}
                    </p>
                </div>
            </div>
            <p-field-group :label="$t('ALERT_MANAGER.WEBHOOK.LABEL_NAME')"
                           :invalid-text="invalidTexts.name"
                           :invalid="invalidState.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  block
                                  :invalid="invalid"
                                  class="mb-2"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('ALERT_MANAGER.WEBHOOK.VERSION')"
                           required
            >
                <p-select-dropdown class="version-dropdown"
                                   :menu="[]"
                                   block
                                   :visible-menu="false"
                                   :placeholder="props.selectedItem.plugin_info.version || ''"
                                   disabled
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.service-detail-tabs-webhook-update-modal {
    .webhook-item {
        @apply flex items-center w-full;
        margin-bottom: 1.5rem;
        gap: 1rem;
        .info {
            @apply flex flex-col;
            gap: 0.125rem;
            flex: 1;
        }
    }
}
</style>
