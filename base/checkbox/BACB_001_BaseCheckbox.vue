<template>
  <span>
    <b-check :checked="selected"
             :inline="inline"
             :class="type"
             @input="onInput"
             @change="onChange"
    />
  </span>
</template>

<script>
export default {
    name: 'BaseCheckbox',
    events: ['change', 'input'],
    model: {
        prop: 'selected',
        events: 'input'
    },
    props: {
        selected: {
            type: Boolean,
            default: false
        },
        inline: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            default: 'primary'
        }
    },
    methods: {
        onChange (val) {
            this.$emit('change', val, this.$vnode.key);
        },
        onInput (val) {
            this.$emit('input', val, this.$vnode.key);
        }
    }
};
</script>

<style lang="scss" scoped>

</style>
