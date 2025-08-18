<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PDataLoader,
    PFieldGroup,
    PLazyImg,
    PSelectDropdown,
    PTextInput,
} from '@cloudforet/mirinae';

import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useFormValidator } from '@/common/composables/form-validator';

import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;

const storeState = reactive({
    selectedWebhookType: computed<PluginModel|undefined>(() => serviceCreateFormState.selectedWebhookType),
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

const { pluginAPI } = usePluginApi();
const { key: pluginVersionsQueryKey, params: pluginVersionsQueryParams } = useServiceQueryKey('repository', 'plugin', 'get-versions', {
    params: computed(() => ({
        plugin_id: storeState.selectedWebhookType?.plugin_id || '',
    })),
});
const { data: pluginVersionsData, isFetching: pluginVersionsFetching } = useScopedQuery({
    queryKey: pluginVersionsQueryKey,
    queryFn: () => pluginAPI.getVersions(pluginVersionsQueryParams.value),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 60 * 2,
}, ['WORKSPACE']);

watch(() => pluginVersionsData.value, async (val) => {
    serviceCreateFormStore.setWebhookVersion(val?.results?.[0] || '');
}, { immediate: true });
</script>

<template>
    <p-data-loader class="webhook-create-form"
                   :data="true"
                   :loading="pluginVersionsFetching"
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
                               :placeholder="pluginVersionsData?.results?.[0] || ''"
                               disabled
            />
        </p-field-group>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.webhook-create-form {
    min-height: 5rem;
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
