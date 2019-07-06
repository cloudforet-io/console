<template>
  <b-container fluid>
    <b-row class="my-1" v-for="(type, idx) in Inputs" :key="Inputs.type">
      <b-col sm="3">
        <label :for="`type-${type.type}`">{{ type.textTitle }}:</label>
      </b-col>
      <b-col sm="9">
        <b-form-input :id="`type-${type.type}`" :type="type.type"></b-form-input>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  export default {
    name: 'ProjectEditPopUpName',
    components: {

    },
    props:{
      creatable: {
        type: Boolean,
        default: false
      },
      updatable: {
        type: Boolean,
        default: false
      }
    },
    mounted: function () {

    },
    data() {
      return {
        Inputs: [
          {
            textTitle:'ID',
            type: 'text'
          },
          {
            textTitle:'Name',
            type: 'text'
          }
        ]
      }
    },
    methods: {
      onCreate () {
        if (!this.validated) {

          return
        }
        console.log('creating....')
        setTimeout(() => {
          this.$store.dispatch('modal/closeModal')
        }, 1000)
      },
      onUpdate (e) {
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
