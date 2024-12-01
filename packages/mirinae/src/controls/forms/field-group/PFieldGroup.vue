<template>
    <div class="p-field-group"
         :class="{[styleType]: true, 'no-spacing': noSpacing}"
    >
        <div class="field-title-box">
            <p-field-title v-if="label || $scopedSlots.label"
                           class="form-label"
                           :class="{'no-spacing': noSpacing}"
                           :size="styleType === 'primary' ? 'md' : 'sm'"
                           :color="styleType === 'primary' ? 'dark' : 'gray'"
                           @click="$emit('click-field-title')"
            >
                <slot name="label">
                    {{ label }}
                </slot>
                <span v-if="!required"
                      class="optional-mark"
                      :class="{'no-spacing': noSpacing}"
                >({{ $t('COMPONENT.FIELD_GROUP.OPTIONAL') }})</span>
                <slot name="label-extra" />
            </p-field-title>
        </div>
        <small v-if="$scopedSlots.help || helpText"
               class="help-msg"
               :class="{'no-spacing': noSpacing}"
        >
            <slot name="help">{{ helpText }}</slot>
        </small>
        <slot name="default"
              v-bind="$props"
        />
        <div v-show="invalid"
             class="invalid-feedback"
             :class="{'no-spacing': noSpacing}"
        >
            <slot name="invalid">
                {{ invalidText }}
            </slot>
        </div>
        <div v-if="validText"
             class="valid-feedback"
             :class="{'no-spacing': noSpacing}"
             :style="{display: valid&&!invalid? 'block':'none'}"
        >
            <slot name="valid">
                {{ validText }}
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import PFieldTitle from '@/data-display/field-title/PFieldTitle.vue';

type FieldGroupStyleType = 'primary' | 'secondary';
interface Props {
    label?: string|TranslateResult;
    helpText?: string|TranslateResult;
    invalidText?: string;
    validText?: string;
    invalid?: boolean;
    valid?: boolean;
    required?: boolean;
    styleType?: FieldGroupStyleType;
    noSpacing?: boolean;
}

export default defineComponent<Props>({
    name: 'PFieldGroup',
    components: { PFieldTitle },
    props: {
        label: {
            type: String,
            default: '',
        },
        helpText: {
            type: String,
            default: '',
        },
        invalidText: {
            type: String,
            default: '',
        },
        validText: {
            type: String,
            default: '',
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        valid: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: false,
        },
        styleType: {
            type: String,
            default: 'primary',
        },
        noSpacing: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<style lang="postcss">
.p-field-group {
    &.primary:not(.no-spacing) {
        margin-bottom: 1rem;
    }
    &.secondary:not(.no-spacing) {
        margin-bottom: 0.5rem;
    }

    .form-label:not(.no-spacing) {
        padding-bottom: 0.25rem;
    }
    .label-box {
        display: flex;
        align-items: center;
    }
    .optional-mark {
        @apply text-gray-500;
        font-size: 0.75rem;
        line-height: 1.4;
        margin-left: 0.25rem;
        font-weight: normal;
        &:not(.no-spacing) {
            margin-bottom: 0.25rem;
        }
    }
    .help-msg {
        @apply block;
        &:not(.no-spacing) {
            @apply mb-2;
        }
    }
    .invalid-feedback {
        @apply text-alert;
        font-size: 0.75rem;
        line-height: 0.875rem;
        &:not(.no-spacing) {
            margin-top: 0.25rem;
        }
    }
    .valid-feedback {
        @apply text-safe;
        font-size: 0.75rem;
        line-height: 0.875rem;
        &:not(.no-spacing) {
            margin-top: 0.25rem;
        }
    }
    small {
        font-size: 0.75rem;
    }
    .is-invalid {
        @apply border border-alert;
    }
}

</style>
