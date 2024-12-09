<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PToggleButton,
} from '@cloudforet/mirinae';

import type { TooltipNumberFormatOptions, TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'tooltipNumberFormat';

const props = defineProps<_WidgetFieldComponentProps<TooltipNumberFormatOptions>>();

const state = reactive({
    fieldValue: computed<TooltipNumberFormatValue>(() => props.fieldManager.data[FIELD_KEY].value),
});

const handleUpdateToggleValue = (val: boolean) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        toggleValue: val,
    });
};

</script>

<template>
    <div class="widget-field-tooltip-number-format">
        <p-field-title>{{ $t('COMMON.WIDGETS.TOOLTIP_NUMBER_FORMAT.TOOLTIP_NUMBER_FORMAT') }}</p-field-title>
        <p-toggle-button :value="state.fieldValue?.toggleValue"
                         @update:value="handleUpdateToggleValue"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-tooltip-number-format {
    @apply flex items-center gap-1 justify-between;
}
</style>
