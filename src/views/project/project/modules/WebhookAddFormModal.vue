<template>
    <p-button-modal
        class="webhook-add-modal"
        size="md"
        :header-title="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_TITLE')"
        :visible.sync="proxyVisible"
        :disabled="showValidation && (!isNameValid || !isSelectedWebhookType || !isSelectedVersion)"
        :loading="loading"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_NAME')"
                required
                :invalid="showValidation && !isNameValid"
                :invalid-text="nameInvalidText"
            >
                <p-text-input
                    v-model="webhookName"
                    :invalid="showValidation && !isNameValid"
                    :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_PLACEHOLDER')"
                    :disabled="loading"
                    @input.once="onFirstInputName"
                />
            </p-field-group>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_TYPE')"
                required
            >
                <div class="select-card-wrapper">
                    <p-select-card
                        v-for="(item, index) in webhookTypeList"
                        :key="index" v-model="selectedWebhookType"
                        :image-url="item.tags.icon"
                        icon="ic_webhook"
                        :value="item"
                        :label="item.name"
                        :disabled="loading"
                        :invalid="showValidation && !isSelectedVersion"
                        @click="onClickWebhookType(selectedWebhookType)"
                    />
                </div>
            </p-field-group>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_VERSION')"
                required
            >
                <p-select-dropdown v-model="version"
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
    PButtonModal,
    PFieldGroup,
    PTextInput,
    PSelectCard, PSelectDropdown,
} from '@spaceone/design-system';

import { makeProxy } from '@/core-lib/compostion-util';
import { SpaceConnector } from '@/core-lib/space-connector';
import { ApiQueryHelper } from '@/core-lib/space-connector/helper';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';

interface WebhookType {
    plugin_id: string;
    label: string;
    icon: string;
    data: any;
}

export default {
    name: 'WebhookAddFormModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectCard,
        PSelectDropdown,
    },
    props: {
        visible: {
            type: Boolean,
            required: false,
        },
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            plugins: computed(() => store.state.resource.plugin.items),
            proxyVisible: makeProxy('visible', props, emit),
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
            versions: [],
            version: '',
            isSelectedVersion: computed(() => {
                if (state.version) return true;
                return false;
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
                state.webhookTypeList = [];
                console.error(e);
            }
        };
        const getVersions = async (selectedPluginId) => {
            state.versions = [];
            try {
                const { results } = await SpaceConnector.client.repository.plugin.getVersions({
                    plugin_id: selectedPluginId,
                });
                results.forEach((value, index) => {
                    if (index === 0) {
                        state.versions.push({ type: 'item', label: `${value} (latest)`, name: value });
                    } else {
                        state.versions.push({ type: 'item', label: value, name: value });
                    }
                });
                state.version = results[0];
            } catch (e) {
                state.versions = [];
                console.error(e);
            }
        };
        const createWebhook = async () => {
            state.loading = true;
            try {
                await SpaceConnector.client.monitoring.webhook.create({
                    name: state.webhookName,
                    plugin_info: {
                        plugin_id: state.selectedWebhookType?.plugin_id,
                        version: state.version,
                        options: {},
                    },
                    project_id: props.projectId,
                });
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_ADD_WEBHOOK'), '', root);
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.DETAIL.ALT_E_ADD_WEBHOOK'), e, root);
            } finally {
                state.loading = false;
                state.proxyVisible = false;
            }
        };

        /* event */
        const onFirstInputName = (e) => {
            state.disabled = true;
            state.showValidation = true;
            state.webhookName = e.target.value;
        };
        const onClickConfirm = async () => {
            if (!state.showValidation) {
                state.showValidation = true;
                return;
            }

            await createWebhook();
            emit('confirm');
        };
        const onClickWebhookType = async (selectedWebhookType) => {
            state.version = '';
            await getVersions(selectedWebhookType.plugin_id);
        };

        /* init */
        const initInputModel = () => {
            state.webhookName = '';
            state.selectedWebhookType = {} as WebhookType;
            state.versions = [];
            state.version = '';
            state.disabled = false;
            state.showValidation = false;
        };

        watch(() => props.visible, () => {
            initInputModel();
            getListWebhookType();
        }, { immediate: true });

        return {
            ...toRefs(state),
            onClickConfirm,
            onFirstInputName,
            onClickWebhookType,
        };
    },
};
</script>

<style lang="postcss" scoped>
.webhook-add-modal {
    .p-text-input {
        @apply w-1/2;
        padding-right: 0.5rem;
    }
}
.select-card-wrapper {
    @apply flex;
    .p-select-card::v-deep {
        flex-basis: 25%;
        height: 9.0625rem;
        margin-left: 0.5rem;
        &:first-child {
            @apply ml-0;
        }
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
        @apply flex-col;
        .p-select-card::v-deep {
            @apply flex items-center p-0 border-none;
            min-height: auto;
            margin: 0.5rem 0;
            &:first-child {
                margin-top: 0;
            }
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
