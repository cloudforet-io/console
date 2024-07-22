<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PIconModal, PDefinitionTable, PButton, PLink, PStatus,
} from '@cloudforet/mirinae';

import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import { store } from '@/store';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { useProxyValue } from '@/common/composables/proxy-state';

import { userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

interface Props {
    visible?: boolean;
    succeedWebhook?: WebhookModel;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    succeedWebhook: undefined,
});

const allReferenceStore = useAllReferenceStore();
const router = useRouter();

const emit = defineEmits<{(e: 'confirm'): void}>();

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    language: computed(() => store.state.user.language),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    fields: computed(() => [
        { name: 'name', label: _i18n.t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.NAME') },
        { name: 'state', label: _i18n.t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.STATE') },
        { name: 'version', label: _i18n.t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.VERSION') },
    ]),
    data: computed(() => ({
        name: props.succeedWebhook?.name,
        state: props.succeedWebhook?.state,
        version: props.succeedWebhook?.plugin_info?.version,
    })),
    guideDocsLink: computed(() => {
        const language = storeState.language === 'ko' ? 'ko/' : '';
        return `https://cloudforet.io/${language}docs/guides/plugins/alert-manager-webhook/`;
    }),
});

const handleCloseSucceedModal = () => {
    state.proxyVisible = false;
    router.push({ name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME, query: { tab: 'webhook' } });
};
const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(props.succeedWebhook?.webhook_url || '');
};
</script>

<template>
    <p-icon-modal size="md"
                  :visible="state.proxyVisible"
                  :header-title="$t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.TITLE')"
                  :image-url="storeState.plugins[props.succeedWebhook?.plugin_info?.plugin_id]?.icon"
                  button-style-type="primary"
                  :button-text="$t('PROJECT.DETAIL.CLOSE')"
                  class="project-alert-webhook-created-modal"
                  @update:visible="handleCloseSucceedModal"
    >
        <template #header-desc>
            <i18n path="PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.DESC">
                <template #guide>
                    <p-link new-tab
                            highlight
                            action-icon="external-link"
                            :href="state.guideDocsLink"
                    >
                        {{ $t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.GUIDE') }}
                    </p-link>
                </template>
            </i18n>
        </template>
        <template #body>
            <div class="contents">
                <div class="table">
                    <p-definition-table :fields="state.fields"
                                        :data="state.data"
                                        :skeleton-rows="3"
                                        disable-copy
                                        style-type="white"
                    >
                        <template #data-state="{ value }">
                            <p-status
                                class="capitalize"
                                v-bind="userStateFormatter(value)"
                            />
                        </template>
                    </p-definition-table>
                </div>
                <div class="webhook-url">
                    <div class="left">
                        <p class="title">
                            {{ $t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.WEBHOOK_URL') }}
                        </p>
                        <p class="url">
                            {{ props.succeedWebhook.webhook_url }}
                        </p>
                    </div>
                    <p-button icon-left="ic_copy"
                              style-type="secondary"
                              class="button"
                              @click="handleCopyWebhookUrl"
                    >
                        {{ $t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.COPY_WEBHOOK_URL') }}
                    </p-button>
                </div>
            </div>
        </template>
    </p-icon-modal>
</template>

<style lang="postcss" scoped>
.project-alert-webhook-created-modal {
    .contents {
        @apply flex flex-col;
        gap: 1rem;
        .table {
            :deep(.p-definition-table) {
                @apply border border-gray-200 rounded-lg;
                overflow: hidden;
                min-height: unset;
                td.key {
                    text-align: start;
                }
                tr:last-child {
                    border-bottom-width: 0;
                }
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
    }
}
</style>
