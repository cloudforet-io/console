<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PFieldGroup, PFieldTitle, PToggleButton, PSelectDropdown,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import {
    widgetFieldDefaultValueMap,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/default-value-registry';
import type { LegendValue, _LegendOptions } from '@/common/modules/widgets/_widget-fields/legend/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'legend';

const props = defineProps<_WidgetFieldComponentProps<_LegendOptions>>();

const state = reactive({
    fieldValue: computed<LegendValue>(() => props.fieldManager.data[FIELD_KEY].value),
    showPositionField: computed<boolean>(() => !!props.widgetFieldSchema?.options?.showPositionField),
    positionMenuItems: computed(() => ([
        { name: 'right', label: i18n.t('COMMON.WIDGETS.LEGEND.RIGHT') },
        { name: 'left', label: i18n.t('COMMON.WIDGETS.LEGEND.LEFT') },
        { name: 'top', label: i18n.t('COMMON.WIDGETS.LEGEND.TOP') },
        { name: 'bottom', label: i18n.t('COMMON.WIDGETS.LEGEND.BOTTOM') },
    ])),
});

const handleUpdateToggleValue = (val: boolean) => {
    if (val) {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: true,
            position: state.showPositionField ? widgetFieldDefaultValueMap.legend.position : undefined,
        });
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: false,
        });
    }
};
const handleSelectPosition = (val: 'right'|'bottom'|'left'|'top') => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        position: val,
    });
};

</script>

<template>
    <div class="widget-field-legend">
        <div class="top-part">
            <p-field-title>{{ $t('COMMON.WIDGETS.LEGEND.LEGEND') }}</p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             @update:value="handleUpdateToggleValue"
            />
        </div>
        <p-field-group v-if="props.widgetFieldSchema?.options?.showPositionField"
                       :label="$t('COMMON.WIDGETS.LEGEND.POSITION')"
                       style-type="secondary"
                       class="position-wrapper"
        >
            <p-select-dropdown use-fixed-menu-style
                               reset-selection-on-menu-close
                               :menu="state.positionMenuItems"
                               :selected="state.fieldValue?.position"
                               block
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
