<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import { PFieldGroup, PSelectButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import { DATE_AGGREGATION_OPTIONS } from '@/common/modules/widgets/_widget-fields/data-aggregation-options/constant';
import type {
    DateAggregationOptionsOptions,
    DateAggregationOptionsValue,
    DateAggregationOtionsType,
} from '@/common/modules/widgets/_widget-fields/data-aggregation-options/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<DateAggregationOptionsValue>>();
const props = defineProps<WidgetFieldComponentProps<DateAggregationOptionsOptions, DateAggregationOptionsValue>>();

const DEFAULT_OPTIONS = DATE_AGGREGATION_OPTIONS.AGGREGATED;

const state = reactive({
    proxyValue: useProxyValue<DateAggregationOptionsValue>('value', props, emit),
    dateAggregationOptionsMenuItems: computed<MenuItem[]>(() => [
        {
            name: DATE_AGGREGATION_OPTIONS.AGGREGATED,
            label: i18n.t('COMMON.WIDGETS.DATE_AGGREGATION_OPTIONS.AGGREGATED'),
        },
        {
            name: DATE_AGGREGATION_OPTIONS.LATEST,
            label: i18n.t('COMMON.WIDGETS.DATE_AGGREGATION_OPTIONS.LATEST'),
        },
    ]),
    selected: DEFAULT_OPTIONS as DateAggregationOtionsType,
});

/* Event */
const handleChangeDateAggregationOptions = (value: DateAggregationOtionsType) => {
    state.selected = value;
    state.proxyValue = {
        value,
    };
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = {
        value: props.value?.value ?? props.widgetFieldSchema?.options?.default ?? DEFAULT_OPTIONS,
    };
    state.selected = state.proxyValue.value;
});
</script>

<template>
    <div class="widget-field-date-aggregation-options">
        <p-field-group :label="$t('COMMON.WIDGETS.DATE_AGGREGATION_OPTIONS.DATE_AGGREGATION_OPTIONS')"
                       required
        >
            <p-select-button v-for="selectItem in state.dateAggregationOptionsMenuItems"
                             :key="`select-button-${selectItem.name}`"
                             :value="selectItem.name"
                             style-type="secondary"
                             :selected="state.selected"
                             class="mr-2"
                             @change="handleChangeDateAggregationOptions"
            >
                {{ selectItem.label }}
            </p-select-button>
        </p-field-group>
    </div>
</template>

<style scoped lang="scss">
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
