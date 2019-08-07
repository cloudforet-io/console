<template>
  <div class="wrapper">
    <b-modal v-if="simpleModalType == 1" 
             v-model="myModal" 
             :title="simpleModalTitle" 
             ok-only 
             no-stacking 
             @ok="myModal = false"
    >
      <slot name="contents" />
    </b-modal>
    <b-modal v-else-if="simpleModalType === 2" 
             v-model="largeModal" 
             :title="simpleModalTitle" 
             size="lg" 
             ok-only 
             no-stacking 
             @ok="largeModal = false"
    >
      <slot name="contents" />
    </b-modal>
    <b-modal v-else-if="simpleModalType === 3" 
             v-model="smallModal" 
             :title="simpleModalTitle"
             size="sm" 
             ok-only 
             no-stacking
             @ok="smallModal = false"
    >
      <slot name="contents" />
    </b-modal>
    <b-modal v-else-if="simpleModalType === 4"
             v-model="primaryModal" 
             :title="simpleModalTitle" 
             class="modal-primary" 
             ok-only 
             no-stacking
             @ok="primaryModal = false"
    >
      <slot name="contents" />
    </b-modal>
    <b-modal v-else-if="simpleModalType === 5"
             v-model="successModal" 
             :title="simpleModalTitle" 
             class="modal-success"
             ok-variant="success"
             ok-only no-stacking
             @ok="successModal = false"
    >
      <slot name="contents" />
    </b-modal>
    <b-modal v-else-if="simpleModalType === 6"
             v-model="warningModal" 
             :title="simpleModalTitle" 
             class="modal-warning" 
             ok-variant="warning" 
             ok-only no-stacking
             @ok="warningModal = false"
    >
      <slot name="contents" />
    </b-modal>
    <b-modal v-else-if="simpleModalType === 7" 
             v-model="dangerModal" 
             :title="simpleModalTitle" 
             class="modal-danger" 
             ok-variant="danger" 
             ok-only no-stacking
             @ok="dangerModal = false"
    >
      <slot name="contents" />
    </b-modal>
    <b-modal v-else 
             v-model="infoModal" 
             :title="simpleModalTitle"
             class="modal-info" 
             ok-variant="info" 
             ok-only 
             no-stacking 
             @ok="infoModal = false"
    >
      <slot name="contents" />
    </b-modal>
  </div>
</template>
<script>
export default {
    name: 'SimpleModals',
    props: {
        simpleModalType: {
            type: Number,
            required: true,
            default: 1
        },
        simpleModalTitle: {
            type: String,
            reuired: true,
            default: 'Simple Modal Title'

        }
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
        };
    },
    methods: {
        showModal () {
            let modalTypeNumber = this.simpleModalType;
            if (modalTypeNumber == 1) {
                this.myModal = true;
            } else if (modalTypeNumber == 2) {
                this.largeModal = true;
            } else if (modalTypeNumber == 3) {
                this.smallModal = true;
            } else if (modalTypeNumber == 4) {
                this.primaryModal = true;
            } else if (modalTypeNumber == 5) {
                this.successModal = true;
            } else if (modalTypeNumber == 6) {
                this.warningModal = true;
            } else if (modalTypeNumber == 7) {
                this.dangerModal = true;
            } else {
                this.infoModal = true;
            }
        }
    }
};
</script>
