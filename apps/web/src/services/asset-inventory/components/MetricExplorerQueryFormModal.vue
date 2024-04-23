<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

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


type Mode = 'CREATE' | 'UPDATE' | 'VIEW';
interface Props {
    visible?: boolean;
    mode?: Mode;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    mode: 'VIEW',
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;

const storeState = reactive({
    metricNameList: computed(() => metricExplorerPageGetters.metrics.map((metric) => metric.name)),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    modalTitle: computed(() => {
        switch (props.mode) {
        case 'CREATE':
            return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ADD_TITLE');
        case 'UPDATE':
            return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.UPDATE_TITLE');
        default:
            return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.VIEW_TITLE');
        }
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


/* Event */
const handleClose = () => {
    initForm();
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
            namespace_id: metricExplorerPageGetters.namespaceId || '',
        };
        await SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>(createParameters);
        initForm();
        state.proxyVisible = false;
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.SUCCESSFULLY_ADDED'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => state.proxyVisible, (visible) => {
    if (visible && props.mode !== 'CREATE') {
        setForm('code', JSON.stringify(metricExplorerPageState.metric?.query_options));
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
                    :disabled="!isAllValid"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <template v-if="props.mode !== 'VIEW'">
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
            </template>
            <p-field-group class="query-field"
                           required
            >
                <p-text-editor :code="code"
                               :read-only="props.mode === 'VIEW'"
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
