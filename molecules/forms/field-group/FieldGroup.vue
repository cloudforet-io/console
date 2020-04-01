<template>
    <div class="p-field-group">
        <slot name="label" :class="{'form-label':true}">
            <label v-if="label" class="form-label">{{ label }}</label>
        </slot>
        <span v-if="required" class="required-mark">*</span>
        <slot :invalid="invalid" />
        <small v-if="helpText&&!invalid&&!valid" class="block mt-1 text-grey">
            {{ helpText }}
        </small>
        <div v-if="invalidText" class="invalid-feedback" :style="{display: invalid? 'block':'none'}">
            {{ invalidText }}
        </div>
        <div v-if="validText" class="valid-feedback" :style="{display: valid&&!invalid? 'block':'none'}">
            {{ validText }}
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

<style lang="postcss" scoped>

    .p-field-group {
        margin-bottom: 1rem;
        .form-label {
            @apply text-dark;
            display: inline-block;
            font-size: .875rem;
            font-weight: bold;
            letter-spacing: 0;
            margin-bottom: 0.25rem;
            margin-right: 0.375rem;
        }
        .invalid-feedback {
            @apply text-alert;
            font-size: .75rem;
            line-height: .875rem;;
            margin-top: .25rem;
        }
        .valid-feedback {
            @apply text-safe;
            font-size: .75rem;
            line-height: .875rem;;
            margin-top: .25rem;
        }
        .required-mark {
            @apply text-alert;
        }
        small {
            font-size: .75rem;
        }
        .is-invalid {
            @apply border border-alert;
        }
    }

</style>
