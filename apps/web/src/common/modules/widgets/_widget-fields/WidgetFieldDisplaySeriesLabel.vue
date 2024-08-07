<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PSelectDropdown, PFieldTitle, PToggleButton, PSlider,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';
import type {
    DisplaySeriesLabelValue,
} from '@/common/modules/widgets/types/widget-field-value-type';


const ROTATE_MIN = -90;
const ROTATE_MAX = 90;
const emit = defineEmits<WidgetFieldComponentEmit<DisplaySeriesLabelValue>>();
const props = defineProps<WidgetFieldComponentProps<undefined, DisplaySeriesLabelValue>>();
const state = reactive({
    proxyValue: useProxyValue<DisplaySeriesLabelValue|undefined>('value', props, emit),
    menuItems: computed<SelectDropdownMenuItem[]>(() => [
        { name: 'center', label: 'Center' },
        { name: 'left', label: 'Left' },
        { name: 'right', label: 'Right' },
    ]),
    isRotateValid: computed<boolean>(() => {
        if (!state.proxyValue?.toggleValue) return true;
        if (state.proxyValue?.rotate === undefined) return false;
        if (state.proxyValue.rotate < ROTATE_MIN || state.proxyValue.rotate > ROTATE_MAX) return false;
        return true;
    }),
    rotateInvalidText: computed(() => {
        if (!state.proxyValue?.toggleValue) return '';
        if (state.proxyValue?.rotate === undefined) return '';
        if (state.proxyValue.rotate < ROTATE_MIN) return i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.ROTATE_MIN_INVALID_TEXT');
        if (state.proxyValue.rotate > ROTATE_MAX) return i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.ROTATE_MAX_INVALID_TEXT');
        return '';
    }),
    isAllValid: computed(() => state.isRotateValid),
});

/* Util */

/* Event */
const handleUpdateToggle = (value: boolean) => {
    if (!value) {
        state.proxyValue = undefined;
        return;
    }
    state.proxyValue = {
        toggleValue: value,
        position: 'center',
        rotate: 0,
    };
};
const handleSelectMenuItem = (selected: string) => {
    state.proxyValue = {
        ...state.proxyValue,
        position: selected,
    };
};
const handleUpdateRotate = (value: number) => {
    state.proxyValue = {
        ...state.proxyValue,
        rotate: value,
    };
};

/* Watcher */
watch(() => state.isAllValid, (_isAllValid) => {
    emit('update:is-valid', _isAllValid);
}, { immediate: true });

onMounted(() => {
    if (!props.value) {
        state.proxyValue = undefined;
        return;
    }
    state.proxyValue = {
        toggleValue: props.value?.toggleValue ?? false,
        position: props.value?.position ?? 'center',
        rotate: props.value?.rotate ?? 0,
    };
});
</script>

<template>
    <div class="widget-field-display-series-label">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.DISPLAY_SERIES_LABEL') }}</p-field-title>
            <p-toggle-button :value="state.proxyValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.proxyValue?.toggleValue"
             class="contents"
        >
            <p-field-group :label="$t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.POSITION')"
                           style-type="secondary"
            >
                <p-select-dropdown class="w-full"
                                   use-fixed-menu-style
                                   reset-selection-on-menu-close
                                   :menu="state.menuItems"
                                   :selected="state.proxyValue?.position"
                                   @select="handleSelectMenuItem"
                />
            </p-field-group>
            <p-field-group :label="$t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.ROTATE')"
                           style-type="secondary"
                           :invalid="!state.isRotateValid"
                           :invalid-text="state.rotateInvalidText"
            >
                <p-slider :value="state.proxyValue?.rotate"
                          :min="-90"
                          :max="90"
                          show-input
                          @update:value="handleUpdateRotate"
                />
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-display-series-label {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .contents {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-top: 0.5rem;

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
            .p-text-input {
                width: 4rem;
            }
        }
    }
}
</style>
