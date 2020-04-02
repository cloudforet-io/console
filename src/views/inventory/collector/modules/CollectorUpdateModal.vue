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
                                 :plugin="plugin"
                                 :loading="loading"
                                 :versions="versions"
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
                {{$t('BTN.RESET') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<script>
import { toRefs, reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import config from '@/lib/config';
import { makeTrItems } from '@/lib/view-helper';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import ConfigureCollector from '@/views/inventory/collector/modules/ConfigureCollector.vue';

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
        loading: Boolean,
        versions: Array,
        plugin: Object,
        collector: Object,
    },
    setup(props, { emit, refs }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            pluginId: _.get(props.collector, 'plugin_info.plugin_id', ''),
            name: _.get(props.collector, 'name', ''),
            priority: _.get(props.collector, 'priority', 10),
            options: _.get(props.collector, 'plugin_info.options', {}),
            selectedVersion: _.get(props.collector, 'plugin_info.version', '1.0'),
            onClickReset: () => {
                if (props.loading) return;

                state.options = _.get(props.collector, 'plugin_info.options', {});
                state.priority = _.get(props.collector, 'priority', 10);
            },
            confirmBtnBind: computed(() => {
                const defaultStyle = { style: { padding: 0 } };
                defaultStyle.styleType = props.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),
            onClickConfirm: async () => {
                if (await refs.confRef.validate()) {
                    const params = {
                        name: state.name,
                        // eslint-disable-next-line camelcase
                        collector_id: props.collector.collector_id,
                        // eslint-disable-next-line camelcase
                        plugin_info: {
                            ..._.get(props.collector, 'plugin_info'),
                            version: state.selectedVersion,
                            options: { ..._.get(props.collector, 'plugin_info.options', {}), ...state.options },
                        },
                        priority: state.priority,
                    };

                    CollectorEventBus.$emit('updateCollector', params);
                }
            },
        });


        return {
            ...toRefs(state),
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
