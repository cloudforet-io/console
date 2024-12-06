<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PFieldGroup, PSelectDropdown, PFieldTitle, PToggleButton, PSlider,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import type { DisplaySeriesLabelValue, DisplaySeriesLabelOptions } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';



const ROTATE_MIN = -90;
const ROTATE_MAX = 90;
const FIELD_KEY = 'displaySeriesLabel';

const props = defineProps<_WidgetFieldComponentProps<DisplaySeriesLabelOptions>>();
const state = reactive({
    fieldValue: computed<DisplaySeriesLabelValue>(() => props.fieldManager.data[FIELD_KEY].value),
    menuItems: computed<SelectDropdownMenuItem[]>(() => {
        const _widgetName = props.widgetConfig?.widgetName;
        if (!_widgetName) return [];
        if (_widgetName === 'pieChart') {
            return [
                { name: 'inner', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.INNER') },
                { name: 'outer', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.OUTER') },
            ];
        }
        if (['lineChart', 'stackedAreaChart'].includes(_widgetName)) {
            return [
                { name: 'top', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.TOP') },
                { name: 'bottom', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.BOTTOM') },
            ];
        }

        return [
            { name: 'inside', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.INSIDE') },
            { name: 'left', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.LEFT') },
            { name: 'right', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.RIGHT') },
            { name: 'insideLeft', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.INSIDE_LEFT') },
            { name: 'insideRight', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.INSIDE_RIGHT') },
            { name: 'insideTop', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.INSIDE_TOP') },
            { name: 'insideBottom', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.INSIDE_BOTTOM') },
        ];
    }),
    formatMenuItems: computed<SelectDropdownMenuItem[]>(() => [
        { name: 'numeric', label: i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.NUMERICAL_VALUE') },
        { name: 'percent', label: '%' },
    ]),
    isRotateValid: computed<boolean>(() => {
        if (!state.fieldValue?.toggleValue || !state.fieldValue?.rotate) return true;
        if (state.fieldValue.rotate < ROTATE_MIN || state.fieldValue.rotate > ROTATE_MAX) return false;
        return true;
    }),
    rotateInvalidText: computed(() => {
        if (!state.fieldValue?.toggleValue) return '';
        if (state.fieldValue?.rotate === undefined) return '';
        if (state.fieldValue.rotate < ROTATE_MIN) return i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.ROTATE_MIN_INVALID_TEXT');
        if (state.fieldValue.rotate > ROTATE_MAX) return i18n.t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.ROTATE_MAX_INVALID_TEXT');
        return '';
    }),
});

/* Util */

/* Event */
const handleUpdateToggle = (value: boolean) => {
    if (!value) {
        props.fieldManager.setFieldValue(FIELD_KEY, { toggleValue: false });
        return;
    }
    props.fieldManager.setFieldValue(FIELD_KEY, {
        toggleValue: true,
        position: state.menuItems[0].name,
        rotate: 0,
        format: props.widgetFieldSchema?.options?.showFormatField ? state.formatMenuItems[0].name : undefined,
    });
};
const handleSelectMenuItem = (selected: DisplaySeriesLabelValue['position']) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        position: selected,
    });
};
const handleUpdateRotate = (value: number) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        rotate: value,
    });
};
const handleSelectFormatMenuItem = (selected: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        format: selected,
    });
};

</script>

<template>
    <div class="widget-field-display-series-label">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.DISPLAY_SERIES_LABEL') }}</p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.fieldValue?.toggleValue"
             class="contents"
        >
            <p-field-group :label="$t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.POSITION')"
                           style-type="secondary"
            >
                <p-select-dropdown use-fixed-menu-style
                                   reset-selection-on-menu-close
                                   :menu="state.menuItems"
                                   :selected="state.fieldValue?.position"
                                   block
                                   @select="handleSelectMenuItem"
                />
            </p-field-group>
            <p-field-group :label="$t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.ROTATE')"
                           style-type="secondary"
                           :invalid="!state.isRotateValid"
                           :invalid-text="state.rotateInvalidText"
            >
                <p-slider :value="state.fieldValue?.rotate"
                          :min="-90"
                          :max="90"
                          show-input
                          @update:value="handleUpdateRotate"
                />
            </p-field-group>
            <p-field-group v-if="props.widgetFieldSchema?.options?.showFormatField"
                           :label="$t('COMMON.WIDGETS.DISPLAY_SERIES_LABEL.FORMAT')"
                           style-type="secondary"
            >
                <p-select-dropdown use-fixed-menu-style
                                   reset-selection-on-menu-close
                                   :menu="state.formatMenuItems"
                                   :selected="state.fieldValue?.format"
                                   block
                                   @select="handleSelectFormatMenuItem"
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
