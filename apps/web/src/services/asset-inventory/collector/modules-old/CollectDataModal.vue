<template>
    <p-button-modal :header-title="$t('PLUGIN.COLLECTOR.MAIN.COLLECT_MODAL_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :loading="loading"
                    :visible.sync="proxyVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #body>
            <div class="w-full">
                <div class="flex w-full">
                    <p-lazy-img :src="imageUrl"
                                :loading="collector === null"
                                width="5.5rem"
                                height="5.5rem"
                                class="mr-10 flex-grow-0"
                    />
                    <div>
                        <p class="name">
                            {{ collector ? collector.name : '' }}
                        </p>
                        <p class="info">
                            {{ $t('PLUGIN.COLLECTOR.MAIN.COLLECT_MODAL_LABEL_ID') }}: {{ collectorId }}
                        </p>
                        <p class="info">
                            {{ $t('PLUGIN.COLLECTOR.MAIN.COLLECT_MODAL_LABEL_PLUGIN') }}: {{ pluginName }}
                        </p>
                        <p class="info">
                            {{ $t('PLUGIN.COLLECTOR.MAIN.COLLECT_MODAL_LABEL_VERSION') }}: {{ version }}
                        </p>
                    </div>
                </div>
                <p class="desc">
                    {{ description }}
                </p>
                <p class="sub-header">
                    {{ $t('PLUGIN.COLLECTOR.MAIN.COLLECT_MODAL_LABEL_OPTION') }}
                </p>
                <table class="w-full">
                    <p-definition
                        :label="$t('PLUGIN.COLLECTOR.MAIN.COLLECT_MODAL_SERVICE_ACCOUNT_LABEL')"
                        :data="credential ? credential.name : $t('PLUGIN.COLLECTOR.MAIN.COLLECT_MODAL_CREDENTIALS_ALL')"
                        auto-key-width
                    />
                </table>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, watch,
} from 'vue';
import type { SetupContext } from 'vue';

import {
    PButtonModal, PLazyImg, PDefinition,
} from '@spaceone/design-system';
import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { TimeStamp } from '@/models';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

interface SecretModel {
    secret_id: string;
    name: string;
    secret_type: 'CREDENTIALS'|'CONFIG'|string;
    'secret_groups': string[];
    'schema': string ;
    'provider': string;
    'service_account_id': string;
    'project_id': string;
    'domain_id': string;
    created_at: TimeStamp;
    tags: any;
}

enum COLLECT_MODE {
    all = 'ALL',
    create = 'CREATE',
    update = 'UPDATE'
}

enum COLLECTOR_STATE {
    enabled = 'ENABLED',
    disabled = 'DISABLED'
}

interface FilterFormat {
    name: string;
    type: string;
    change_key: string[];
    resource_type: string;
    object_key?: string;
}

interface PluginOptions {
    supported_resource_type: string[];
    filter_format: FilterFormat[];
    [key: string]: any;
}

interface CollectorPluginModel {
    plugin_id: string;
    version: string;
    options: PluginOptions;
    secret_id?: string;
    secret_group_id?: string;
    provider?: string;
}

interface CollectorModel {
    collector_id: string;
    name: string;
    state: COLLECTOR_STATE;
    provider: string;
    capability: any;
    plugin_info: CollectorPluginModel;
    priority: number;
    created_at: TimeStamp;
    last_collected_at: TimeStamp | null;
    tags: any[];
    icon: string;
}

interface Props {
    visible: boolean;
    credentialId: string | null;
    collectorId: string;
}

export default {
    name: 'CollectDataModal',
    components: {
        PButtonModal,
        PDefinition,
        PLazyImg,
    },
    props: {
        /* sync */
        visible: Boolean,
        credentialId: {
            type: String,
            default: null,
        },
        collectorId: {
            type: String,
            default: '',
        },
    },
    setup(props: Props, context: SetupContext) {
        const state = reactive({
            loading: false,
            proxyVisible: useProxyValue('visible', props, context.emit),
            collector: null as CollectorModel | null,
            credential: null as SecretModel | null,
            selectedCollectMode: COLLECT_MODE.all as COLLECT_MODE,
            plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
            plugin: computed(() => state.plugins[state.collector?.plugin_info.plugin_id]),
            pluginName: computed<string>(() => get(state.plugin, 'name', '')),
            imageUrl: computed<string>(() => get(state.plugin, 'icon', '')),
            version: computed<string>(() => get(state.collector, 'plugin_info.version', '')),
            description: computed<string>(() => get(state.collector, 'tags.description', '')),
            filterFormats: computed<any[]>(() => get(state.collector, 'plugin_info.metadata.filter_format', [])),
            filters: {},
            confirmBtnStyle: computed(() => ({
                styleType: state.loading ? 'gray200' : 'primary-dark',
            })),
        });

        const onClickReset = (): void => {
            if (state.loading) return;

            state.selectedCollectMode = COLLECT_MODE.all;
            state.filters = {};
        };

        const getCollectParams = () => {
            const params: any = {
                collector_id: props.collectorId,
                collect_mode: state.selectedCollectMode,
            };
            if (props.credentialId) params.secret_id = props.credentialId;
            return params;
        };

        const collectorApi = SpaceConnector.client.inventory.collector.collect;
        const onClickCollectConfirm = async (): Promise<void> => {
            state.loading = true;
            try {
                await collectorApi(getCollectParams());
                showSuccessMessage(i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_S_COLLECT_START_TITLE'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PLUGIN.COLLECTOR.MAIN.ALT_E_COLLECT_TITLE'));
            } finally {
                state.proxyVisible = false;
            }
            state.loading = false;
        };

        const getCollector = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.collector.get({
                    collector_id: props.collectorId,
                });
                state.collector = res;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.collector = null;
            } finally {
                state.loading = false;
            }
        };

        const secretManagerApi = SpaceConnector.client.secret.secret.get;
        const getCredential = async (): Promise<void> => {
            state.loading = true;
            state.credential = null;
            try {
                const res = await secretManagerApi({
                    secret_id: props.credentialId,
                });
                state.credential = res;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.credential = [];
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.collectorId, (id) => {
            if (id) getCollector();
        }, { immediate: true });

        watch(() => props.credentialId, (id) => {
            if (id) getCredential();
            else state.credential = null;
        }, { immediate: true });

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/plugin/load');
        })();

        return {
            ...toRefs(state),
            onClickReset,
            onClickCollectConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.name {
    font-size: 1.125rem;
    margin-bottom: 1rem;
}
.info {
    font-size: 0.875rem;
}
.desc {
    margin-top: 1rem;
    margin-bottom: 2rem;
    font-size: 0.875rem;
}
.sub-header {
    @apply text-gray-400;
    margin-bottom: 0.875rem;
    margin-top: 0.875rem;
    font-size: 0.875rem;
    font-weight: bold;
}
</style>
