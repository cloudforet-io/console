<template>
  <span class="base-modal">
    <span @click="showModal">
      <slot name="activator" />
    </span>

    <b-modal v-model="modalShow"
             :centered="centered"
             :ok-variant="type"
             :modal-class="`modal-${type}`"
             :size="size"
             :no-stacking="noStacking"
             :no-close-on-backdrop="backdropOff"
             :hide-footer="hideFooter"
             @ok="$emit('ok')"
             @hidden="isModalShown = false"
             @cancel="clickCancel"
             @hide="onHide"
    >
      <template #modal-header>
        <h5 class="modal-title">{{ title }}</h5>
        <button tabindex="-1" type="button" aria-label="Close" class="close" @click="clickCancel">
          <i class="fal fa-times" />
        </button>
      </template>

      <slot name="contents"
            :hide="onHide" 
            :ok="clickOk"
            :cancel="clickCancel"
      />
      <span v-if="!$slots.contents">{{ text }}</span>

      <slot name="footer" />
      <template v-if="!$slots.footer" #modal-footer="{ ok, cancel, hide }">
        <b-button v-if="!okOnly" size="sm" 
                  variant="outline-secondary" 
                  @click="clickCancel"
        >
          <span v-if="useCustomMsg">{{ customYesOrNoMsg.NO }}</span>
          <span v-else>{{ tr('BTN_CANCEL') }}</span>
        </b-button>
        <b-button size="sm" 
                  :variant="`${type}`" 
                  @click="clickOk"
        >
          <span v-if="useCustomMsg">{{ customYesOrNoMsg.YES }}</span>
          <span v-else>{{ tr('BTN_CONFIRM') }}</span>
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
        useCustomMsg: {
            type: Boolean,
            default: false
        },
        customYesOrNoMsg: {
            type: Object,
            default: null
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
        preventEscClose: {
            type: Boolean,
            default: false
        },
        hideFooter: {
            type: Boolean,
            default: false
        },
        interactive: {
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
        clickOk (e) {
            if (!this.interactive) {
                this.hideModal();
            }
            this.$emit('ok', e);
        },
        clickCancel (e) {
            if (!this.interactive) {
                this.hideModal();
            }
            this.$emit('cancel', e);
        },
        onHide (e) {
            if (this.preventEscClose && e.trigger === 'esc') {
                e.preventDefault();
                this.$emit('esc', e);
            } else {
                this.$emit('hide', e);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
