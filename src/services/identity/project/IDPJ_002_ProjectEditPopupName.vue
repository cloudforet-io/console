<template>
  <b-container fluid>
    <b-row class="my-1" v-for="(type, idx) in Inputs" :key="Inputs.type">
      <template v-if="partialRender(idx)">
        <b-col sm="3">
          <label :for="`type-${type.type}`">{{ type.textTitle }}:</label>
        </b-col>
        <b-col sm="9">
          pg-6bc72053
        </b-col>
      </template>
      <template v-else>
        <b-col sm="3">
          <label :for="`type-${type.type}`">{{ type.textTitle }}:</label>
        </b-col>
        <b-col sm="9">
          <b-form-input v-model="projectBindingName" ref="nameInputField" :id="`type-${type.type}`" :type="type.type"></b-form-input>
        </b-col>
      </template>
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
    watch: {
      projectProp (project) {
        debugger;
        this.setCurrentData(project)
      }
    },
    data() {
      return {
        projectBindingName: null,
        projectBindingId: null,
        treeDataSelected: {},
        currentState: null,
        Inputs: [
          {
            textTitle: 'projectId',
            type: 'text',
            value: 'projectBindingId'
          },
          {
            textTitle: 'projectName',
            type: 'text',
            value: 'projectBindingName'
          }
        ]
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
    methods: {
      setCurrentData(projectProp){
        this.projectId = projectProp.projectId
        this.projectName = projectProp.projectName
      },
      partialRender(idx) {
        if (idx == 0 && this.currentState == 'UPT') {
          return true;
        } else {
          return false;
        }
      },
      onCreate() {
        if (!this.validated) {
          return
        }
        console.log('creating....')
        setTimeout(() => {
          this.$store.dispatch('modal/closeModal')
        }, 1000)
      },
      onUpdate(e) {
        if (!this.validated) {
          return
        }
        console.log('updating....')
        setTimeout(() => {
          this.$store.dispatch('modal/closeModal')
        }, 1000)
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
