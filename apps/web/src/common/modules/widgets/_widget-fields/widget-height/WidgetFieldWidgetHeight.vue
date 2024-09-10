<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';

import {
    PFieldGroup, PSelectButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import { WIDGET_HEIGHT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { WidgetHeightValue, WidgetHeightOptions } from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type {
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const emit = defineEmits<WidgetFieldComponentEmit<WidgetHeightValue|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<WidgetHeightOptions, WidgetHeightValue>>(), {
});

const state = reactive({
    widgetHeightMenuItems: computed<MenuItem[]>(() => [
        {
            name: WIDGET_HEIGHT.default,
            label: '50%',
        },
        {
            name: WIDGET_HEIGHT.full,
            label: '100%',
        },
    ]),
    proxyValue: useProxyValue('value', props, emit),
});

const handleChangeWidgetHeight = (value: boolean) => {
    if (!state.proxyValue?.value) {
        state.proxyValue = undefined;
    } else {
        state.proxyValue = {
            value,
        };
    }
    emit('update:value', state.proxyValue);
};

onMounted(() => {
    emit('update:is-valid', true);
    state.proxyValue = {
        value: props.value?.value ?? props.widgetFieldSchema?.options?.default ?? WIDGET_HEIGHT.default,
    };
});
</script>

<template>
    <div class="widget-field-widget-height">
        <p-field-group :label="$t('COMMON.WIDGETS.WIDGET_HEIGHT.WIDGET_HEIGHT')"
                       required
        >
            <div class="widget-height-select-wrapper">
                <p-select-button v-for="selectItem in state.widgetHeightMenuItems"
                                 :key="`select-button-${selectItem.name}`"
                                 :value="selectItem.name"
                                 style-type="secondary"
                                 :selected="state.proxyValue?.value"
                                 @change="handleChangeWidgetHeight"
                >
                    {{ selectItem.label }}
                </p-select-button>
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.widget-height-select-wrapper {
    display: flex;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
