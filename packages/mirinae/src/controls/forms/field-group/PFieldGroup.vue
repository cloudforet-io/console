<template>
    <div class="p-field-group"
         :class="{[styleType]: true, 'no-spacing': noSpacing}"
    >
        <div class="field-title-box">
            <p-field-title v-if="label || $scopedSlots.label"
                           class="form-label"
                           :size="styleType === 'primary' ? 'md' : 'sm'"
                           :color="styleType === 'primary' ? 'dark' : 'gray'"
                           @click="$emit('click-field-title')"
            >
                <slot name="label">
                    {{ label }}
                </slot>
                <span v-if="!required"
                      class="optional-mark"
                >({{ $t('COMPONENT.FIELD_GROUP.OPTIONAL') }})</span>
                <slot name="label-extra" />
            </p-field-title>
        </div>
        <small v-if="$scopedSlots.help || helpText"
               class="help-msg"
        >
            <slot name="help">{{ helpText }}</slot>
        </small>
        <slot name="default"
              v-bind="$props"
        />
        <div v-show="invalid"
             class="invalid-feedback"
        >
            <slot name="invalid">
                {{ invalidText }}
            </slot>
        </div>
        <div v-if="validText"
             class="valid-feedback"
             :style="{display: valid&&!invalid? 'block':'none'}"
        >
            <slot name="valid">
                {{ validText }}
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import PFieldTitle from '@/data-display/field-title/PFieldTitle.vue';

type FieldGroupStyleType = 'primary' | 'secondary';

export default defineComponent({
    name: 'PFieldGroup',
    components: { PFieldTitle },
    props: {
        label: {
            type: String as PropType<TranslateResult>,
            default: '',
        },
        helpText: {
            type: String as PropType<TranslateResult>,
            default: '',
        },
        invalidText: {
            type: String as PropType<TranslateResult>,
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
            type: String as PropType<FieldGroupStyleType>,
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
    &.primary {
        margin-bottom: 1rem;
    }
    &.secondary {
        margin-bottom: 0.5rem;
    }

    .form-label {
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
        margin-bottom: 0.25rem;
    }
    .help-msg {
        @apply block mb-2;
    }
    .invalid-feedback {
        @apply text-alert;
        font-size: 0.75rem;
        line-height: 0.875rem;
        margin-top: 0.25rem;
    }
    .valid-feedback {
        @apply text-safe;
        font-size: 0.75rem;
        line-height: 0.875rem;
        margin-top: 0.25rem;
    }
    small {
        font-size: 0.75rem;
    }
    .is-invalid {
        @apply border border-alert;
    }
    &.no-spacing {
        &.primary {
            margin-bottom: 0;
        }
        &.secondary {
            margin-bottom: 0;
        }
        .form-label {
            padding-bottom: 0;
        }
        .optional-mark {
            margin-bottom: 0;
        }
        .help-msg {
            margin-bottom: 0;
        }
        .invalid-feedback {
            margin-top: 0;
        }
        .valid-feedback {
            margin-top: 0;
        }
    }
}

</style>
