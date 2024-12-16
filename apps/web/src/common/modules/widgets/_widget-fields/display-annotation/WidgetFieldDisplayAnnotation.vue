<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PFieldTitle, PToggleButton, PTextInput, PFieldGroup,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import {
    widgetValidatorRegistry,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type { DisplayAnnotationValue } from '@/common/modules/widgets/_widget-fields/display-annotation/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const FIELD_KEY = 'displayAnnotation';
const validator = widgetValidatorRegistry[FIELD_KEY];

const props = defineProps<_WidgetFieldComponentProps<undefined>>();
const state = reactive({
    fieldValue: computed<DisplayAnnotationValue>(() => props.fieldManager.data[FIELD_KEY].value),
    invalid: computed(() => !validator(state.fieldValue, props.widgetConfig)),
    invalidText: computed(() => {
        if (state.invalid) return i18n.t('COMMON.WIDGETS.DISPLAY_ANNOTATION.INVALID_VALUE');
        return '';
    }),
});

/* Event */
const handleUpdateToggle = (value: boolean) => {
    if (!value) {
        props.fieldManager.setFieldValue(FIELD_KEY, { toggleValue: false });
        return;
    }
    props.fieldManager.setFieldValue(FIELD_KEY, {
        toggleValue: true,
        annotation: '',
    });
};
const handleUpdateAnnotation = (value: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        toggleValue: true,
        annotation: value,
    });
};

</script>

<template>
    <div class="widget-field-display-annotation">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.DISPLAY_ANNOTATION.DISPLAY_ANNOTATION') }}</p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.fieldValue?.toggleValue"
             class="contents"
        >
            <p-field-group :invalid-text="state.invalidText"
                           :invalid="state.invalid"
            >
                <template #default="{invalid}">
                    <p-text-input :value="state.fieldValue.annotation"
                                  type="text"
                                  :placeholder="$t('COMMON.WIDGETS.DISPLAY_ANNOTATION.PLACEHOLDER')"
                                  :invalid="invalid"
                                  @update:value="handleUpdateAnnotation"
                    />
                </template>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-display-annotation {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .contents {
        @apply flex gap-2;
        margin-top: 0.5rem;
        .p-field-group {
            width: 100%;
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
