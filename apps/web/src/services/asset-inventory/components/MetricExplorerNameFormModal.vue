<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import type { MetricExampleCreateParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/create';
import type { MetricExampleUpdateParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/update';
import type { MetricExampleModel } from '@/api-clients/inventory/metric-example/schema/model';
import type { MetricUpdateParameters } from '@/api-clients/inventory/metric/schema/api-verbs/update';
import type { MetricModel } from '@/api-clients/inventory/metric/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { useMetricExampleGetQuery } from '@/services/asset-inventory/composables/use-metric-example-get-query';
import { useMetricExampleListQuery } from '@/services/asset-inventory/composables/use-metric-example-list-query';
import { useMetricGetQuery } from '@/services/asset-inventory/composables/use-metric-get-query';
import { useMetricListQuery } from '@/services/asset-inventory/composables/use-metric-list-query';
import { NAME_FORM_MODAL_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


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

const gnbStore = useGnbStore();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const state = reactive({
    currentMetricId: computed<string>(() => route.params.metricId),
    currentMetricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    existingNameList: computed<string[]>(() => {
        if (state.currentMetricExampleId) {
            return namespaceMetricExamples.value
                ?.filter((d) => d.example_id !== state.currentMetricExampleId)
                .map((d) => d.name);
        }
        if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_CUSTOM_METRIC) {
            return currentNamespaceMetrics.value?.map((d) => d.name) || [];
        }
        return currentNamespaceMetrics.value
            ?.filter((d) => d.metric_id !== currentMetric.value?.metric_id)
            .map((metric) => metric.name) || [];
    }),
    headerTitle: computed<TranslateResult>(() => {
        if (props.type === NAME_FORM_MODAL_TYPE.ADD_EXAMPLE) return i18n.t('INVENTORY.METRIC_EXPLORER.ADD_EXAMPLE');
        if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_EXAMPLE) return i18n.t('INVENTORY.METRIC_EXPLORER.SAVE_AS_METRIC_EXAMPLE');
        if (props.type === NAME_FORM_MODAL_TYPE.EDIT_NAME) {
            if (state.currentMetricExampleId) return i18n.t('INVENTORY.METRIC_EXPLORER.EDIT_METRIC_EXAMPLE_NAME');
            return i18n.t('INVENTORY.METRIC_EXPLORER.EDIT_CUSTOM_METRIC_NAME');
        }
        if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_CUSTOM_METRIC) return i18n.t('INVENTORY.METRIC_EXPLORER.SAVE_AS_NEW_CUSTOM_METRIC');
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
} = useFormValidator<Record<string, string|undefined>>({
    name: undefined as string|undefined,
}, {
    name(value?: string) {
        if (!value) return i18n.t('INVENTORY.METRIC_EXPLORER.NAME_REQUIRED');
        if (value.length > 40) return i18n.t('INVENTORY.METRIC_EXPLORER.MAX_LENGTH_INVALID', { max: 40 });
        if (state.existingNameList.find((d) => d === value)) return i18n.t('INVENTORY.METRIC_EXPLORER.NAME_DUPLICATED');
        return true;
    },
});

/* Query */
const { data: currentMetric } = useMetricGetQuery({
    metricId: computed(() => route.params.metricId),
});
const { data: currentMetricExample } = useMetricExampleGetQuery({
    metricExampleId: computed(() => route.params.metricExampleId),
});
const { data: namespaceMetricExamples } = useMetricExampleListQuery({
    params: computed(() => ({
        namespace_id: metricExplorerPageState.selectedNamespaceId,
    })),
});
const { data: currentNamespaceMetrics } = useMetricListQuery({
    params: computed(() => ({
        namespace_id: currentMetric.value?.namespace_id,
    })),
});

/* Api */
const createMetricExample = async () => {
    try {
        const metricExample = await SpaceConnector.clientV2.inventory.metricExample.create<MetricExampleCreateParameters, MetricExampleModel>({
            metric_id: currentMetric.value?.metric_id || '',
            name: name.value,
            options: {
                granularity: metricExplorerPageState.granularity,
                period: metricExplorerPageState.period,
                relative_period: metricExplorerPageState.relativePeriod,
                group_by: metricExplorerPageState.selectedGroupByList,
                filters: metricExplorerPageState.filters,
                operator: metricExplorerPageState.selectedOperator,
            },
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_ADD_METRIC_EXAMPLE'), '');
        state.proxyVisible = false;
        await gnbStore.fetchMetricExample();
        await router.replace({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
            params: {
                metricId: metricExample.metric_id,
                metricExampleId: metricExample.example_id,
            },
        }).catch(() => {});
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_ADD_METRIC_EXAMPLE'));
    }
};
const updateMetricName = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>({
            metric_id: state.currentMetricId,
            name: name.value,
        });
        state.proxyVisible = false;
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_UPDATE_METRIC_NAME'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_UPDATE_METRIC_NAME'));
    }
};
const updateMetricExampleName = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metricExample.update<MetricExampleUpdateParameters, MetricExampleModel>({
            example_id: state.currentMetricExampleId,
            name: name.value,
        });
        state.proxyVisible = false;
        await gnbStore.fetchMetricExample();
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_UPDATE_METRIC_NAME'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_UPDATE_METRIC_NAME'));
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
            setForm('name', currentMetricExample.value?.name);
        } else {
            setForm('name', currentMetric.value?.name);
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
                           :label="$t('INVENTORY.METRIC_EXPLORER.NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  class="block w-full"
                                  :placeholder="$t('INVENTORY.METRIC_EXPLORER.NAME')"
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
