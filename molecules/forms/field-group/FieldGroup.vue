<template>
    <div class="p-field-group">
        <div class="label-box">
            <slot name="label" :class="{'form-label':true}">
                <label v-if="label" class="form-label">{{ label }}</label>
            </slot>
            <span v-if="required" class="required-mark">*</span>
        </div>
        <small v-if="($scopedSlots.help||helpText)&&!invalid&&!valid" class="block mb-2 text-grey">
            <slot name="help">{{ helpText }}</slot>
        </small>
        <slot :invalid="invalid" />
        <div v-if="invalidText" class="invalid-feedback" :style="{display: invalid? 'block':'none'}">
            <slot name="invalid">
                {{ invalidText }}
            </slot>
        </div>
        <div v-if="validText" class="valid-feedback" :style="{display: valid&&!invalid? 'block':'none'}">
            <slot name="invalid">
                {{ validText }}
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PFieldGroup',
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
    },
};
</script>

<style lang="postcss">
    .p-field-group {
        margin-bottom: 1rem;
        .label-box {
            display: inline-flex;
            align-items: flex-start;
        }
        .form-label {
            @apply text-gray-900;
            display: inline-block;
            font-size: 0.875rem;
            font-weight: bold;
            letter-spacing: 0;
            margin-bottom: 0.25rem;
            line-height: 1.3125rem;
        }
        .required-mark {
            @apply text-alert;
            font-size: 0.25rem;
            line-height: 1.2rem;
            margin-left: 0.1rem;
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
    }

</style>
