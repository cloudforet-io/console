<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';

import { PFieldGroup, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
    DateFormatOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { DateFormatValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = defineProps<WidgetFieldComponentProps<DateFormatOptions, DateFormatValue>>();
const emit = defineEmits<WidgetFieldComponentEmit<DateFormatValue>>();
const state = reactive({
    menuItems: computed<MenuItem[]>(() => Object.keys(DATE_FORMAT).map((d) => ({
        name: d,
        label: d,
    }))),
    proxyValue: useProxyValue('value', props, emit),
    selectedMenuItem: props.value ?? props.widgetConfig?.optionalFieldsSchema.dateFormat?.options?.default ?? Object.keys(DATE_FORMAT)[0] as undefined | MenuItem[] | string,
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    state.selectedMenuItem = val;
    state.proxyValue = val;
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = props.value ?? props.widgetConfig?.optionalFieldsSchema.dateFormat?.options?.default ?? Object.keys(DATE_FORMAT)[0];
});


</script>

<template>
    <div class="widget-date-format">
        <p-field-group :label="$t('Date Format')"
                       required
        >
            <p-select-dropdown :menu="state.menuItems"
                               :selected="state.selectedMenuItem"
                               use-fixed-menu-style
                               @update:selected="handleUpdateSelect"
            />
        </p-field-group>
    </div>
</template>
