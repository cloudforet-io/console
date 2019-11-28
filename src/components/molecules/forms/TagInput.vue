<template>
    <div class="p-tag-input">
        <div class="tag-input-box tag-key-input">
            <p-input-text
                class="tag-input"
                :value="name"
                :disabled="disabled"
                :placeholder="tagKeyPlaceholder"
                @input="$emit('update:name',$event)"
            />
        </div>
        &nbsp;
        <span class="tag-input-split" :class="{disabled}">{{ disabled? '': ':' }}</span>
        &nbsp;
        <div class="tag-input-box tag-value-input">
            <p-input-text
                class="tag-input"
                :value="value"
                :disabled="disabled"
                :placeholder="tagValuePlaceholder"
                @input="$emit('update:value',$event)"
            />
        </div>
    </div>
</template>

<script>
import PInputText from '@/components/atoms/inputs/TextInput';

export default {
    name: 'PTagInput',
    components: { PInputText },
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

<style lang="scss" scoped>
    .p-tag-input{
        display: inline-flex;
    }
    .tag-input-split{
        font: 14px/28px Arial;
        padding-left: 0.125rem;
        padding-right: 0.125rem;
        flex: none;
        &.disabled{
            width: 0.5625rem;
        }
    }
    .tag-input-box{
        &.tag-key-input{
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: 7.5rem;
        }
        &.tag-value-input{
            flex-grow: 1.5;
            flex-shrink: 1;
            flex-basis: 15rem;
        }
    }
    .tag-input{
        width: 100%;
        box-sizing: border-box;
    }
</style>
