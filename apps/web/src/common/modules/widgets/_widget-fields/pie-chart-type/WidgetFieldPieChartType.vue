<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PFieldGroup, PSelectButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import type {
    PieChartTypeOptions,
    PieChartTypeValue,
} from '@/common/modules/widgets/_widget-fields/pie-chart-type/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const FIELD_KEY = 'pieChartType';

const props = defineProps<WidgetFieldComponentProps<PieChartTypeOptions>>();

const state = reactive({
    fieldValue: computed<PieChartTypeValue>(() => props.fieldManager.data[FIELD_KEY].value),
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
});

/* Event */
const handleChangePieChartType = (value: PieChartTypeValue['type']) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        type: value,
    });
};

</script>

<template>
    <div class="widget-field-pie-chart-type">
        <p-field-group :label="$t('COMMON.WIDGETS.PIE_CHART_TYPE')"
                       required
        >
            <p-select-button v-for="selectItem in state.pieChartTypeMenuItems"
                             :key="`select-button-${selectItem.name}`"
                             :value="selectItem.name"
                             style-type="secondary"
                             :selected="state.fieldValue.type"
                             class="mr-2"
                             @change="handleChangePieChartType"
            >
                {{ selectItem.label }}
            </p-select-button>
        </p-field-group>
    </div>
</template>
