<template>
  <b-container fluid>
    <b-row class="my-1">
      <b-col sm="3">
        <label class="control-label">Project ID:</label>
      </b-col>
      <template v-if="currentState=='UPT'">
        <b-col sm="9">
          This is a Sparta.
        </b-col>
      </template>
      <template v-else>
        <b-col sm="9">
          <b-form-input v-model="dataCenterId"
                        type="text"
          />
        </b-col>
      </template>
    </b-row>
    <b-row class="my-1">
      <b-col sm="3">
        <label class="control-label">Project Name:</label>
      </b-col>
      <b-col sm="9">
        <b-form-input v-model="dataCenterName"
                      type="text"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

const dataCenter = {
    dataCenterId: null,
    dataCenterName: null
};

export default {
    name: 'ProjectEditPopUpName',
    components: {},
    props: {
        dataCenterProp: {
            type: Object,
            default: () => (dataCenter)
        }
    },
    data () {
        return {
            dataCenterId: this.dataCenterProp.dataCenterId,
            dataCenterName: this.dataCenterProp.dataCenterName,
            treeDataSelected: {},
            currentState: null
        };
    },
    watch: {
        dataCenterId: function (newProjectID) {
            this.dataCenterProp.dataCenterId = newProjectID;
            this.$bus.$emit('setTabData', { dataCenterProp: this.dataCenterProp });
        },
        dataCenterName: function (newProjectName) {
            this.dataCenterProp.dataCenterName = newProjectName;
            this.$bus.$emit('setTabData', { dataCenterProp: this.dataCenterProp });
        }
    },
    mounted: function () {
    },
    beforeDestroy: function () {
        this.$bus.$emit('setTabData', { dataCenterProp: this.dataCenterProp });
    },
    created () {
        // TODO:: Please, Check this method to confirm
        if (Object.keys(this.$attrs).length > 0) {
            this.treeDataSelected = this.$attrs.selectedData;
            if (this.$attrs.isCreatable) {
                this.currentState = 'CRT';
            } else if (this.$attrs.isUpdatable) {
                this.currentState = 'UPT';
            } else {
                this.currentState = 'DEL';
            }
        }
    },
    methods: {
        partialRender (idx) {
            if (idx == 0 && this.currentState == 'UPT') {
                return true;
            } else {
                return false;
            }
        },
        setProp (idx) {
            if (idx == 0 && this.currentState == 'UPT') {
                return this.dataCenterProp.dataCenterId;
            } else {
                return false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
  .form-horizontal .control-label {
    text-align: right !important; /* !important added for priority in SO snippet. */
  }
</style>
