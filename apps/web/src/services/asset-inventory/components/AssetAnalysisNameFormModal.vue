<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricExampleCreateParameters } from '@/schema/inventory/metric-example/api-verbs/create';
import type { MetricExampleUpdateParameters } from '@/schema/inventory/metric-example/api-verbs/update';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { NAME_FORM_MODAL_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';


interface Props {
    visible: boolean;
    type?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: NAME_FORM_MODAL_TYPE.EDIT_NAME,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
    (e: 'save-as', name?: string): void;
}>();

const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();
const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const assetAnalysisPageGetters = assetAnalysisPageStore.getters;
const state = reactive({
    currentMetricId: computed<string>(() => route.params.metricId),
    currentMetricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
    currentMetricExample: computed<MetricExampleModel|undefined>(() => assetAnalysisPageState.metricExamples.find((d) => d.example_id === state.currentMetricExampleId)),
    proxyVisible: useProxyValue('visible', props, emit),
    existingNameList: computed<string[]>(() => {
        if (state.currentMetricExampleId) {
            return assetAnalysisPageState.metricExamples
                .filter((d) => d.example_id !== state.currentMetricExampleId)
                .map((d) => d.name);
        }
        if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_CUSTOM_METRIC) {
            return assetAnalysisPageGetters.metrics.map((d) => d.name);
        }
        return assetAnalysisPageGetters.metrics
            .filter((d) => d.key !== assetAnalysisPageState.metric?.metric_id)
            .map((metric) => metric.name);
    }),
    headerTitle: computed(() => {
        if (props.type === NAME_FORM_MODAL_TYPE.ADD_EXAMPLE) return i18n.t('INVENTORY.ASSET_ANALYSIS.ADD_EXAMPLE');
        if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_EXAMPLE) return i18n.t('INVENTORY.ASSET_ANALYSIS.SAVE_AS_METRIC_EXAMPLE');
        if (props.type === NAME_FORM_MODAL_TYPE.EDIT_NAME) {
            if (state.currentMetricExampleId) return i18n.t('INVENTORY.ASSET_ANALYSIS.EDIT_METRIC_EXAMPLE_NAME');
            return i18n.t('INVENTORY.ASSET_ANALYSIS.EDIT_CUSTOM_METRIC_NAME');
        }
        if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_CUSTOM_METRIC) return i18n.t('INVENTORY.ASSET_ANALYSIS.SAVE_AS_NEW_CUSTOM_METRIC');
        return '';
    }),
});
const {
    forms: { name },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    initForm,
} = useFormValidator({
    name: undefined as string|undefined,
}, {
    name(value) {
        if (!value) return i18n.t('INVENTORY.ASSET_ANALYSIS.NAME_REQUIRED');
        if (value.length > 40) return i18n.t('INVENTORY.ASSET_ANALYSIS.MAX_LENGTH_INVALID', { max: 40 });
        if (state.existingNameList.find((d) => d === value)) return i18n.t('INVENTORY.ASSET_ANALYSIS.NAME_DUPLICATED');
        return true;
    },
});

/* Api */
const createMetricExample = async () => {
    try {
        const metricExample = await SpaceConnector.clientV2.inventory.metricExample.create<MetricExampleCreateParameters, MetricExampleModel>({
            metric_id: assetAnalysisPageState.metric?.metric_id || '',
            name: name.value,
            options: {
                granularity: assetAnalysisPageState.granularity,
                period: assetAnalysisPageState.period,
                relative_period: assetAnalysisPageState.relativePeriod,
                group_by: assetAnalysisPageState.selectedGroupByList,
                filters: assetAnalysisPageState.filters,
                operator: assetAnalysisPageState.selectedOperator,
            },
        });
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_S_ADD_METRIC_EXAMPLE'), '');
        state.proxyVisible = false;
        await assetAnalysisPageStore.loadMetricExamples(assetAnalysisPageGetters.namespaceId);
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL.EXAMPLE._NAME,
            params: {
                metricId: metricExample.metric_id,
                metricExampleId: metricExample.example_id,
            },
        })).catch(() => {});
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_E_ADD_METRIC_EXAMPLE'));
    }
};
const updateMetricName = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>({
            metric_id: state.currentMetricId,
            name: name.value,
        });
        state.proxyVisible = false;
        await assetAnalysisPageStore.loadMetric(state.currentMetricId);
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_S_UPDATE_METRIC_NAME'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_E_UPDATE_METRIC_NAME'));
    }
};
const updateMetricExampleName = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metricExample.update<MetricExampleUpdateParameters, MetricExampleModel>({
            example_id: state.currentMetricExampleId,
            name: name.value,
        });
        state.proxyVisible = false;
        await assetAnalysisPageStore.loadMetricExamples(assetAnalysisPageGetters.namespaceId);
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_S_UPDATE_METRIC_NAME'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_E_UPDATE_METRIC_NAME'));
    }
};

/* Event */
const handleFormConfirm = async () => {
    if (!isAllValid) return;
    if (props.type === NAME_FORM_MODAL_TYPE.ADD_EXAMPLE || props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_EXAMPLE) {
        await createMetricExample();
    } else if (props.type === NAME_FORM_MODAL_TYPE.EDIT_NAME) {
        if (state.currentMetricExampleId) {
            await updateMetricExampleName();
        } else {
            await updateMetricName();
        }
    } else if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_CUSTOM_METRIC) {
        emit('save-as', name.value);
        state.proxyVisible = false;
    }
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible && props.type === NAME_FORM_MODAL_TYPE.EDIT_NAME) {
        if (state.currentMetricExampleId) {
            setForm('name', state.currentMetricExample?.name);
        } else {
            setForm('name', assetAnalysisPageState.metric?.name);
        }
    } else {
        initForm();
    }
});

</script>

<template>
    <p-button-modal
        :header-title="state.headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="query-name-input-wrap"
                           :label="$t('INVENTORY.ASSET_ANALYSIS.NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  class="block w-full"
                                  :placeholder="$t('INVENTORY.ASSET_ANALYSIS.NAME')"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.query-name-input-wrap {
    margin-bottom: 2rem;
}
</style>
