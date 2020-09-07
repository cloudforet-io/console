<template>
    <div class="p-dict-input" v-on="$listeners">
        <p-field-group :invalid-text="keyInvalidText"
                       :invalid="keyInvalid"
                       class="input-box key"
        >
            <p-input-text v-focus
                          :class="{invalid: keyInvalid}"
                          :value="name"
                          :placeholder="$t('WORD.KEY')"
                          :disabled="disabled"
                          @input="onInput('name', $event)"
                          @blur="$emit('blur:key')"
                          @focus="$emit('focus:key')"
            />
        </p-field-group>
        <span class="split">:</span>
        <p-field-group :invalid-text="valueInvalidText"
                       :invalid="valueInvalid"
                       class="input-box value"
        >
            <p-input-text :class="{invalid: valueInvalid}"
                          :value="value"
                          :placeholder="$t('WORD.VALUE')"
                          :disabled="disabled"
                          @input="onInput('value', $event)"
                          @blur="$emit('blur:value')"
                          @focus="$emit('focus:value')"
            />
        </p-field-group>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PInputText from '@/components/atoms/inputs/PTextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import { DictInputProps } from '@/components/molecules/forms/dict-input/type';

export default defineComponent({
    name: 'PDictInput',
    components: { PInputText, PFieldGroup },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        name: {
            type: String,
            default: '',
            required: true,
        },
        value: {
            type: [String, Number],
            default: '',
            required: true,
        },
        keyInvalid: {
            type: Boolean,
            default: false,
        },
        valueInvalid: {
            type: Boolean,
            default: false,
        },
        keyInvalidText: {
            type: String,
            default: undefined,
        },
        valueInvalidText: {
            type: String,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: DictInputProps, { emit }) {
        return {
            onInput(type, val) {
                emit(`update:${type}`, val);
                emit(`change:${type === 'name' ? 'key' : 'value'}`, val);
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
    .p-dict-input {
        display: inline-flex;
        align-items: flex-start;
        .input-box {
            margin-bottom: 0;
            &.key {
                width: 15rem;
            }
            &.value {
                width: 20rem;
            }
            .p-text-input {
                width: 100%;
                &.invalid {
                    @apply border border-alert;
                }
            }
        }
        .split {
            padding-left: 0.125rem;
            padding-right: 0.125rem;
            line-height: 2rem;
        }
    }


</style>
