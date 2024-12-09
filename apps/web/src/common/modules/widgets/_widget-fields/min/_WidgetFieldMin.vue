<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { MinOptions, MinValue } from '@/common/modules/widgets/_widget-fields/min/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'min';

const props = defineProps<_WidgetFieldComponentProps<MinOptions>>();

const state = reactive({
    fieldValue: computed<MinValue>(() => props.fieldManager.data[FIELD_KEY].value),
});

const handleUpdateValue = (value: string|'') => {
    const parsedValue = value === '' ? 0 : parseInt(value);
    props.fieldManager.setFieldValue(FIELD_KEY, {
        min: (parsedValue < 0) ? 0 : parsedValue,
    });
};

</script>

<template>
    <div class="widget-field-min">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.MIN')"
                       required
        >
            <p-text-input type="number"
                          :min="0"
                          :value="state.fieldValue.min"
                          @update:value="handleUpdateValue"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
