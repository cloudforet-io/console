<template>
  <span class="state-tag">
    <span class="icon" :class="tag.color">
      <i :class="tag.icon" />
    </span> &nbsp; 
    <span class="text">
      {{ tag.msg }}
    </span>
  </span>
</template>

<script>
export default {
    name: 'BaseStateTag',
    props: {
        state: {
            type: String,
            required: true
        },
        data: {
            type: String,
            required: true
        }
    },
    computed: {
        tag () {
            return this.$root.ENUM[this.state.toUpperCase()][this.data.toUpperCase()];
        }
    }
};
</script>

<style lang="scss" scoped>

</style>