<template>
    <p-button-modal class="collector-update-modal"
                    :header-title="$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_TITLE')"
                    centered
                    fade
                    size="sm"
                    backdrop
                    :loading="loading"
                    :visible.sync="proxyVisible"
                    :disabled="loading"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <div class="collector-input-wrapper">
                <p-lazy-img class="flex-shrink-0 mr-8"
                            :src="imageUrl"
                            :loading="collector === null"
                            width="5.5rem" height="5.5rem"
                />
                <div class="flex-grow">
                    <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_NAME_LABEL')"
                                   :invalid-text="nameInvalidText"
                                   :invalid="showValidation && !isNameValid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="inputModel.name" block
                                          class="block"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>

                    <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_PRIORITY_LABEL')"
                                   :invalid-text="priorityInvalidText"
                                   :invalid="showValidation && !isPriorityValid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model.number="inputModel.priority" block
                                          type="number"
                                          class="block"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_VERSION_LABEL')"
                                   :required="true"
                    >
                        <p-select-dropdown v-model="inputModel.version" :items="versions" use-fixed-menu-style />
                    </p-field-group>
                </div>
            </div>
        </template>

        <template #footer-extra>
            <p-button class="reset-btn"
                      style-type="gray-border"
                      size="lg"
                      :disabled="loading"
                      @click="onClickReset"
            >
                {{ $t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_RESET') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { get, cloneDeep } from 'lodash';

import {
    toRefs, reactive, computed, getCurrentInstance, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PSelectDropdown, PLazyImg, PFieldGroup, PButton, PTextInput,
} from '@spaceone/design-system';

import { makeProxy } from '@/core-lib/compostion-util';
import { SpaceConnector } from '@/core-lib/space-connector';
import { ApiQueryHelper } from '@/core-lib/space-connector/helper';
import { showErrorMessage, showSuccessMessage } from '@/core-lib/helper/notice-alert-helper';
import { CollectorPluginModel, CollectorUpdateParameter } from '@/views/plugin/collector/type';
import { store } from '@/store';


interface Props {
    visible: boolean;
    collectorId?: string;
}

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
        // sync prop
        visible: {
            type: Boolean,
            required: true,
        },
        collectorId: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            collector: null,
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            pluginInfo: computed<CollectorPluginModel>(() => get(state.collector, 'plugin_info', {})),
            imageUrl: computed<string>(() => get(store.state.resource.plugin.items[state.pluginInfo.plugin_id], 'icon', '')),
            confirmBtnBind: computed(() => {
                const defaultStyle: any = { style: { padding: 0 } };
                defaultStyle.styleType = state.loading ? 'gray200' : 'primary-dark';
                return defaultStyle;
            }),

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
                    return vm.$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_NAME_INVALID');
                } if (state.collectorNames.includes(formState.inputModel.name)) {
                    return vm.$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_NAME_DUPLICATED');
                }
                return '';
            }),
            isNameValid: computed(() => !(formState.inputModel.name.length < 2 || state.collectorNames.includes(formState.inputModel.name))),
            priorityInvalidText: computed(() => {
                if (formState.inputModel.priority < 1) {
                    return vm.$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_PRIORITY_MIN');
                } if (formState.inputModel.priority > 10) {
                    return vm.$t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_PRIORITY_MAX');
                }
                return '';
            }),
            isPriorityValid: computed(() => !(formState.inputModel.priority < 1 || formState.inputModel.priority > 10)),
            isValid: computed(() => formState.isNameValid && formState.isPriorityValid),
            showValidation: false,
        });

        const getCollector = async (): Promise<void> => {
            state.collector = null;
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
                showErrorMessage(vm.$t('PLUGIN.COLLECTOR.MAIN.ALT_E_GET_TITLE'), e, vm.$root);
            }
        };

        const apiQuery = new ApiQueryHelper();
        const getNames = async () => {
            apiQuery.setFilters([{ k: 'name', o: '!=', v: formState.inputModel.name }]);
            const res = await SpaceConnector.client.inventory.collector.list({ query: apiQuery.data });
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
                console.error(e);
                showErrorMessage(vm.$t('PLUGIN.COLLECTOR.MAIN.ALT_E_GET_VERSION_TITLE'), e, vm.$root);
            }
        };

        const onClickReset = (): void => {
            if (state.loading) return;
            formState.showValidation = false;
            formState.inputModel.name = get(state.collector, 'name', '');
            formState.inputModel.priority = get(state.collector, 'priority', null);
            formState.inputModel.version = get(state.collector, 'plugin_info.version', state.versions[0]);
        };
        const onClickConfirm = async (): Promise<void> => {
            formState.showValidation = true;
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
                    showSuccessMessage(vm.$t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_TITLE'), '', vm.$root);
                } catch (e) {
                    showErrorMessage(vm.$t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_TITLE'), e, vm.$root);
                } finally {
                    state.loading = false;
                    state.proxyVisible = false;
                }
            }
        };

        const clearForm = () => {
            formState.showValidation = false;
            formState.inputModel.name = '';
            formState.inputModel.priority = 10;
            formState.inputModel.version = '';
        };

        const init = async () => {
            clearForm();
            state.loading = true;
            await getCollector();
            await getNames();
            await getVersions();
            state.loading = false;
        };

        watch([() => props.collectorId, () => props.visible], ([id, visible]) => {
            if (id && visible) {
                init();
            } else {
                state.collector = null;
            }
        }, { immediate: true });

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
    .collector-input-wrapper {
        @apply flex;
        padding: 0 2rem 3rem 2rem;
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
        .p-select-dropdown {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            .p-context-menu {
                max-height: 6rem;
            }
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
