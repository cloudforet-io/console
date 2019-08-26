<template>
  <span>
    <b-check v-model="checked"
             :inline="inline"
             :class="type"
             @change="onChange"
    />
  </span>
</template>

<script>
export default {
    name: 'BaseCheckbox',
    event: ['change'],
    props: {
        selected: {
            type: Boolean,
            default: false,
            required: true
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
    computed: {
        checked: {
            set () {},
            get () {
                return this.selected; 
            }
        }
    },
    methods: {
        onChange (val) {
            this.$emit('change', val, this.$vnode.key);
        }
    }
};
</script>

<style lang="scss" scoped>

</style>
