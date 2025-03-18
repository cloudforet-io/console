<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PSelectDropdown, PDataLoader, PLazyImg,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PluginGetVersionsParameters } from '@/schema/repository/plugin/api-verbs/get-versions';
import type { PluginModel } from '@/schema/repository/plugin/model';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;

const storeState = reactive({
    selectedWebhookType: computed<PluginModel|undefined>(() => serviceCreateFormState.selectedWebhookType),
});
const state = reactive({
    loading: false,
    pluginVersions: undefined as undefined|string,
});

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (!value) return ' ';
        if (value.length >= 40) {
            return i18n.t('ALERT_MANAGER.WEBHOOK.VALIDATION_NAME_MAX');
        }
        return '';
    },
});

const handleChangeInput = (val: string) => {
    setForm('name', val);
    serviceCreateFormStore.setWebhookName(val);
};

const getVersions = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.repository.plugin.getVersions<PluginGetVersionsParameters, ListResponse<string> >({
            plugin_id: storeState.selectedWebhookType?.plugin_id || '',
        });
        state.pluginVersions = results ? results[0] : undefined;
        serviceCreateFormStore.setWebhookVersion(state.pluginVersions);
    } catch (e) {
        state.pluginVersions = undefined;
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
    } finally {
        state.loading = false;
    }
};

onMounted(async () => {
    await getVersions();
});
</script>

<template>
    <p-data-loader class="webhook-create-form"
                   :data="true"
                   :loading="state.loading"
                   loader-backdrop-color="0"
    >
        <div v-if="storeState.selectedWebhookType"
             class="webhook-item"
        >
            <p-lazy-img :src="assetUrlConverter(storeState.selectedWebhookType.tags?.icon || '')"
                        width="4rem"
                        height="4rem"
                        error-icon="ic_webhook"
            />
            <div class="info">
                <p class="text-label-xl">
                    {{ storeState.selectedWebhookType?.name }}
                </p>
                <p class="text-label-sm text-gray-600">
                    {{ storeState.selectedWebhookType?.tags?.long_description || storeState.selectedWebhookType?.tags?.description }}
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
                              @update:value="handleChangeInput"
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
                               :placeholder="state.pluginVersions || ''"
                               disabled
            />
        </p-field-group>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.webhook-create-form {
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
