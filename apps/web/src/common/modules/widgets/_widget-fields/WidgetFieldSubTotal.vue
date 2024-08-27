<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PFieldTitle, PToggleButton, PCheckbox, PI, PTooltip,
} from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { TotalOptions, WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';
import type { TotalValue, TableDataFieldValue } from '@/common/modules/widgets/types/widget-field-value-type';


const emit = defineEmits<WidgetFieldComponentEmit<TotalValue|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<TotalOptions, TotalValue>>(), {
    widgetFieldSchema: () => ({
        options: {
            toggle: false,
            default: false,
        },
    }),
});

const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    disabled: computed(() => {
        const tableDataField = props.allValueMap?.tableDataField as TableDataFieldValue;
        if (!tableDataField) return false;
        if (tableDataField.fieldType === 'staticField') return true;
        return false;
    }),
});

const handleUpdateValue = (value: boolean) => {
    if (!state.proxyValue?.toggleValue) {
        state.proxyValue = undefined;
    } else {
        state.proxyValue = {
            ...state.proxyValue,
            freeze: value,
        };
    }
    emit('update:value', state.proxyValue);
};
const handleUpdateToggle = (value: boolean) => {
    state.proxyValue = {
        toggleValue: value,
        freeze: props.widgetFieldSchema.options?.default ?? false,
    };
    if (value) emit('update:value', state.proxyValue);
    else {
        state.proxyValue = undefined;
        emit('update:value', state.proxyValue);
    }
};

onMounted(() => {
    emit('update:is-valid', true);
    if (!props.value) {
        state.proxyValue = undefined;
        return;
    }
    state.proxyValue = {
        toggleValue: props.value.toggleValue ?? props.widgetFieldSchema.options?.toggle ?? false,
        freeze: props.value.freeze ?? props.widgetFieldSchema.options?.default ?? false,
    };
});
</script>

<template>
    <div class="widget-field-total">
        <div class="field-header">
            <p-field-title>
                {{ $t('COMMON.WIDGETS.SUB_TOTAL.SUB_TOTAL') }}
                <p-tooltip :contents="$t('COMMON.WIDGETS.SUB_TOTAL.INFO_TEXT')">
                    <p-i name="ic_info-circle"
                         width="0.875rem"
                         height="0.875rem"
                    />
                </p-tooltip>
            </p-field-title>
            <p-toggle-button :value="state.proxyValue?.toggleValue"
                             :disabled="state.disabled"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.proxyValue?.toggleValue"
             class="contents"
        >
            <p-checkbox :selected="state.proxyValue?.freeze"
                        @change="handleUpdateValue"
            >
                {{ $t('COMMON.WIDGETS.TOTAL.SUB_TOTAL_DESC') }}
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
