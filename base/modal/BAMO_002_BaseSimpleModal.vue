<template>
  <div class="wrapper">
    <b-modal v-model="modalShow"
             :modal-class="`modal-${type}`"
             :size="size"
             :ok-variant="type"
             :centered="centered"
    >
      <template #modal-header>
        <h5 class="modal-title">
          {{ title }}
        </h5>
        <button tabindex="-1" type="button" aria-label="Close" class="close" @click="clickCancel">
          <i class="fal fa-times" />
        </button>
      </template>
      <span> {{ text }} </span>
      <slot name="contents" />
      <slot name="footer" />
      <template v-if="!$slots.footer" #modal-footer="{ ok, cancel, hide }">
        <b-button v-if="!okOnly" size="sm" 
                  variant="outline-secondary" 
                  @click="clickCancel"
        >
          <span>{{ tr('BTN_CANCEL') }}</span>
        </b-button>
        <b-button size="sm" 
                  :variant="`${type}`" 
                  @click="clickOk"
        >
          <span>{{ tr('BTN_CONFIRM') }}</span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
export default {
    name: 'BaseSimpleModal',
    event: ['ok', 'cancel'],
    props: {
        type: {
            type: String,
            default: 'secondary'
        },
        size: {
            type: String,
            default: 'md'
        },
        title: {
            type: String,
            required: true,
            default: 'Modal Title'
        },
        okOnly: {
            type: Boolean,
            default: true
        },
        text: {
            type: String,
            default: ''
        },
        centered: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            modalShow: false
        };
    },
    methods: {
        showModal () {
            this.modalShow = true;
        },
        closeModal () {
            this.modalShow = false;
        },
        clickOk () {
            this.$emit('ok');
            this.closeModal();
        },
        clickCancel () {
            this.$emit('cancel');
            this.closeModal();
        }
    }
};
</script>

<style lang="scss" scoped>
.btn {
  padding: 1px 15px;
  span {
    vertical-align: sub;
  }
}
</style>
