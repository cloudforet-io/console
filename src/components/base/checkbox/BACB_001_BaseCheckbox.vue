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
import {BFormCheckbox} from 'bootstrap-vue';

  export default {
    name: 'BaseCheckbox',
    components: {
    'b-check': BFormCheckbox
  },
    event: ['change', 'input'],
    model: {
        prop: 'selected',
        event: 'input'
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
