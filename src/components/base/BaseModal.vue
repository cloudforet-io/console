<template>
  <div>
    <div @click="showModal">
      <slot name="activator" />
    </div>

    <b-modal :ref="name" :title="title" :centered="centered" :no-close-on-backdrop="backdropOff"
             :hide-footer="hideFooter" size="lg" @hidden="$store.dispatch('modal/modalHidden')"
    >
      <slot v-if="isModalShown" name="contents" />

      <template v-slot:modal-footer>
        <slot v-if="customFooter" name="footer" />
        <div v-else>
          <b-button variant="secondary" size="md" class="float-right" @click="hideModal">
            Close
          </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'BaseModal',
  props: {
    name: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: null
    },
    centered: {
      type: Boolean,
      default: false
    },
    backdropOff: {
      type: Boolean,
      default: false
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    customFooter: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters('modal', [
      'isModalShown',
      'openState'
    ])
  },
  watch: {
    openState (v) {
      if (!v) this.$refs[this.name].hide()
    }
  },
  methods: {
    showModal (e) {
      this.$store.dispatch('modal/openModal')
      this.$refs[this.name].show()
    },
    hideModal (e) {
      this.$store.dispatch('modal/closeModal')
      this.$refs[this.name].hide()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
