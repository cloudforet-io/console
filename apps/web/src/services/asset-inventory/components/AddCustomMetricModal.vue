<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextEditor,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricCreateParameters } from '@/schema/inventory/metric/api-verbs/create';
import { METRIC_TYPE } from '@/schema/inventory/metric/constant';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';

interface Props {
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const metricExplorerPageStore = useMetricExplorerPageStore();

const storeState = reactive({
    metricNameList: computed(() => metricExplorerPageStore.state.metricList.map((metric) => metric.name)),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
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


/* Event */
const handleClose = () => {
    resetForm();
    state.proxyVisible = false;
};

const handleConfirm = async () => {
    try {
        const jsonParsedQuery = JSON.parse(code.value.trim());
        const createParameters: MetricCreateParameters = {
            name: name.value,
            unit: unit.value,
            metric_type: METRIC_TYPE.GAUGE,
            resource_type: 'inventory.CloudService',
            query_options: jsonParsedQuery,
            namespace_id: metricExplorerPageStore.state.selectedNamespace?.namespace_id || '',
        };
        await SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>(createParameters);
        resetForm();
        state.proxyVisible = false;
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.SUCCESSFULLY_ADDED'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Method */
const resetForm = () => {
    setForm('name', '');
    setForm('unit', '');
    setForm('code', '');
};

</script>

<template>
    <p-button-modal class="add-custom-metric-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ADD_TITLE')"
                    size="lg"
                    :disabled="!isAllValid"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-field-group :label="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.NAME')"
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
