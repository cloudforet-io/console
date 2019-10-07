<template>
  <div v-if="value" class="spinner-container">
    <span class="spinner" :class="`fa-${size}x`">
      <i class="fad fa-circle-notch fa-spin" />
    </span>
  </div>
</template>

<script>
export default {
    name: 'BaseSpinner',
    model: {
        prop: 'value',
        events: 'input'
    },
    props: {
        value: {
            type: Boolean,
            required: true
        },
        size: {
            type: Number,
            default: 2
        }
    }
};
</script>

<style lang="scss" scoped>
.spinner-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .spinner {
        position: absolute;
        display: inline-block;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>