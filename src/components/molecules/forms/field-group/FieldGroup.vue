<template>
    <div class="mb-4 p-field-group">
        <label class="form-label">{{ label }}</label><span v-if="required" class="required-mark">*</span>
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

<style lang="scss" scoped>

    .p-field-group {
        margin-bottom: 1rem;
        .form-label {
            font: Bold 14px Arial;
            letter-spacing: 0;
            color: $dark;
            margin-bottom: 0.25rem;
            margin-right: 0.375rem;
        }
        .invalid-feedback {
            color: $alert;
            font: 12px Arial;
        }
        .valid-feedback {
            color: $safe;
            font: 12px Arial;
        }
        .required-mark {
            color: $alert;
        }
        small {
            font: 12px Arial;
        }
        .is-invalid {
            border: 1px solid $alert;
        }
    }

</style>
