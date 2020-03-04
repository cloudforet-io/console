<template>
    <div class="p-dict-input"
         :class="{'bottom-text': keyInvalid || valueInvalid}"
         v-on="$listeners"
    >
        <div class="dict-input-box dict-key-input">
            <p-field-group :invalid-text="keyInvalidText"
                           :invalid="keyInvalid"
            >
                <p-input-text
                    v-focus
                    class="dict-input"
                    :class="{invalid: keyInvalid}"
                    :value="name"
                    :placeholder="$t('WORD.KEY')"
                    :disabled="disabled"
                    @input="onInput('name', $event)"
                    @blur="$emit('blur:key')"
                    @focus="$emit('focus:key')"
                />
            </p-field-group>
        </div>
        &nbsp;
        <span class="dict-input-split">:</span>
        &nbsp;
        <div class="dict-input-box dict-value-input">
            <p-field-group :invalid-text="valueInvalidText"
                           :invalid="valueInvalid"
            >
                <p-input-text
                    class="dict-input"
                    :class="{invalid: valueInvalid}"
                    :value="value"
                    :placeholder="$t('WORD.VALUE')"
                    :disabled="disabled"
                    @input="onInput('value', $event)"
                    @blur="$emit('blur:value')"
                    @focus="$emit('focus:value')"
                />
            </p-field-group>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PInputText from '@/components/atoms/inputs/TextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';

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
        /**
         * Key of dict. This is sync prop.
         */
        name: {
            type: String,
            default: undefined,
            required: true,
        },
        /**
         * Value of dict. This is sync prop.
         */
        value: {
            type: [String, Number],
            default: undefined,
            required: true,
        },
        /**
         * Key invalid.
         */
        keyInvalid: {
            type: Boolean,
            default: false,
        },
        /**
         * Value invalid.
         */
        valueInvalid: {
            type: Boolean,
            default: false,
        },
        /**
         * Key invalid message.
         */
        keyInvalidText: {
            type: String,
            default: undefined,
        },
        /**
         * Value invalid message.
         */
        valueInvalidText: {
            type: String,
            default: undefined,
        },
        /**
         * Disable key, value input boxes.
         */
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        return {
            onInput(type, val) {
                emit(`update:${type}`, val);
                emit(`change:${type === 'name' ? 'key' : 'value'}`, val);
            },
        };
    },
});
</script>

<style lang="scss" scoped>
    .p-dict-input {
        display: inline-flex;
        align-items: center;
        &.bottom-text {
            align-items: start;
        }
    }
    .dict-input-split{
        padding-left: 0.125rem;
        padding-right: 0.125rem;
        line-height: 2rem;
        &.disabled{
            width: 0.5625rem;
        }
    }
    .dict-input-box {
        .p-field-group {
            margin-bottom: 0;
        }
        &.dict-key-input{
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: 7.5rem;
        }
        &.dict-value-input{
            flex-grow: 1.5;
            flex-shrink: 1;
            flex-basis: 15rem;
        }
    }
    .dict-input {
        width: 100%;
        box-sizing: border-box;
        &.invalid {
            border: 1px solid $alert;
        }
    }
</style>
