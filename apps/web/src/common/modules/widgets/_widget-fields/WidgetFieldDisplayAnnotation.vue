<script lang="ts" setup>
import { onMounted, reactive, watch } from 'vue';

import {
    PFieldTitle, PToggleButton, PTextInput, PFieldGroup,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';
import type { WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';
import type { DisplayAnnotationValue } from '@/common/modules/widgets/types/widget-field-value-type';


const emit = defineEmits<WidgetFieldComponentEmit<DisplayAnnotationValue|undefined>>();
const props = defineProps<WidgetFieldComponentProps<undefined, DisplayAnnotationValue>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
});
const {
    forms: {
        annotation,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    annotation: '',
}, {
    annotation(value: string) {
        if (!state.proxyValue?.toggleValue) return true;
        if (!value.length) return i18n.t('COMMON.WIDGETS.DISPLAY_ANNOTATION.INVALID_VALUE');
        return true;
    },
});

/* Event */
const handleUpdateToggle = (value: boolean) => {
    if (!value) {
        setForm('annotation', '');
        state.proxyValue = undefined;
        return;
    }
    state.proxyValue = {
        toggleValue: value,
        annotation: '',
    };
};
const handleUpdateAnnotation = (value: string) => {
    setForm('annotation', value);
    state.proxyValue = {
        toggleValue: true,
        annotation: value,
    };
};

/* Watcher */
watch(() => isAllValid.value, (_isAllValid) => {
    console.log('isAllValid', _isAllValid);
    emit('update:is-valid', _isAllValid);
});

onMounted(() => {
    emit('update:is-valid', true);
    if (!props.value) {
        state.proxyValue = undefined;
        return;
    }
    setForm('annotation', props.value.annotation);
});
</script>

<template>
    <div class="widget-field-display-annotation">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.DISPLAY_ANNOTATION.DISPLAY_ANNOTATION') }}</p-field-title>
            <p-toggle-button :value="state.proxyValue?.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.proxyValue?.toggleValue"
             class="contents"
        >
            <p-field-group :invalid-text="invalidTexts.annotation"
                           :invalid="invalidState.annotation"
            >
                <template #default="{invalid}">
                    <p-text-input :value="annotation"
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
</style>
