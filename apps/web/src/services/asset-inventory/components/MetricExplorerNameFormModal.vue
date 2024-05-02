<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricExampleCreateParameters } from '@/schema/inventory/metric-example/api-verbs/create';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { NAME_FORM_MODAL_TYPE } from '@/services/asset-inventory/constants/metric-explorer-constant';
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
    (e: 'confirm', name?: string): void;
}>();

const router = useRouter();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const { getProperRouteLocation } = useProperRouteLocation();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    existingNameList: computed<string[]>(() => {
        if (metricExplorerPageGetters.metricExampleId) {
            return metricExplorerPageState.metricExamples
                .filter((d) => d.example_id !== metricExplorerPageGetters.metricExampleId)
                .map((d) => d.name);
        }
        return metricExplorerPageGetters.metrics
            .filter((d) => d.key !== metricExplorerPageState.metric?.metric_id)
            .map((metric) => metric.name);
    }),
    headerTitle: computed(() => {
        if (props.type === NAME_FORM_MODAL_TYPE.ADD_EXAMPLE) return i18n.t('INVENTORY.METRIC_EXPLORER.ADD_EXAMPLE');
        if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_EXAMPLE) return i18n.t('INVENTORY.METRIC_EXPLORER.SAVE_AS_METRIC_EXAMPLE');
        if (props.type === NAME_FORM_MODAL_TYPE.EDIT_NAME) {
            if (metricExplorerPageGetters.metricExampleId) return i18n.t('INVENTORY.METRIC_EXPLORER.EDIT_METRIC_EXAMPLE_NAME');
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
} = useFormValidator({
    name: undefined as string|undefined,
}, {
    name(value) {
        if (!value) return i18n.t('INVENTORY.METRIC_EXPLORER.NAME_REQUIRED');
        if (state.existingNameList.find((d) => d === value)) return i18n.t('INVENTORY.METRIC_EXPLORER.NAME_DUPLICATED');
        return true;
    },
});

/* Api */
const createMetricExample = async () => {
    try {
        const metricExample = await SpaceConnector.clientV2.inventory.metricExample.create<MetricExampleCreateParameters, MetricExampleModel>({
            metric_id: metricExplorerPageState.metric?.metric_id || '',
            name: name.value,
            options: {
                granularity: metricExplorerPageState.granularity,
                period: metricExplorerPageState.period,
                relative_period: metricExplorerPageState.relativePeriod,
                group_by: metricExplorerPageState.selectedGroupByList,
                filters: metricExplorerPageState.filters,
            },
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_ADD_METRIC_EXAMPLE'), '');
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
            params: {
                metricId: metricExample.metric_id,
                metricExampleId: metricExample.example_id,
            },
        }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_ADD_METRIC_EXAMPLE'));
    }
};
const updateMetricName = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>({
            metric_id: metricExplorerPageGetters.metricId,
            name: name.value,
        });
        await metricExplorerPageStore.loadMetric(metricExplorerPageGetters.metricId);
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
        await updateMetricName();
    } else if (props.type === NAME_FORM_MODAL_TYPE.SAVE_AS_CUSTOM_METRIC) {
        emit('confirm', name.value);
    }
    state.proxyVisible = false;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible && props.type === NAME_FORM_MODAL_TYPE.EDIT_NAME) {
        if (metricExplorerPageGetters.metricExampleId) {
            setForm('name', metricExplorerPageGetters.metricExample?.name);
        } else {
            setForm('name', metricExplorerPageState.metric?.name);
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
