<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PFieldGroup, PFieldTitle, PToggleButton, PSelectDropdown,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { LegendOptions, WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';
import type { LegendValue } from '@/common/modules/widgets/types/widget-field-value-type';


const emit = defineEmits<WidgetFieldComponentEmit<boolean|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<LegendOptions, LegendValue>>(), {
    widgetFieldSchema: () => ({
        options: {
            default: false,
        },
    }),
});

const state = reactive({
    proxyValue: useProxyValue<LegendValue>('value', props, emit),
    showPositionField: computed<boolean>(() => !!props.widgetFieldSchema.options?.showPositionField),
    positionMenuItems: computed(() => ([
        { name: 'right', label: i18n.t('COMMON.WIDGETS.LEGEND.RIGHT') },
        { name: 'bottom', label: i18n.t('COMMON.WIDGETS.LEGEND.BOTTOM') },
    ])),
});

const handleUpdateToggleValue = (val: boolean) => {
    if (val) {
        state.proxyValue = {
            toggleValue: val,
            position: state.showPositionField ? 'right' : undefined,
        };
    } else {
        state.proxyValue = {
            toggleValue: val,
            position: undefined,
        };
    }
};
const handleSelectPosition = (val: 'right'|'bottom') => {
    state.proxyValue = {
        ...state.proxyValue,
        position: val,
    };
};

onMounted(() => {
    emit('update:is-valid', true);
    const _toggleValue = props.value?.toggleValue ?? props.widgetFieldSchema.options?.default ?? false;
    let _position = props.value?.position;
    if (_toggleValue && state.showPositionField && !_position) {
        _position = 'right';
    }
    state.proxyValue = {
        toggleValue: _toggleValue,
        position: _position,
    };
});
</script>

<template>
    <div class="widget-field-legend">
        <div class="top-part">
            <p-field-title>{{ $t('COMMON.WIDGETS.LEGEND.LEGEND') }}</p-field-title>
            <p-toggle-button :value="state.proxyValue.toggleValue"
                             @update:value="handleUpdateToggleValue"
            />
        </div>
        <p-field-group v-if="props.widgetFieldSchema.options?.showPositionField"
                       :label="$t('COMMON.WIDGETS.LEGEND.POSITION')"
                       style-type="secondary"
                       class="position-wrapper"
        >
            <p-select-dropdown class="w-full"
                               use-fixed-menu-style
                               reset-selection-on-menu-close
                               :menu="state.positionMenuItems"
                               :selected="state.proxyValue?.position"
                               @select="handleSelectPosition"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-legend {
    .top-part {
        @apply flex items-center gap-1 justify-between;
    }
    .position-wrapper {
        padding-top: 0.5rem;
        margin-bottom: 0;
    }
}
</style>
