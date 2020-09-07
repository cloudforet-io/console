<template>
    <vue-form-generator
        :class="{'not-validation-mode': !validationMode}"
        :schema="schema"
        :model="model"
        :options="options"
        @validated="onValidated"
    />
</template>

<script lang="ts">

/**
 * Used library: vue-form-generator
 * https://github.com/vue-generators/vue-form-generator
 */

export default {
    name: 'PDynamicForm',
    props: {
        schema: {
            type: Object,
            required: true,
        },
        model: {
            type: Object,
            required: true,
        },
        options: {
            type: Object,
            required: true,
        },
        isValid: {
            type: Boolean,
            required: true,
        },
        validationMode: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, { emit }) {
        const onValidated = (isValid) => {
            emit('update:isValid', isValid);
        };

        return {
            onValidated,
        };
    },
};
</script>

<style lang="postcss">
.vue-form-generator {
    width: 100%;
    &.not-validation-mode {
        .form-group.error {
            .form-control {
                @apply border-gray-300;
            }
            .help-block.errors {
                display: none;
            }
        }
    }
    .form-group {
        label {
            @apply text-gray-900;
            display: inline-block;
            font-size: .875rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        &.error {
            .form-control {
                background-color: transparent;
            }
        }
        .form-control {
            @apply text-gray-900 border border-gray-300;
            width: 100%;
            max-width: 19rem;
            appearance: none;
            font-size: 0.875rem;
            line-height: 1.3rem;
            border-radius: 0.125rem;
            box-shadow: none;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            &:focus {
                @apply border-blue-500;
            }
            &::placeholder {
                @apply text-gray-300;
            }
        }
        .help-block.errors {
            @apply text-red-500;
            margin-top: 0.25rem;
            span {
                font-size: 0.75rem;
                line-height: 0.875rem;
                font-weight: 400;
                background-image: none;
                padding-left: 0;
            }
        }
    }
}
</style>
