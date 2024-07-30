<script lang="ts" setup>
import { onMounted, reactive } from 'vue';

import { PFieldTitle, PToggleButton } from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps, WidgetFieldComponentEmit, AbbreviationOptions,
} from '@/common/modules/widgets/types/widget-field-type';
import type { AbbreviationValue } from '@/common/modules/widgets/types/widget-field-value-type';


const emit = defineEmits<WidgetFieldComponentEmit<AbbreviationValue|undefined>>();

const props = defineProps<WidgetFieldComponentProps<AbbreviationOptions, AbbreviationValue>>();

const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
});

const handleUpdateToggle = (value: boolean) => {
    state.proxyValue = {
        toggleValue: props.widgetFieldSchema?.options?.toggle ?? false,
    };
    if (value) emit('update:value', state.proxyValue);
    else {
        state.proxyValue = undefined;
        emit('update:value', state.proxyValue);
    }
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = {
        toggleValue: props.value?.toggleValue ?? false,
    };
});
</script>

<template>
    <div class="widget-field-total">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.ABBREVIATION.ABBREVIATION') }}</p-field-title>
            <p-toggle-button :value="state.proxyValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div class="contents">
            {{ $t('COMMON.WIDGETS.ABBREVIATION.CONTENTS') }}
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-total {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }
    .contents {
        @apply text-paragraph-sm;
        margin-top: 0.25rem;
    }
}
</style>
