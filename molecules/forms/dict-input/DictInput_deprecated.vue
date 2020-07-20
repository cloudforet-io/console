<template>
    <div class="p-dict-input" v-on="$listeners">
        <div class="dict-input-box dict-key-input">
            <p-input-text
                v-focus
                class="dict-input"
                :value="name"
                :disabled="disabled"
                :placeholder="tagKeyPlaceholder"
                @input="$emit('update:name',$event)"
            />
        </div>
        &nbsp;
        <span class="dict-input-split" :class="{disabled: disabled}">{{ disabled? '': ':' }}</span>
        &nbsp;
        <div class="dict-input-box dict-value-input">
            <p-input-text
                class="dict-input"
                :value="value"
                :disabled="disabled"
                :placeholder="tagValuePlaceholder"
                @input="$emit('update:value', $event)"
            />
        </div>
    </div>
</template>

<script>
import PInputText from '@/components/atoms/inputs/PTextInput.vue';

export default {
    name: 'PDictInput',
    components: { PInputText },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        name: String,
        value: {
            type: [String, Number],
            default: undefined,
        },
        tagKeyPlaceholder: String,
        tagValuePlaceholder: String,
        disabled: Boolean,
    },
};
</script>

<style lang="postcss" scoped>
    .p-dict-input {
        display: inline-flex;
        align-items: center;
    }
    .dict-input-split{
        padding-left: 0.125rem;
        padding-right: 0.125rem;
        &.disabled{
            width: 0.5625rem;
        }
    }
    .dict-input-box{
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
    .dict-input{
        width: 100%;
        box-sizing: border-box;
    }
</style>
