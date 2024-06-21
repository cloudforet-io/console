<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectCard, PIconModal, PDefinitionTable, PButton, PLink,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { Tags } from '@/schema/_common/model';
import type { WebhookCreateParameters } from '@/schema/monitoring/webhook/api-verbs/create';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import type { PluginListParameters } from '@/schema/repository/plugin/api-verbs/list';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';
import { store } from '@/store';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


interface WebhookType {
    plugin_id: string;
    label: string;
    icon: string;
    data: any;
    name: string;
    tags: Tags;
}

interface Props {
    visible?: boolean;
    projectId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectId: '',
});
const emit = defineEmits<{(e: 'confirm'): void}>();
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    language: computed(() => store.state.user.language),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    webhookName: '',
    nameInvalidText: computed(() => {
        if (state.webhookName?.length === 0) return _i18n.t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_REQUIRED');
        if (state.webhookName?.length > 40) return _i18n.t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
        return undefined;
    }),
    isNameValid: computed(() => !state.nameInvalidText),
    webhookTypeList: [] as WebhookType[],
    selectedWebhookType: {} as WebhookType,
    isSelectedWebhookType: computed(() => {
        if (Object.keys(state.selectedWebhookType).length === 0) return false;
        return true;
    }),
    showValidation: false,
    // for succeed mode
    succeedWebhook: {} as WebhookModel,
    isSucceedMode: false,
    fields: computed(() => [
        { name: 'name', label: _i18n.t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.NAME') },
        { name: 'state', label: _i18n.t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.STATE') },
        { name: 'version', label: _i18n.t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.VERSION') },
    ]),
    data: computed(() => ({
        name: state.succeedWebhook.name,
        state: state.succeedWebhook.state,
        version: state.succeedWebhook.plugin_info?.version,
    })),
    guideDocsLink: computed(() => {
        const language = storeState.language === 'ko' ? 'ko/' : '';
        return `https://cloudforet.io/${language}docs/guides/plugins/alert-manager-webhook/`;
    }),
});

/* api */
const getRepositoryID = async () => {
    const res = await SpaceConnector.clientV2.repository.repository.list<RepositoryListParameters, ListResponse<RepositoryModel>>({
        repository_type: 'remote',
    });
    const repositoryId = res.results ? res.results[0].repository_id : '';
    return repositoryId;
};
const getListWebhookType = async () => {
    try {
        const repositoryId = await getRepositoryID();
        const { results } = await SpaceConnector.clientV2.repository.plugin.list<PluginListParameters, ListResponse<PluginModel>>({
            repository_id: repositoryId,
            resource_type: 'monitoring.Webhook',
        });
        state.webhookTypeList = results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.webhookTypeList = [];
    }
};

const convertSucceedMode = () => {
    state.isSucceedMode = true;
};

const createWebhook = async () => {
    state.loading = true;
    try {
        const webhook = await SpaceConnector.clientV2.monitoring.webhook.create<WebhookCreateParameters>({
            name: state.webhookName,
            plugin_info: {
                plugin_id: state.selectedWebhookType?.plugin_id,
                options: {},
            },
            project_id: props.projectId,
        });
        state.succeedWebhook = webhook;
        convertSucceedMode();
        showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_ADD_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_ADD_WEBHOOK'));
    } finally {
        state.loading = false;
    }
};

/* event */
const onFirstInputName = (value) => {
    state.showValidation = true;
    state.webhookName = value;
};
const onClickConfirm = async () => {
    if (!state.showValidation) {
        state.showValidation = true;
        return;
    }

    await createWebhook();
    emit('confirm');
};

const handleCloseSucceedModal = () => {
    state.isSucceedMode = false;
    state.proxyVisible = false;
};

const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(state.succeedWebhook.webhook_url);
};

/* init */
const initInputModel = () => {
    state.webhookName = '';
    state.selectedWebhookType = {} as WebhookType;
    state.showValidation = false;
    state.succeedWebhook = {} as WebhookModel;
    state.isSucceedMode = false;
};

