<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextEditor,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricCreateParameters } from '@/schema/inventory/metric/api-verbs/create';
import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import { METRIC_TYPE } from '@/schema/inventory/metric/constant';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


type Mode = 'CREATE' | 'UPDATE';
interface Props {
    visible?: boolean;
    mode?: Mode;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    mode: 'CREATE',
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;

const storeState = reactive({
    metricNameList: computed(() => metricExplorerPageGetters.metrics.map((metric) => metric.name)),
});

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    modalTitle: computed<TranslateResult>(() => {
        if (props.mode === 'CREATE') return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ADD_TITLE');
        return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.UPDATE_TITLE');
    }),
    disableConfirmButton: computed<boolean>(() => {
        if (state.loading) return true;
        if (props.mode === 'CREATE') return !isAllValid;
        return !!invalidState.name;
    }),
});

const {
    forms: {
        name,
        unit,
        code,
    },
    invalidState,
    invalidTexts,
    isAllValid,
    setForm,
    initForm,
} = useFormValidator({
    name: '',
    unit: '',
    code: '',
}, {
    name: (value: string) => {
        if (!value.length) return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.REQUIRED_FIELD');
        if (storeState.metricNameList.includes(value)) return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.DUPLICATED');
        return true;
    },
    code: (value: string) => {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    },
});

/* Api */
const createCustomMetric = async (): Promise<boolean> => {
    try {
        state.loading = true;
        const jsonParsedQuery = JSON.parse(code.value.trim());
        await SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>({
            name: name.value,
            unit: unit.value,
            metric_type: METRIC_TYPE.GAUGE,
            resource_type: 'inventory.CloudService',
            query_options: jsonParsedQuery,
            namespace_id: metricExplorerPageGetters.namespaceId || '',
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_S_CREATE_METRIC'), '');
        return true;
    } catch (e) {
        showErrorMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_E_CREATE_METRIC'), e);
        return false;
    } finally {
        state.loading = false;
    }
};
const updateCustomMetric = async (): Promise<boolean> => {
    try {
        state.loading = true;
        const jsonParsedQuery = JSON.parse(code.value.trim());
        await SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>({
            metric_id: metricExplorerPageGetters.metricId,
            unit: unit.value,
            query_options: jsonParsedQuery,
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_S_UPDATE_METRIC'), '');
        return true;
    } catch (e) {
        showErrorMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_E_UPDATE_METRIC'), e);
        return false;
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleClose = () => {
    initForm();
    state.proxyVisible = false;
};

const handleConfirm = async () => {
    let result: boolean;
    if (props.mode === 'CREATE') {
        result = await createCustomMetric();
    } else {
        result = await updateCustomMetric();
    }
    if (result) {
        initForm();
        state.proxyVisible = false;
        await metricExplorerPageStore.loadMetric(metricExplorerPageGetters.metricId);
    }
};

watch(() => state.proxyVisible, (visible) => {
    if (visible && props.mode !== 'CREATE') {
        setForm('code', JSON.stringify(metricExplorerPageState.metric?.query_options));
        setForm('unit', metricExplorerPageState.metric?.unit || '');
    } else {
        initForm();
    }
});
</script>

<template>
    <p-button-modal class="add-custom-metric-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="state.modalTitle"
                    size="lg"
                    :disabled="state.disableConfirmButton"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-field-group v-if="props.mode === 'CREATE'"
                           :label="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.NAME')"
                           required
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
            </p-field-group>
            <p-field-group :label="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.UNIT')">
                <p-text-input :value="unit"
                              @update:value="setForm('unit', $event)"
                />
            </p-field-group>
            <p-field-group class="query-field"
                           required
            >
                <p-text-editor :code="code"
                               @update:code="setForm('code', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.add-custom-metric-modal {
    :deep(.p-text-input) {
        @apply w-5/12;
        .input-container {
            @apply w-full;
        }
    }

    .query-field {
        @apply border rounded-lg;
        overflow: hidden;

        :deep(.p-text-editor) {
            .CodeMirror {
                height: 31rem;
            }
        }
    }
}
</style>
