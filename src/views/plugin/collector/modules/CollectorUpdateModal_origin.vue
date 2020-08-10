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
                                 :form.sync="collectorParam"
                                 :enable-validation="enableValidation"
                                 :plugin-id="pluginId"
                                 :options-schema="optionsSchema"
                                 :img-url="collector ? collector.tags.icon : ''"
                                 :is-valid.sync="isValid"
            />
        </template>

        <template #footer-extra>
            <p-button class="reset-btn"
                      style-type="primary-dark"
                      size="lg"
                      :outline="true"
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
    toRefs, reactive, computed, onMounted,
} from '@vue/composition-api';
import _ from 'lodash';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import ConfigureCollector from '@/views/plugin/collector/modules/ConfigureCollector.vue';
import { fluentApi } from '@/lib/fluent-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { JsonSchemaObjectType } from '@/lib/type';
import { CollectorUpdateParameter } from '@/lib/fluent-api/inventory/collector.type';
import { showErrorMessage } from '@/lib/util';

    interface State {
        confRef: any;
        loading: boolean;
        proxyVisible: boolean;
        enableValidation: boolean;
        isValid: boolean;
        collector: any;
        pluginId: string;
        optionsSchema: any;
        confirmBtnBind: any;
        collectorParam: CollectorUpdateParameter;
    }
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
        collectorId: String,
    },
    setup(props, { root, emit }) {
        const state: UnwrapRef<State> = reactive({
            confRef: null,
            loading: true,
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            enableValidation: false,
            isValid: true,
            collector: null,
            pluginId: computed<string>(() => _.get(state.collector, 'plugin_info.plugin_id', '')),
            optionsSchema: null,
            confirmBtnBind: computed(() => {
                const defaultStyle: any = { style: { padding: 0 }, disabled: !state.isValid };
                defaultStyle.styleType = state.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),
            collectorParam: {} as CollectorUpdateParameter,
        });

        const onClickReset = (): void => {
            if (state.loading) return;
            state.confRef.init(state.collector);
            state.enableValidation = false;
            state.isValid = true;
        };

        const collectorApi = fluentApi.inventory().collector();

        const onClickConfirm = async (): Promise<void> => {
            state.enableValidation = true;
            await state.confRef.validate();
            if (state.isValid) {
                state.loading = true;
                try {
                    await collectorApi.update()
                        .setParameter(state.collectorParam)
                        .setId(props.collectorId)
                        .execute();

                    root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'success',
                        text: 'Update Collector',
                        duration: 2000,
                        speed: 1000,
                    });
                } catch (e) {
                    console.error(e);
                    showErrorMessage('Fail to Update Collector', e, root);
                } finally {
                    state.loading = false;
                    state.proxyVisible = false;
                }
            }
        };

        const getCollector = async (id: string): Promise<void> => {
            try {
                const res = await collectorApi.get().setId(id).execute();
                state.collector = res.data;
                state.confRef.init(res.data);
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Collector', e, root);
            }
        };

        const pluginApi = fluentApi.repository().plugin();

        const getPlugin = async (): Promise<void> => {
            try {
                const res = await pluginApi.get().setId(state.pluginId).execute();
                state.optionsSchema = _.get(res.data,
                    'template.options.schema',
                    new JsonSchemaObjectType());
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Plugin', e, root);
            }
        };

        onMounted(async () => {
            state.loading = true;
            await getCollector(props.collectorId);
            await getPlugin();
            state.loading = false;
        });


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
            padding-right: 0.25rem;
        }
    }
</style>
