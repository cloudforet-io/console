<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { isEmpty } from 'lodash';

import {
    PDefinitionTable, PButton, PStatus, PMarkdown, PLazyImg, PLink,
} from '@cloudforet/mirinae';

import { WEBHOOK_STATE } from '@/schema/alert-manager/webhook/constants';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import type { PluginModel } from '@/schema/repository/plugin/model';
import { i18n as _i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { copyAnyData } from '@/lib/helper/copy-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import { userStateFormatter } from '@/services/iam/composables/refined-table-data';

type WebhookTableData = {
    name: string;
    state: string;
    version: string;
};
interface Props {
    succeedWebhook?: WebhookModel;
}
const props = withDefaults(defineProps<Props>(), {
    succeedWebhook: undefined,
});

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;
const userStore = useUserStore();

const storeState = reactive({
    language: computed<string>(() => userStore.state.language || 'en'),
    selectedWebhookType: computed<PluginModel|undefined>(() => serviceCreateFormState.selectedWebhookType),
});

const state = reactive({
    fields: computed(() => [
        { name: 'name', label: _i18n.t('ALERT_MANAGER.WEBHOOK.LABEL_NAME') },
        { name: 'state', label: _i18n.t('ALERT_MANAGER.WEBHOOK.LABEL_STATE') },
        { name: 'version', label: _i18n.t('ALERT_MANAGER.WEBHOOK.VERSION') },
    ]),
    data: computed<WebhookTableData>(() => ({
        name: props.succeedWebhook?.name || '',
        state: props.succeedWebhook?.state || WEBHOOK_STATE.ENABLED,
        version: props.succeedWebhook?.plugin_info?.version || '',
    })),
    guideDocsLink: computed<string>(() => {
        const language = storeState.language === 'ko' ? 'ko/' : '';
        return `https://cloudforet.io/${language}docs/guides/plugins/alert-manager-webhook/`;
    }),
});

const handleCopyWebhookUrl = () => {
    copyAnyData(props.succeedWebhook?.webhook_url || '');
    showSuccessMessage(_i18n.t('ALERT_MANAGER.ALT_S_COPIED'), '');
};
</script>

<template>
    <div class="webhook-create-success-mode">
        <div class="webhook-item">
            <p-lazy-img :src="assetUrlConverter(storeState.selectedWebhookType?.tags?.icon || '')"
                        width="4rem"
                        height="4rem"
                        error-icon="ic_webhook"
            />
            <span class="info">
                <i18n path="ALERT_MANAGER.WEBHOOK.CREATE_DESC">
                    <template #guide>
                        <p-link new-tab
                                highlight
                                action-icon="external-link"
                                :href="state.guideDocsLink"
                        >
                            {{ $t('ALERT_MANAGER.WEBHOOK.GUIDE') }}
                        </p-link>
                    </template>
                </i18n>
            </span>
        </div>
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :skeleton-rows="3"
                            disable-copy
                            class="webhook-table"
                            style-type="white"
        >
            <template #data-state="{ value }">
                <p-status
                    class="capitalize"
                    v-bind="userStateFormatter(value)"
                />
            </template>
        </p-definition-table>
        <div class="webhook-url">
            <div class="left">
                <p class="title">
                    {{ $t('ALERT_MANAGER.WEBHOOK.WEBHOOK_URL') }}
                </p>
                <p class="url">
                    {{ props.succeedWebhook?.webhook_url }}
                </p>
            </div>
            <p-button icon-left="ic_copy"
                      style-type="secondary"
                      class="button"
                      @click="handleCopyWebhookUrl"
            >
                {{ $t('ALERT_MANAGER.WEBHOOK.COPY_WEBHOOK_URL') }}
            </p-button>
        </div>
        <p-markdown v-if="storeState.selectedWebhookType?.docs && !isEmpty(storeState.selectedWebhookType?.docs)"
                    :markdown="storeState.selectedWebhookType?.docs"
                    :language="storeState.language"
                    remove-spacing
                    class="markdown"
        />
    </div>
</template>

<style lang="postcss" scoped>
.webhook-create-success-mode {
    @apply flex flex-col;
    gap: 1rem;
    .webhook-item {
        @apply flex flex-col items-center justify-center text-paragraph-md;
        gap: 1.5rem;
        padding-bottom: 0.5rem;
    }
    .webhook-table {
        @apply border border-gray-200 rounded-lg;
        overflow: hidden;
        min-height: unset;
    }
    :deep(.webhook-table) {
        tr:last-child {
            border-bottom-width: 0;
        }
    }
    .webhook-url {
        @apply border border-gray-200 rounded-lg bg-violet-100 flex justify-between gap-2 text-gray-900 text-label-md;
        text-align: left;
        padding: 1rem 1rem 1.25rem 1rem;
        .left {
            flex-grow: 0;
            .title {
                @apply font-bold mb-2;
            }
            .url {
                line-break: anywhere;
            }
        }
        .button {
            flex-shrink: 0;
        }
    }
    .markdown {
        @apply bg-white border border-gray-200 overflow-auto;
        max-height: 28.75rem;
        padding: 1rem;
        border-radius: 0.375rem;
    }
}
</style>
