<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PFieldGroup, PLazyImg, PTextInput, PLink, PDataLoader, PJsonSchemaForm,
} from '@cloudforet/mirinae';
import type { JsonSchema } from '@cloudforet/mirinae/types/inputs/forms/json-schema-form/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WebhookCreateParameters } from '@/schema/monitoring/webhook/api-verbs/create';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import type {
    GetPluginMetadataParameters,
    GetPluginMetadataResponse,
} from '@/schema/plugin/plugin/api-verbs/get-plugin-metadata';
import type { PluginGetVersionsParameters } from '@/schema/repository/plugin/api-verbs/get-versions';
import { store } from '@/store';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import ProjectAlertWebhookCreatedModal from '@/services/project/components/ProjectAlertWebhookCreatedModal.vue';
import type { WebhookType } from '@/services/project/types/project-alert-type';

interface Props {
    selectedType?: WebhookType;
}

const props = withDefaults(defineProps<Props>(), {
    selectedType: undefined,
});

const route = useRoute();

const emit = defineEmits<{(e: 'update:currentStep', step: number): void; }>();

const storeState = reactive({
    language: computed(() => store.state.user.language),
});
const state = reactive({
    pageLoading: true,
    loading: false,
    isSucceedMode: false,
    succeedWebhook: {} as WebhookModel,
    pluginVersions: undefined as undefined|string,
    optionsSchema: null as null|JsonSchema|object,
    options: {} as Record<string, any>,
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
        if (value.length >= 40) {
            return i18n.t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
        }
        return '';
    },
});

const handleClickGoBack = () => {
    emit('update:currentStep', 1);
};
const convertSucceedMode = () => {
    state.isSucceedMode = true;
};
const handleUpdateSchemaForm = (isValid:boolean, value) => {
    state.options = value;
};

const getVersions = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.repository.plugin.getVersions<PluginGetVersionsParameters, ListResponse<string> >({
            plugin_id: props.selectedType?.plugin_id || '',
        });
        state.pluginVersions = results ? results[0] : undefined;
    } catch (e) {
        state.pluginVersions = undefined;
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
    }
};
const getPluginMetaData = async () => {
    state.pageLoading = true;
    try {
        const results = await SpaceConnector.clientV2.plugin.plugin.getPluginMetadata<GetPluginMetadataParameters, GetPluginMetadataResponse>({
            plugin_id: props.selectedType?.plugin_id || '',
            version: state.pluginVersions,
        });
        state.optionsSchema = results.metadata?.options_schema ?? {};
    } catch (e) {
        ErrorHandler.handleError(e);
        state.optionsSchema = {};
    } finally {
        state.pageLoading = false;
    }
};
const handleClickCreate = async () => {
    state.loading = true;
    if (!props.selectedType) return;
    try {
        state.succeedWebhook = await SpaceConnector.clientV2.monitoring.webhook.create<WebhookCreateParameters>({
            name: name.value,
            plugin_info: {
                plugin_id: props.selectedType?.plugin_id,
                options: state.options,
            },
            project_id: route.params.id || '',
        });
        convertSucceedMode();
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_ADD_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_ADD_WEBHOOK'));
    } finally {
        state.loading = false;
    }
};

watch(() => state.pluginVersions, (version) => {
    if (version) {
        getPluginMetaData();
    }
});

onMounted(() => {
    getVersions();
});
</script>

<template>
    <p-data-loader class="project-alert-webhook-create-step-2"
                   :data="true"
                   :loading="state.pageLoading"
                   loader-backdrop-color="0"
    >
        <div v-if="props.selectedType"
             class="webhook-item"
        >
            <p-lazy-img :src="assetUrlConverter(props.selectedType.tags?.icon)"
                        width="2.5rem"
                        height="2.5rem"
                        error-icon="ic_webhook"
                        class="image"
            />
            <div class="info">
                <p>{{ props.selectedType.name }}</p>
                <div class="desc-wrapper">
                    <p class="desc">
                        {{ props.selectedType.tags?.long_description || props.selectedType.tags?.description }}
                    </p>
                    <!-- TODO: will be updated field name -->
                    <p-link v-if="props.selectedType.tags?.url"
                            new-tab
                            highlight
                            action-icon="external-link"
                            :href="props.selectedType.tags?.url"
                    >
                        {{ $t('PROJECT.DETAIL.LEARN_MORE') }}
                    </p-link>
                </div>
            </div>
        </div>
        <div class="input-form">
            <p-field-group :label="$t('PROJECT.DETAIL.ALERT.NAME_LABEL')"
                           :invalid-text="invalidTexts.name"
                           :invalid="invalidState.name"
                           :required="true"
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  block
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-json-schema-form :schema="state.optionsSchema"
                                :form-data="state.options"
                                :language="storeState.language"
                                use-fixed-menu-style
                                reset-on-schema-change
                                uniform-width
                                @change="handleUpdateSchemaForm"
            />
        </div>
        <div class="buttons-wrapper">
            <p-button style-type="transparent"
                      size="lg"
                      icon-left="ic_arrow-left"
                      @click="handleClickGoBack"
            >
                {{ $t('COMMON.ERROR.GO_BACK') }}
            </p-button>
            <p-button class="select-button"
                      size="lg"
                      :disabled="!name"
                      :loading="state.loading"
                      @click="handleClickCreate"
            >
                {{ $t('PROJECT.DETAIL.CREATE_WEBHOOK_TITLE') }}
            </p-button>
        </div>
        <project-alert-webhook-created-modal v-if="state.isSucceedMode"
                                             :visible.sync="state.isSucceedMode"
                                             :succeed-webhook="state.succeedWebhook"
        />
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.project-alert-webhook-create-step-2 {
    width: 25rem;
    min-height: 22.5rem;
    .webhook-item {
        @apply flex;
        width: 100%;
        gap: 0.75rem;
        .info {
            @apply flex flex-col text-label-md;
            flex: 1;
            max-width: calc(100% - 3.25rem);
            gap: 0.125rem;
            .desc-wrapper {
                @apply flex items-center text-label-sm;
                gap: 0.25rem;
                .desc {
                    @apply truncate text-gray-500;
                    flex: 1;
                }
            }
        }
    }

    .input-form {
        margin-top: 2rem;
    }

    .buttons-wrapper {
        @apply flex items-center justify-end;
        margin-top: 2rem;
        gap: 1rem;
    }
}
</style>
