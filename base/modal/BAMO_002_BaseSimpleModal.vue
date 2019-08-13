<template>
  <div class="wrapper">
    <b-modal v-model="modalShow"
             :title="title" 
             :modal-class="`modal-${type}`"
             :size="size"
             :ok-variant="type"
             no-stacking 
    >
      <span> {{ text }} </span>
      <slot name="contents" />
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
  </div>
</template>
<script>
export default {
    name: 'BaseSimpleModal',
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
