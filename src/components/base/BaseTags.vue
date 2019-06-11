<template>
  <div>
    <span v-for="(tag, idx) in tags" :key="idx">
      <b-badge v-for="(value, key) in tag" :key="key" variant="light">
        {{ key }} : {{ value }}
      </b-badge>&nbsp;
    </span>
  </div>
</template>

<script>
export default {
  name: 'BaseTags',
  props: {
    tags: {
      type: Array,
      default: null
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
