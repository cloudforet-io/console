<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import { PFieldGroup, PSelectButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    PieChartTypeOptions,
} from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<string>>();

const props = defineProps<WidgetFieldComponentProps<PieChartTypeOptions, string>>();

const state = reactive({
    proxyValue: useProxyValue<string>('value', props, emit),
    pieChartTypeMenuItems: computed<MenuItem[]>(() => [
        {
            name: 'pie',
            label: i18n.t('COMMON.WIDGETS.PIE'),
        },
        {
            name: 'donut',
            label: i18n.t('COMMON.WIDGETS.DONUT'),
        },
    ]),
    selectedPieChartType: 'pie',
});

/* Event */
const handleChangePieChartType = (value: string) => {
    state.selectedPieChartType = value;
    state.proxyValue = value;
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = props.value ?? 'pie';
});
</script>

<template>
    <div class="widget-field-max">
        <p-field-group :label="$t('COMMON.WIDGETS.PIE_CHART_TYPE')"
                       required
        >
            <p-select-button v-for="selectItem in state.pieChartTypeMenuItems"
                             :key="`select-button-${selectItem.name}`"
                             :value="selectItem.name"
                             style-type="secondary"
                             :selected="state.selectedPieChartType"
                             class="mr-2"
                             @change="handleChangePieChartType"
            >
                {{ selectItem.label }}
            </p-select-button>
        </p-field-group>
    </div>
</template>
