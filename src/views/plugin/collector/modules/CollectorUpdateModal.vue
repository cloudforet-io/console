<template>
    <p-button-modal :header-title="$t('INVENTORY.UPT_COL')"
                    centered
                    size="xl"
                    fade
                    backdrop
                    :loading="loading"
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :footer-confirm-button-bind="confirmBtnBind"
                    :visible.sync="proxyVisible"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <configure-collector ref="confRef"
                                 show-validation
                                 :plugin-id="pluginId"
                                 :name.sync="name"
                                 :loading="loading"
                                 :selected-version.sync="selectedVersion"
                                 :options-value.sync="options"
                                 :priority.sync="priority"
            />
        </template>

        <template #footer-extra>
            <p-button class="reset-btn"
                      style-type="primary-dark"
                      size="lg"
                      outline
                      :disabled="loading"
                      @click="onClickReset"
            >
                {{ $t('BTN.RESET') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import config from '@/lib/config';
import { makeTrItems } from '@/lib/view-helper';
import CollectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import ConfigureCollector from '@/views/plugin/collector/modules/ConfigureCollector.vue';
import { fluentApi } from '@/lib/fluent-api';
import { CollectorPluginModel, PluginOptions } from '@/lib/fluent-api/inventory/collector-plugin';

export default {
    name: 'CollectorUpdateModal',
    components: {
        PButtonModal, PButton, ConfigureCollector,
    },
    props: {
        /**
         * sync prop
         */
        visible: Boolean,
        // loading: Boolean,
        // versions: Array,
        // plugin: Object,
        // collector: Object,
        collectorId: String,
    },
    setup(props, { emit, refs }) {
        const state: any = reactive({
            loading: true,
            proxyVisible: makeProxy('visible', props, emit),
            collector: null,
            pluginId: '', // _.get(props.collector, 'plugin_info.plugin_id', ''),
            name: '', // _.get(props.collector, 'name', ''),
            priority: 10, // _.get(props.collector, 'priority', 10),
            options: {}, // _.get(props.collector, 'plugin_info.options', {}),
            selectedVersion: '1.0', // _.get(props.collector, 'plugin_info.version', '1.0'),
            confirmBtnBind: computed(() => {
                const defaultStyle: any = { style: { padding: 0 } };
                defaultStyle.styleType = state.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),
        });

        const onClickReset = (): void => {
            if (state.loading) return;

            state.options = _.get(state.collector, 'plugin_info.options', {});
            state.priority = _.get(state.collector, 'priority', 10);
        };

        const collectorApi = fluentApi.inventory().collector();

        const onClickConfirm = async (): Promise<void> => {
            if (await refs.confRef.validate()) {
                state.loading = true;
                try {
                    const res = collectorApi.update().setParameter({
                        name: state.name,
                        // eslint-disable-next-line camelcase
                        collector_id: props.collectorId,
                        // eslint-disable-next-line camelcase
                        plugin_info: {
                            ..._.get(state.collector, 'plugin_info') as unknown as CollectorPluginModel,
                            version: state.selectedVersion,
                            options: {
                                ..._.get(state.collector, 'plugin_info.options', {}),
                                ...state.options,
                            } as PluginOptions,
                        },
                        priority: state.priority,
                    });
                } catch (e) {
                    console.error(e);
                } finally {
                    state.loading = false;
                }

                // CollectorEventBus.$emit('updateCollector', params);
            }
        };

        const getCollector = async (id: string): Promise<void> => {
            state.loading = true;
            try {
                const res = await collectorApi.get().setId(id).execute();
                state.collector = res.data;
                state.pluginId = _.get(props.collector, 'plugin_info.plugin_id', '');
                state.name = _.get(props.collector, 'name', '');
                state.priority = _.get(props.collector, 'priority', 10);
                state.options = _.get(props.collector, 'plugin_info.options', {});
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.collectorId, (id) => {
            if (id) getCollector(id);
        }, { lazy: true });


        return {
            ...toRefs(state),
            onClickReset,
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .reset-btn {
        margin-right: auto;
    }
    .confirm-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        .spinner {
            display: inline-flex;
            padding-right: .25rem;
        }
    }
</style>
