<template>
  <span><b-check v-model="checked" @change="onChange" /></span>
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
    }
  },
  computed: {
    checked: {
      set () {},
      get () { return this.selected; }
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
