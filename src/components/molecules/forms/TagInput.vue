<template>
    <div class="form-row p-tag-input">
        <p-input-text
            class="tag-input tag-key-input"
            :value="tagKey"
            :disabled="disabled"
            :placeholder="tagKeyPlaceholder"
            @input="$emit('update:tagKey',$event)"
        />
        <span class="tag-input-split">:</span>
        <p-input-text
            class="tag-input tag-value-input"
            :value="tagValue"
            :disabled="disabled"
            :placeholder="tagValuePlaceholder"
            @input="$emit('update:tagValue',$event)"
        />
    </div>
</template>

<script>
import PInputText from '@/components/atoms/inputs/TextInput';

export default {
    name: 'PTagInput',
    components: { PInputText },
    props: {
        tagKey: String,
        tagValue: String,
        tagKeyPlaceholder: String,
        tagValuePlaceholder: String,
        disabled: Boolean,
    },
};
</script>

<style lang="scss" scoped>
    .tag-input-split{
        font: 14px/28px Arial;
        padding-left: 0.125rem;
        padding-right: 0.125rem;
    }
    .tag-input{

        &.tag-key-input{
            width: 7.5rem;
        }
        &.tag-value-input{
            width: 15rem;
        }
    }
</style>
