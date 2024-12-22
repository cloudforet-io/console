<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PFieldGroup, PSelectButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { WIDGET_HEIGHT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type {
    WidgetHeightOptions,
    WidgetHeightValue,
} from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'widgetHeight';

const props = withDefaults(defineProps<_WidgetFieldComponentProps<WidgetHeightOptions>>(), {
});

const state = reactive({
    fieldValue: computed<WidgetHeightValue>(() => props.fieldManager.data[FIELD_KEY].value),
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
});

const handleChangeWidgetHeight = (value: WidgetHeightValue['type']) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        type: value,
    });
};

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
                                 :selected="state.fieldValue?.type"
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
