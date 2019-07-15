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
          <b-form-input v-model="projectId"
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
        <b-form-input v-model="projectName"
                      type="text"
                      />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

  const project = {
    projectId: null,
    projectName: null,
  };

  export default {
    name: 'ProjectEditPopUpName',
    components: {},
    props: {
      projectProp: {
        type: Object,
        default: () => (project)
      },
    },
    mounted: function () {
    },
    beforeDestroy: function(){
      this.$bus.$emit('setTabData', { projectProp: this.projectProp });
    },
    data() {
      return {
        projectId: this.projectProp.projectId,
        projectName: this.projectProp.projectName,
        treeDataSelected: {},
        currentState: null,
      }
    },
    created() {
      //TODO:: Please, Check this method to confirm
      if (Object.keys(this.$attrs).length > 0) {
        this.treeDataSelected = this.$attrs.selectedData;
        if (this.$attrs.isCreatable) {
            this.currentState = 'CRT'
          } else if (this.$attrs.isUpdatable) {
            this.currentState = 'UPT'
          } else {
            this.currentState = 'DEL'
          }
      }
    },
    watch: {
      projectId: function (newProjectID) {
        this.projectProp.projectId = newProjectID;
        this.$bus.$emit('setTabData', { projectProp: this.projectProp });
      },
      projectName: function (newProejctName) {
        this.projectProp.projectName = newProejctName;
        this.$bus.$emit('setTabData',{ projectProp: this.projectProp });
      }
    },
    methods: {
      partialRender(idx) {
        if (idx == 0 && this.currentState == 'UPT') {
          return true;
        } else {
          return false;
        }
      },
      setProp(idx) {
        if (idx == 0 && this.currentState == 'UPT') {
          return this.projectProp.projectId
        } else {
          return false;
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .form-horizontal .control-label {
    text-align: right !important; /* !important added for priority in SO snippet. */
  }
</style>
