<template>
    <p-button-modal class="collector-update-modal"
                    :header-title="$t('INVENTORY.UPT_COL')"
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
                    :disabled="loading || !isValid"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <div class="collector-input-lap">
                <p-lazy-img class="flex-shrink-0 mr-8"
                            :src="imageUrl"
                            :loading="!imageUrl"
                            width="5.5rem" height="5.5rem"
                />
                <div class="flex-grow">
                    <p-field-group :label="$t('COMMON.NAME')"
                                   :invalid-text="nameInvalidText"
                                   :invalid="!isNameValid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="inputModel.name" block
                                          class="block"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>

                    <p-field-group :label="$t('COMMON.PRIORITY')"
                                   :invalid-text="priorityInvalidText"
                                   :invalid="!isPriorityValid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model.number="inputModel.priority" block
                                          type="number"
                                          class="block"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.VERSION')"
                                   :required="true"
                    >
                        <p-select-dropdown v-model="inputModel.version" :items="versions" />
                    </p-field-group>
                </div>
            </div>
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
import { get, cloneDeep } from 'lodash';

import { toRefs, reactive, computed } from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

import { makeProxy } from '@/lib/compostion-util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { CollectorPluginModel, CollectorUpdateParameter } from '@/lib/fluent-api/inventory/collector.type';

export default {
    name: 'CollectorUpdateModal',
    components: {
        PButtonModal,
        PButton,
        PLazyImg,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
    },
    props: {
        visible: Boolean, // sync prop
        collectorId: {
            type: String,
            default: null,
        },
    },
    setup(props, { root, emit }) {
        const state = reactive({
            loading: true,
            collector: null,
            imageUrl: computed(() => get(state.collector, 'tags.icon', '')),
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            pluginInfo: computed<CollectorPluginModel>(() => get(state.collector, 'plugin_info')),
            confirmBtnBind: computed(() => {
                const defaultStyle: any = { style: { padding: 0 } };
                defaultStyle.styleType = state.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),
            //
            collectorUpdateParam: {} as CollectorUpdateParameter,
            collectorNames: [] as string[],
            versions: [],
        });
        const formState = reactive({
            inputModel: {
                name: '',
                priority: 10,
                version: '',
            },
            nameInvalidText: computed(() => {
                if (formState.inputModel.name.length < 2) {
                    return 'should NOT be shorter than 2 characters';
                } if (state.collectorNames.includes(formState.inputModel.name)) {
                    return 'Name is duplicated';
                }
                return '';
            }),
            isNameValid: computed(() => !(formState.inputModel.name.length < 2 || state.collectorNames.includes(formState.inputModel.name))),
            priorityInvalidText: computed(() => {
                if (formState.inputModel.priority < 1) {
                    return 'should be >= 1';
                } if (formState.inputModel.priority > 10) {
                    return 'should be <= 10';
                }
                return '';
            }),
            isPriorityValid: computed(() => !(formState.inputModel.priority < 1 || formState.inputModel.priority > 10)),
            isValid: computed(() => formState.isNameValid && formState.isPriorityValid),
        });

        const getCollector = async (): Promise<void> => {
            try {
                const res = await SpaceConnector.client.inventory.collector.get({
                    collector_id: props.collectorId,
                });
                state.collector = res;
                formState.inputModel.name = res.name;
                formState.inputModel.priority = Number(res.priority);
                formState.inputModel.version = res.plugin_info.version;
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Get Collector', e, root);
            }
        };
        const getNames = async () => {
            const query = new QueryHelper().setFilter({ k: 'name', o: 'not', v: formState.inputModel.name });
            const res = await SpaceConnector.client.inventory.collector.list({ query: query.data });
            state.collectorNames = res.results.map(v => v.name);
        };
        const getVersions = async () => {
            try {
                state.versions = [];
                const res = await SpaceConnector.client.repository.plugin.getVersions({
                    plugin_id: state.pluginInfo.plugin_id,
                });
                res.results.forEach((value, index) => {
                    if (index === 0) {
                        state.versions.push({ label: `${value} (latest)`, name: value, type: 'item' });
                    } else {
                        state.versions.push({ label: value, name: value, type: 'item' });
                    }
                });
            } catch (e) {
                showErrorMessage('Fail to Get Versions', e, root);
            }
        };

        const onClickReset = (): void => {
            if (state.loading) return;
            formState.inputModel.name = get(state.collector, 'name', '');
            formState.inputModel.priority = get(state.collector, 'priority', null);
            formState.inputModel.version = get(state.collector, 'plugin_info.version', state.versions[0]);
        };
        const onClickConfirm = async (): Promise<void> => {
            if (formState.isValid) {
                state.loading = true;

                const newPluginInfo = cloneDeep(state.pluginInfo);
                newPluginInfo.version = formState.inputModel.version;
                state.collectorUpdateParam = {
                    collector_id: props.collectorId,
                    name: formState.inputModel.name,
                    plugin_info: newPluginInfo,
                    priority: formState.inputModel.priority,
                };

                try {
                    await SpaceConnector.client.inventory.collector.update({
                        collector_id: props.collectorId,
                        ...state.collectorUpdateParam,
                    });
                    showSuccessMessage('success', 'Update Collector', root);
                } catch (e) {
                    showErrorMessage('Fail to Update Collector', e, root);
                } finally {
                    state.loading = false;
                    state.proxyVisible = false;
                }
            }
        };

        const init = async () => {
            state.loading = true;
            await getCollector();
            await getNames();
            await getVersions();
            state.loading = false;
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            onClickReset,
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss">
.collector-update-modal {
    .collector-input-lap {
        @apply flex border-r border-gray-200;
        width: 50%;
        padding: 2.5rem;
        .p-text-input {
            @apply text-gray-900;
            width: 100%;
            max-width: 19rem;
            appearance: none;
            font-size: 0.875rem;
            line-height: 1.5;
            border-radius: 0.125rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }
    }

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
}
</style>