watch(() => props.visible, (visible) => {
    if (visible) initInputModel();
    getListWebhookType();
}, { immediate: true });
</script>

<template>
    <div>
        <p-button-modal
            v-show="!state.isSucceedMode"
            class="project-alert-webhook-add-modal"
            size="md"
            :header-title="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_TITLE')"
            :visible.sync="state.proxyVisible"
            :disabled="state.showValidation && (!state.isNameValid || !state.isSelectedWebhookType)"
            :loading="state.loading"
            @confirm="onClickConfirm"
        >
            <template #body>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_NAME')"
                    required
                    :invalid="state.showValidation && !state.isNameValid"
                    :invalid-text="state.nameInvalidText"
                >
                    <p-text-input
                        v-model="state.webhookName"
                        :invalid="state.showValidation && !state.isNameValid"
                        :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_PLACEHOLDER')"
                        :disabled="state.loading"
                        @update:value.once="onFirstInputName"
                    />
                </p-field-group>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_TYPE')"
                    required
                >
                    <div class="select-card-wrapper">
                        <p-select-card
                            v-for="(item, index) in state.webhookTypeList"
                            :key="index"
                            v-model="state.selectedWebhookType"
                            :tab-index="index"
                            :image-url="item.tags.icon"
                            icon="ic_webhook"
                            :value="item"
                            :label="item.name"
                            :disabled="state.loading"
                            :invalid="state.showValidation"
                        />
                    </div>
                </p-field-group>
            </template>
        </p-button-modal>
        <p-icon-modal size="md"
                      :visible="state.isSucceedMode"
                      :header-title="$t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.TITLE')"
                      :image-url="storeState.plugins[state.succeedWebhook.plugin_info?.plugin_id]?.icon"
                      button-style-type="primary"
                      :button-text="$t('APP.MAIN.CLOSE')"
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
                <div>
                    <div class="table">
                        <p-definition-table :fields="state.fields"
                                            :data="state.data"
                                            :skeleton-rows="3"
                                            disable-copy
                                            style-type="white"
                        >
                            <template #data-state="{ value }">
                                <div>
                                    <div :class="(value==='ENABLED')?'enable': 'disabled'" /><span>{{ value==='ENABLED'? 'Enabled' : 'Disabled' }}</span>
                                </div>
                            </template>
                        </p-definition-table>
                    </div>
                    <div class="webhook-url">
                        <div class="left">
                            <p class="title">
                                {{ $t('PROJECT.DETAIL.ALERT.WEB_HOOK.SUCCEED_MODAL.WEBHOOK_URL') }}
                            </p>
                            <p class="url">
                                {{ state.succeedWebhook.webhook_url }}
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
    </div>
</template>

<style lang="postcss" scoped>
.project-alert-webhook-add-modal {
    .p-text-input {
        @apply w-1/2;
        padding-right: 0.5rem;
    }
}
.select-card-wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;

    /* custom design-system component - p-select-card */
    :deep(.p-select-card) {
        height: 9.0625rem;
    }
}

.table {
    :deep(.p-definition-table) {
        @apply border border-gray-200 rounded-lg;
        overflow: hidden;
        min-height: unset;
        tr:last-child {
            border-bottom-width: 0;
        }
    }

    .enable {
        @apply inline-block w-2 h-2 rounded-full bg-green-600 mr-1;
    }
    .disabled {
        @apply inline-block w-2 h-2 rounded-full bg-gray-400 mr-1;
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

@screen mobile {
    .project-alert-webhook-add-modal {
        .p-text-input {
            @apply w-full pr-0;
        }
    }
    .select-card-wrapper {
        grid-template-columns: auto;
        gap: 1rem;

        /* custom design-system component - p-select-card */
        :deep(.p-select-card) {
            @apply flex items-center p-0 border-none;
            height: auto;
            min-height: auto;
            .marker {
                position: static;
            }
            .select-card-contents {
                .p-lazy-img {
                    display: none;
                }
                .label {
                    @apply ml-1 font-normal;
                }
            }
        }
    }
}
</style>
