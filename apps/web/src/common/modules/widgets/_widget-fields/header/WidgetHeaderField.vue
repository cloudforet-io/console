<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PFieldGroup, PI, PTextarea, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import {
    widgetValidatorRegistry,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'widgetHeader';

const props = defineProps<WidgetFieldComponentProps<undefined>>();

const validator = widgetValidatorRegistry[FIELD_KEY];

const state = reactive({
    fieldValue: computed<WidgetHeaderValue>(() => props.fieldManager.data[FIELD_KEY].value),
    invalid: computed(() => !validator(state.fieldValue, props.widgetConfig)),
    titleInvalidText: computed(() => {
        if (state.invalid) {
            return i18n.t('COMMON.WIDGETS.WIDGET_TITLE_REQUIRED');
        }
        return undefined;
    }),
});

/* Event */
const handleToggleWidgetHeader = (value: boolean) => {
    if (value) {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: true,
            title: props.widgetConfig?.meta?.title,
            description: undefined,
        });
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: false,
            title: undefined,
            description: undefined,
        });
    }
};
const handleUpdateValue = (key: string, value: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        [key]: value?.trim() || '',
    });
};

</script>
<template>
    <div class="form-group-wrapper"
         :class="{ 'collapsed': !state.fieldValue?.toggleValue }"
    >
        <div class="title-wrapper flex justify-between align-middle"
             :class="{ 'disabled': !state.fieldValue?.toggleValue }"
        >
            <div class="left-part">
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.WIDGET_HEADER') }}</span>
            </div>
            <div class="right-part flex">
                <p-toggle-button :value="state.fieldValue?.toggleValue"
                                 @update:value="handleToggleWidgetHeader"
                />
            </div>
        </div>
        <div class="form-wrapper">
            <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TITLE')"
                           :invalid-text="state.titleInvalidText"
                           :invalid="state.invalid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="state.fieldValue?.title"
                                  :invalid="invalid"
                                  @update:value="handleUpdateValue('title', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DESCRIPTION')">
                <p-textarea :value="state.fieldValue?.description"
                            @update:value="handleUpdateValue('description', $event)"
                />
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.form-group-wrapper {
    @apply border-t border-gray-200;
    &.collapsed {
        .form-wrapper {
            display: none;
        }
        .arrow-button {
            transform: rotate(-90deg);
        }
        .title-wrapper {
            padding: 1rem 0;
        }
    }
    .arrow-button {
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    .form-wrapper {
        @apply flex flex-col;
        padding: 1rem 1.25rem 1rem 1.25rem;
    }
    .title-wrapper {
        @apply text-label-lg;
        font-weight: 700;
        padding-top: 1rem;
        vertical-align: middle;
        cursor: pointer;
        .right-part {
            padding-right: 1.5rem;
        }
        &.disabled {
            cursor: default;
            .arrow-button {
                @apply text-gray-700;
                opacity: 0.5;
            }
        }
    }
}
</style>
