<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const router = useRouter();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const { getProperRouteLocation } = useProperRouteLocation();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    existingMetricNameList: computed<string[]>(() => metricExplorerPageState.metricList
        .filter((d) => d.name !== metricExplorerPageState.metric?.name)
        .map((metric) => metric.name)),
});
const {
    forms: { metricName },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    initForm,
} = useFormValidator({
    metricName: '',
}, {
    metricName(value) {
        if (!value) return i18n.t('INVENTORY.METRIC_EXPLORER.NAME_REQUIRED');
        if (state.existingMetricNameList.find((name) => name === value)) return i18n.t('INVENTORY.METRIC_EXPLORER.NAME_DUPLICATED');
        return true;
    },
});

const saveQuery = async () => {
    if (!metricName.value || !metricExplorerPageState.metric) return;
    try {
        const newMetric = await SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>({
            metric_id: metricExplorerPageState.metric.metric_id,
            name: metricName.value,
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_SAVE_AS_METRIC'), '');
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: { id: newMetric.metric_id },
        }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_SAVE_AS_METRIC'));
    }
};

/* Event */
const handleFormConfirm = async () => {
    if (!isAllValid) return;
    await saveQuery();
    state.proxyVisible = false;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible) {
        setForm('metricName', metricExplorerPageState.metric?.name);
    } else initForm();
});

</script>

<template>
    <p-button-modal
        :header-title="$t('INVENTORY.METRIC_EXPLORER.EDIT_METRIC_NAME')"
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
                           :invalid="invalidState.metricName"
                           :invalid-text="invalidTexts.metricName"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="metricName"
                                  class="block w-full"
                                  :placeholder="$t('INVENTORY.METRIC_EXPLORER.NAME')"
                                  :invalid="invalid"
                                  @update:value="setForm('metricName', $event)"
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
