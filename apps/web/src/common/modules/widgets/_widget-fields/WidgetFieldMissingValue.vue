<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import { PFieldGroup, PSelectButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    MissingValueOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { MissingValue } from '@/common/modules/widgets/types/widget-field-value-type';


const emit = defineEmits<WidgetFieldComponentEmit<MissingValue>>();
const props = defineProps<WidgetFieldComponentProps<MissingValueOptions, MissingValue>>();

const state = reactive({
    proxyValue: useProxyValue<MissingValue>('value', props, emit),
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
    state.proxyValue = props.value ?? { value: 'lineToZero' };
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
