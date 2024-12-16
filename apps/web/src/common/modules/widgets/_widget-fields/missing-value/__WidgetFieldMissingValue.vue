<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import { PFieldGroup, PSelectButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { MissingValueValue, MissingValueOptions } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';


const emit = defineEmits<WidgetFieldComponentEmit<MissingValueValue>>();
const props = defineProps<WidgetFieldComponentProps<MissingValueOptions, MissingValueValue>>();

const state = reactive({
    proxyValue: useProxyValue<MissingValueValue>('value', props, emit),
    missingValueMenuItems: computed<MenuItem[]>(() => [
        {
            name: 'lineToZero',
            label: i18n.t('COMMON.WIDGETS.MISSING_VALUE.LINE_TO_ZERO'),
        },
        {
            name: 'lineBreaks',
            label: i18n.t('COMMON.WIDGETS.MISSING_VALUE.LINE_BREAKS'),
        },
    ]),
    selected: 'lineToZero',
});

/* Event */
const handleChangeMissingValue = (value: string) => {
    state.selected = value;
    state.proxyValue = {
        value,
    };
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = {
        value: props.value?.value ?? props.widgetFieldSchema?.options?.default ?? 'lineToZero',
    };
    state.selected = state.proxyValue.value;
});
</script>

<template>
    <div class="widget-field-max">
        <p-field-group :label="$t('COMMON.WIDGETS.MISSING_VALUE.MISSING_VALUE')"
                       required
        >
            <p-select-button v-for="selectItem in state.missingValueMenuItems"
                             :key="`select-button-${selectItem.name}`"
                             :value="selectItem.name"
                             style-type="secondary"
                             :selected="state.selected"
                             class="mr-2"
                             @change="handleChangeMissingValue"
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
