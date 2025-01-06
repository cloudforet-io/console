<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PFieldTitle, PToggleButton } from '@cloudforet/mirinae';

import type { TextWrapValue, TextWrapOptions } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'textWrap';

const props = defineProps<WidgetFieldComponentProps<TextWrapOptions>>();

const state = reactive({
    fieldValue: computed<TextWrapValue>(() => props.fieldManager.data[FIELD_KEY].value),
});

const handleUpdateToggle = (value: boolean) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        toggleValue: value,
    });
};

</script>

<template>
    <div class="widget-field-text-wrap">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.TEXT_WRAP.TEXT_WRAP') }}</p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <p class="description">
            {{ $t('COMMON.WIDGETS.TEXT_WRAP.DESCRIPTION') }}
        </p>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-text-wrap {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }
    .description {
        @apply text-paragraph-sm text-gray-900;
        margin-top: 0.25rem;
    }
}
</style>
