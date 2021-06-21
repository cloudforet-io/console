<template>
    <p-button-modal
        class="webhook-add-modal"
        size="md"
        :header-title="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_TITLE')"
        :visible.sync="proxyVisible"
        @confirm="onAddConfirm"
    >
        <template #body>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_1')"
                required
                :invalid="isNameInvalid"
                :invalid-text="nameInvalidText"
            >
                <p-text-input
                    v-model="webhookName"
                    :invalid="isNameInvalid"
                    :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_PLACEHOLDER')"
                />
            </p-field-group>
            <p-field-group
                :label="$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_LABEL_2')"
                required
            >
                <div class="select-card-wrapper">
                    <p-select-card
                        v-for="(item, index) in webhookTypeList" :key="index"
                        v-model="selectedWebhookType"
                        :value="item.pluginId"
                        :image-url="item.imageUrl"
                        :label="item.label"
                    />
                </div>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal,
    PFieldGroup,
    PTextInput,
    PSelectCard,
} from '@spaceone/design-system';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

interface WebhookTypeList {
    pluginId: string;
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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            plugins: computed(() => store.state.resource.plugin.items),
            loading: true,
            proxyVisible: makeProxy('visible', props, emit),
            webhookName: '',
            webhookTypeList: [] as WebhookTypeList [],
            selectedWebhookType: undefined as undefined | string,
            showValidation: false,
            nameInvalidText: computed(() => {
                if (!state.showValidation) return undefined;
                if (!state.webhookName) {
                    return vm.$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_REQUIRED');
                }
                if (state.webhookName.length > 40) {
                    return vm.$t('PROJECT.DETAIL.MODAL_CREATE_WEBHOOK_NAME_INVALID_TEXT');
                }
                return undefined;
            }),
            isNameInvalid: computed(() => !!state.nameInvalidText),
        });

        const initInputModel = () => {
            state.webhookName = '';
            state.selectedWebhookType = undefined;
            state.showValidation = false;
        };
        const setWebhookData = async (res) => {
            state.webhookTypeList = res.results.map(d => ({
                pluginId: d.plugin_id,
                label: d.name,
                imageUrl: d.tags.icon,
                data: d,
            }));
        };

        /* api */
        const repositoryIdApiQuery = new ApiQueryHelper();
        const getRepositoryID = async () => {
            repositoryIdApiQuery.setFilters([{ k: 'repository_type', v: 'remote', o: '=' }]);
            const res = await SpaceConnector.client.repository.repository.list({
                query: repositoryIdApiQuery.data,
            });
            const repositoryId = res.results[0].repository_id;
            return repositoryId;
        };
        const listApiQuery = new ApiQueryHelper();
        const getListWebhookType = async () => {
            state.loading = true;
            try {
                listApiQuery.setFilters([{ k: 'service_type', v: 'monitoring.Webhook', o: '=' }]);
                const repositoryId = await getRepositoryID();
                const res = await SpaceConnector.client.repository.plugin.list({
                    repository_id: repositoryId,
                    query: listApiQuery.data,
                });
                await setWebhookData(res);
            } catch (e) {
                state.webhookTypeList = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const createWebhook = async () => {
            try {
                await SpaceConnector.client.monitoring.webhook.create({
                    name: state.webhookName,
                    plugin_info: {
                        plugin_id: state.selectedWebhookType,
                        version: '1.0',
                    },
                    project_id: props.projectId,
                });
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_ADD_WEBHOOK'), '', root);
                state.proxyVisible = false;
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_ADD_WEBHOOK'), e, root);
            }
        };

        /* event */
        const onAddConfirm = async () => {
            state.showValidation = true;
            if (state.isNameInvalid || state.selectedWebhookType === undefined) return;

            await createWebhook();
            emit('confirm');
        };

        watch(() => props.visible, () => {
            initInputModel();
            getListWebhookType();
        }, { immediate: true });

        return {
            ...toRefs(state),
            onAddConfirm,
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
        margin-left: 1rem;
        &:first-child {
            @apply ml-0;
        }
    }
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
