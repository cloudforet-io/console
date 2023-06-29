<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButtonModal, PSelectDropdown, PLazyImg, PFieldGroup, PButton, PTextInput, PToggleButton,
} from '@spaceone/design-system';
import { get } from 'lodash';
import {
    reactive, computed, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { CollectorPluginModel, CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import { UPGRADE_MODE } from '@/services/asset-inventory/collector/model';


interface Props {
    visible: boolean;
    collectorId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    loading: true,
    collector: null,
    proxyVisible: useProxyValue('visible', props, emit),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    pluginInfo: computed<CollectorPluginModel>(() => state.collector?.plugin_info || {}),
    imageUrl: computed<string>(() => state.plugins[state.pluginInfo.plugin_id]?.icon || ''),
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
        version: '',
        isAutoUpgrade: true,
    },
    nameInvalidText: computed(() => {
        if (formState.inputModel.name.length < 2) {
            return t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_NAME_INVALID');
        } if (state.collectorNames.includes(formState.inputModel.name)) {
            return t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_NAME_DUPLICATED');
        }
        return '';
    }),
    isNameValid: computed(() => !(formState.inputModel.name.length < 2 || state.collectorNames.includes(formState.inputModel.name))),
    isValid: computed(() => formState.isNameValid),
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
        formState.inputModel.version = res.plugin_info.version;
        formState.inputModel.isAutoUpgrade = res.plugin_info.upgrade_mode === UPGRADE_MODE.AUTO;
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_GET_TITLE'));
    }
};

const apiQuery = new ApiQueryHelper();
const getNames = async () => {
    apiQuery.setFilters([{ k: 'name', o: '!=', v: formState.inputModel.name }]);
    const res = await SpaceConnector.client.inventory.collector.list({ query: apiQuery.data });
    state.collectorNames = res.results.map((v) => v.name);
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
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_GET_VERSION_TITLE'));
    }
};

/* event */
const onChangeAutoUpgrade = (value) => {
    formState.inputModel.isAutoUpgrade = value;
};
const onClickReset = (): void => {
    if (state.loading) return;
    formState.showValidation = false;
    formState.inputModel.name = get(state.collector, 'name', '');
    formState.inputModel.version = get(state.collector, 'plugin_info.version', state.versions[0]);
    formState.inputModel.isAutoUpgrade = UPGRADE_MODE.AUTO === get(state.collector, 'plugin_info.upgrade_mode', UPGRADE_MODE.MANUAL);
};
const onClickConfirm = async (): Promise<void> => {
    formState.showValidation = true;
    if (formState.isValid) {
        state.loading = true;

        state.collectorUpdateParam = {
            collector_id: props.collectorId,
            name: formState.inputModel.name,
            plugin_info: {
                plugin_id: state.pluginInfo.plugin_id,
                provider: state.pluginInfo.provider,
                upgrade_mode: formState.inputModel.isAutoUpgrade ? UPGRADE_MODE.AUTO : UPGRADE_MODE.MANUAL,
            },
        };

        if (!formState.inputModel.isAutoUpgrade) {
            state.collectorUpdateParam.plugin_info.upgrade_mode = UPGRADE_MODE.MANUAL;
            state.collectorUpdateParam.plugin_info.version = formState.inputModel.version;
        }

        try {
            await SpaceConnector.client.inventory.collector.update({
                collector_id: props.collectorId,
                ...state.collectorUpdateParam,
            });
            showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_UPDATE_TITLE'), '');
        } catch (e) {
            ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_UPDATE_TITLE'));
        } finally {
            state.loading = false;
            state.proxyVisible = false;
        }
    }
};

const clearForm = () => {
    formState.showValidation = false;
    formState.inputModel.name = '';
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

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/plugin/load');
})();

</script>

<template>
    <p-button-modal v-model:visible="state.proxyVisible"
                    class="collector-update-modal"
                    :header-title="t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_TITLE')"
                    centered
                    fade
                    size="sm"
                    backdrop
                    :loading="state.loading"
                    :disabled="state.loading"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <div class="collector-input-wrapper">
                <p-lazy-img class="flex-shrink-0 mr-8"
                            :src="state.imageUrl"
                            :loading="state.collector === null"
                            width="5.5rem"
                            height="5.5rem"
                />
                <div class="flex-grow">
                    <p-field-group :label="t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_NAME_LABEL')"
                                   :invalid-text="formState.nameInvalidText"
                                   :invalid="formState.showValidation && !formState.isNameValid"
                                   :required="true"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.inputModel.name"
                                          block
                                          class="block"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_VERSION_LABEL')"
                                   :required="true"
                    >
                        <p-select-dropdown v-model="formState.inputModel.version"
                                           :items="state.versions"
                                           :disabled="formState.inputModel.isAutoUpgrade"
                                           use-fixed-menu-style
                        />
                    </p-field-group>
                    <p-field-group :label="t('PLUGIN.COLLECTOR.CREATE.AUTO_UPGRADE_LABEL')"
                                   :required="true"
                    >
                        <p-toggle-button :value="formState.inputModel.isAutoUpgrade"
                                         @change-toggle="onChangeAutoUpgrade"
                        />
                    </p-field-group>
                </div>
            </div>
        </template>

        <template #footer-extra>
            <p-button class="reset-btn"
                      style-type="tertiary"
                      size="lg"
                      :disabled="state.loading"
                      @click="onClickReset"
            >
                {{ t('PLUGIN.COLLECTOR.MAIN.UPDATE_MODAL_RESET') }}
            </p-button>
        </template>
    </p-button-modal>
</template>

<style lang="postcss">
.collector-update-modal {
    .collector-input-wrapper {
        @apply flex;
        margin-bottom: 1.5rem;
        .p-text-input {
            @apply text-gray-900 rounded-xs;
            width: 100%;
            max-width: 19rem;
            appearance: none;
            font-size: 0.875rem;
            line-height: 1.5;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }
        .p-select-dropdown {
            @apply w-full;
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
