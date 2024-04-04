<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectCard,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { Tags } from '@/schema/_common/model';
import type { WebhookCreateParameters } from '@/schema/monitoring/webhook/api-verbs/create';
import type { PluginListParameters } from '@/schema/repository/plugin/api-verbs/list';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';
import { i18n } from '@/translations';

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

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    webhookName: '',
    nameInvalidText: computed(() => {
        if (state.webhookName?.length === 0) return i18n.t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_REQUIRED');
        if (state.webhookName?.length > 40) return i18n.t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
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
const createWebhook = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.monitoring.webhook.create<WebhookCreateParameters>({
            name: state.webhookName,
            plugin_info: {
                plugin_id: state.selectedWebhookType?.plugin_id,
                options: {},
            },
            project_id: props.projectId,
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_ADD_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_ADD_WEBHOOK'));
    } finally {
        state.loading = false;
        state.proxyVisible = false;
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

/* init */
const initInputModel = () => {
    state.webhookName = '';
    state.selectedWebhookType = {} as WebhookType;
    state.showValidation = false;
};

watch(() => props.visible, () => {
    initInputModel();
    getListWebhookType();
}, { immediate: true });
</script>

<template>
    <p-button-modal
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
            .contents {
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
