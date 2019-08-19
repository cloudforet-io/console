<template>
  <b-container fluid>
    <b-row class="my-1" v-if="isInitialized">
      <b-col sm="3">
        <label class="control-label">Project ID:</label>
      </b-col>
      <template v-if="currentState=='UPT'">
        <b-col sm="9">
         {{projectId}}
        </b-col>
      </template>
      <template v-else>
        <b-col sm="9">
          <b-form-input v-model="projectId"
                        :placeholder ="placeHolderId"
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
                      :placeholder ="projectName"
                      type="text"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

const project = {
    projectId: null,
    projectName: null
};

export default {
    name: 'ProjectEditPopUpName',
    components: {},
    props: {
        projectProp: {
            type: Object,
            default: () => (project)
        }
    },
    data () {
        return {
            isInitialized: true,
            placeHolderId: null,
            placeHolderName: null,
            projectId: this.projectProp.projectId,
            projectName: this.projectProp.projectName,
            treeDataSelected: {},
            currentState: null
        };
    },
    watch: {
        projectId: function (newProjectID) {
            this.projectProp.projectId = newProjectID;
            this.$bus.$emit('setTabData', { projectProp: this.projectProp });
        },
        projectName: function (newProjectName) {
            this.projectProp.projectName = newProjectName;
            this.$bus.$emit('setTabData', { projectProp: this.projectProp });
        }
    },
    mounted: function () {

    },
    beforeDestroy: function () {
        this.$bus.$emit('setTabData', { projectProp: this.projectProp });
    },
    created () {
        //TODO:: Please, Check this method to confirm
        const selectedNode = this.$attrs['selected-data'].selectedItem.tree.getSelected()[0];

        if (Object.keys(this.$attrs).length > 0) {
            this.treeDataSelected = this.$attrs.selectedData;
            if (this.$attrs['is-creatable']) {
                this.currentState = 'CRT';
            } else if (this.$attrs['is-updatable']) {
                this.currentState = 'UPT';
                this.projectProp.projectId= selectedNode.data.id;
                this.projectId = selectedNode.data.id;
                this.projectName = selectedNode.title;
            } else {
                this.currentState = 'DEL';
            }
        }

        if (!this.isEmpty(this._.get(selectedNode,'data.init'))) {
           this.isInitialized = false;
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
                return this.projectProp.projectId;
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
