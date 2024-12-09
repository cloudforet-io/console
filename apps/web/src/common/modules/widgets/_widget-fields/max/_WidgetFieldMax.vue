<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { MaxOptions, MaxValue } from '@/common/modules/widgets/_widget-fields/max/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'max';

const props = defineProps<_WidgetFieldComponentProps<MaxOptions>>();

const state = reactive({
    fieldValue: computed<MaxValue>(() => props.fieldManager.data[FIELD_KEY].value),
});

const handleUpdateValue = (value: string|'') => {
    const parsedValue = value === '' ? 0 : parseInt(value);
    props.fieldManager.setFieldValue(FIELD_KEY, {
        max: (parsedValue < 0) ? 0 : parsedValue,
    });
};

</script>

<template>
    <div class="widget-field-max">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.MAX')"
                       required
        >
            <p-text-input type="number"
                          :min="0"
                          :value="state.fieldValue.max"
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
