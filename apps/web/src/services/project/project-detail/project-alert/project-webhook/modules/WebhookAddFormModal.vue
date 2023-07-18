<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButtonModal, PFieldGroup, PTextInput, PSelectCard,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

interface WebhookType {
    plugin_id: string;
    label: string;
    icon: string;
    data: any;
}

interface Props {
    projectId: string;
    visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    webhookName: '',
    nameInvalidText: computed(() => {
        if (state.webhookName?.length === 0) return t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_REQUIRED');
        if (state.webhookName?.length > 40) return t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
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
const repositoryIdApiQuery = new ApiQueryHelper();
const listApiQuery = new ApiQueryHelper();

const getRepositoryID = async () => {
    repositoryIdApiQuery.setFilters([{ k: 'repository_type', v: 'remote', o: '=' }]);
    const res = await SpaceConnector.client.repository.repository.list({
        query: repositoryIdApiQuery.data,
    });
    const repositoryId = res.results[0].repository_id;
    return repositoryId;
};
const getListWebhookType = async () => {
    try {
        listApiQuery.setFilters([{ k: 'service_type', v: 'monitoring.Webhook', o: '=' }]);
        const repositoryId = await getRepositoryID();
        const { results } = await SpaceConnector.client.repository.plugin.list({
            repository_id: repositoryId,
            query: listApiQuery.data,
        });
        state.webhookTypeList = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.webhookTypeList = [];
    }
};
const createWebhook = async () => {
    state.loading = true;
    try {
        await SpaceConnector.client.monitoring.webhook.create({
            name: state.webhookName,
            plugin_info: {
                plugin_id: state.selectedWebhookType?.plugin_id,
                options: {},
            },
            project_id: props.projectId,
        });
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_ADD_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_ADD_WEBHOOK'));
    } finally {
        state.loading = false;
        state.proxyVisible = false;
    }
};

/* event */
const onFirstInputName = (value) => {
    state.disabled = true;
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
    state.disabled = false;
    state.showValidation = false;
};

watch(() => props.visible, () => {
    initInputModel();
    getListWebhookType();
}, { immediate: true });

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        class="webhook-add-modal"
        size="md"
        :header-title="t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_TITLE')"
        :disabled="state.showValidation && (!state.isNameValid || !state.isSelectedWebhookType)"
        :loading="state.loading"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group
                :label="t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_NAME')"
                required
                :invalid="state.showValidation && !state.isNameValid"
                :invalid-text="state.nameInvalidText"
            >
                <p-text-input
                    v-model:value="state.webhookName"
                    :invalid="state.showValidation && !state.isNameValid"
                    :placeholder="t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_PLACEHOLDER')"
                    :disabled="state.loading"
                    @update:value.once="onFirstInputName"
                />
            </p-field-group>
            <p-field-group
                :label="t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_TYPE')"
                required
            >
                <div class="select-card-wrapper">
                    <p-select-card
                        v-for="(item, index) in state.webhookTypeList"
                        :key="index"
                        v-model:selected="state.selectedWebhookType"
                        setup
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
.webhook-add-modal {
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
.p-select-dropdown {
    min-width: 11rem;
}

@screen mobile {
    .webhook-add-modal {
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
