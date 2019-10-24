<template>
    <div class="menu-tip">
     <slot />
    <span v-if="!hasDefaultSlot" >
        {{contents}}
    </span>
    </div>
</template>

<script>
export default {
  name: 'p-menu-tip',
  props: {
    contents: {
      type: String,
      default: '',
    },
  },
  computed: {
    hasDefaultSlot() {
      return !!this.$slots.default;
    },
  },
};
</script>

<style lang="scss" scoped>
    .menu-tip {

    }
</style>
