<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PFieldTitle, PToggleButton, PCheckbox } from '@cloudforet/mirinae';

import type { TotalValue, TotalOptions } from '@/common/modules/widgets/_widget-fields/total/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const FIELD_KEY = 'total';

const props = defineProps<_WidgetFieldComponentProps<TotalOptions>>();

const state = reactive({
    fieldValue: computed<TotalValue>(() => props.fieldManager.data[FIELD_KEY].value),
});

const handleUpdateValue = (value: boolean) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        freeze: value,
    });
};
const handleUpdateToggle = (value: boolean) => {
    if (value) {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: true,
            freeze: true,
        });
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: false,
        });
    }
};

</script>

<template>
    <div class="widget-field-total">
        <div class="field-header">
            <p-field-title>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TOTAL') }}</p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.fieldValue?.toggleValue"
             class="contents"
        >
            <p-checkbox :selected="state.fieldValue?.freeze"
                        @change="handleUpdateValue"
            >
                {{ $t('COMMON.WIDGETS.TOTAL.DESC') }}
            </p-checkbox>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-total {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .contents {
        @apply flex gap-2;
        margin-top: 0.5rem;
    }
}
</style>
