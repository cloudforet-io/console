<template>
  <span class="base-modal">
    <span @click="showModal">
      <slot name="activator" />
    </span>

    <b-modal v-model="modalShow"
             :title="title"
             :centered="centered"
             :ok-variant="type"
             :modal-class="`modal-${type}`"
             :size="size"
             :no-stacking="noStacking"
             :no-close-on-backdrop="backdropOff"
             :hide-footer="hideFooter"
             @ok="$emit('ok')"
             @hidden="isModalShown = false"
    >
      <span>{{ text }}</span>

      <slot name="contents"
            :hide="hideModal" 
            :show="showModal"
      />

      <slot name="footer" />
      <template v-if="!$slots.footer" #modal-footer="{ ok, cancel, hide }">
        <b-button v-if="!okOnly" size="sm" 
                  variant="outline-secondary" 
                  @click="clickCancel"
        >
          <span>Cancel</span>
        </b-button>
        <b-button size="sm" 
                  :variant="`outline-${type}`" 
                  @click="clickOk"
        >
          <span>OK</span>
        </b-button>
      </template>
    </b-modal>
  </span>
</template>

<script>
export default {
    name: 'BaseModal',
    event: ['ok', 'cancel'],
    props: {
        type: {
            type: String,
            default: 'secondary'
        },
        title: {
            type: String,
            default: null
        },
        text: {
            type: String,
            default: ''
        },
        centered: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'lg'
        },
        okOnly: {
            type: Boolean,
            default: false
        },
        noStacking: {
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
        }
    },
    data() {
        return {
            modalShow: false,
            isModalShown: false
        };
    },
    methods: {
        showModal () {
            this.modalShow = true;
            this.isModalShown = true;
        },
        hideModal () {
            this.modalShow = false;
        },
        clickOk () {
            this.$emit('ok');
            this.hideModal();
        },
        clickCancel () {
            this.$emit('cancel');
            this.hideModal();
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
