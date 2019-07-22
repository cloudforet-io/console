<template>
  <div class="wrapper">
    <b-modal :title="simpleModalTitle" v-model="myModal" @ok="myModal = false" v-if="simpleModalType == 1" ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
    <b-modal :title="simpleModalTitle" size="lg" v-model="largeModal" @ok="largeModal = false" v-else-if="simpleModalType === 2" ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
    <b-modal :title="simpleModalTitle" size="sm" v-model="smallModal" @ok="smallModal = false" v-else-if="simpleModalType === 3" ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
    <b-modal :title="simpleModalTitle" class="modal-primary" v-model="primaryModal" @ok="primaryModal = false" v-else-if="simpleModalType === 4" ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
    <b-modal :title="simpleModalTitle" class="modal-success" v-model="successModal" @ok="successModal = false" ok-variant="success" v-else-if="simpleModalType === 5" ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
    <b-modal :title="simpleModalTitle" class="modal-warning" v-model="warningModal" @ok="warningModal = false" ok-variant="warning" v-else-if="simpleModalType === 6" ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
    <b-modal :title="simpleModalTitle" class="modal-danger" v-model="dangerModal" @ok="dangerModal = false" ok-variant="danger" v-else-if="simpleModalType === 7" ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
    <b-modal :title="simpleModalTitle" class="modal-info" v-model="infoModal" @ok="infoModal = false" ok-variant="info" v-else ok-only no-stacking>
      <slot name="contents"/>
    </b-modal>
  </div>
</template>
<script>
  export default {
    name: 'simpleModals',
    props: {
      simpleModalType: {
        type: Number,
        required: true,
        default : 1
      },
      simpleModalTitle: {
        type: String,
        reuired: true,
        default: 'Simple Modal Title',

      },
    },
    data () {
      return {
        myModal: false,
        largeModal: false,
        smallModal: false,
        primaryModal: false,
        successModal: false,
        warningModal: false,
        dangerModal: false,
        infoModal: false
      }
    },
    methods: {
      showModal () {
        let modalTypeNumber = this.simpleModalType;
        if(modalTypeNumber == 1){
            this.myModal = true
        }else if(modalTypeNumber == 2){
          this.largeModal = true
        }else if(modalTypeNumber == 3){
          this.smallModal = true
        }else if(modalTypeNumber == 4){
          this.primaryModal = true
        }else if(modalTypeNumber == 5){
          this.successModal = true
        }else if(modalTypeNumber == 6){
          this.warningModal = true
        }else if(modalTypeNumber == 7){
          this.dangerModal = true
        }else{
          this.infoModal = true
        }
      },
    }
  }
</script>
