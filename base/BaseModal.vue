<template>
  <div>
    <slot name="activator" :openModal="openModal" />
    <b-modal v-model="openState" :centered="centered" :title="title" size="lg"
             @ok="closeModal" @hidden="modalClosed"
    >
      <slot name="contents" :stillOpen="stillOpen" />
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    title: {
      type: String,
      default: null
    },
    centered: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      openState: false,
      stillOpen: false
    }
  },
  methods: {
    openModal () {
      this.openState = true
      this.stillOpen = true
    },
    closeModal () {
      this.openState = false
    },
    modalClosed () {
      this.stillOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
