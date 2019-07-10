<template>
  <div>
    <div class="mt-1 mb-3">
      <span v-for="(tag, idx) in tags" :key="idx" class="tag-badge mr-2">
        <b-badge v-for="(val, k) in tag" :key="k" variant="light">
          {{ k }} : {{ val }} <i v-if="updatable" class="tag-delete-btn fa fa-times-circle" @click="deleteTag(idx)" />
        </b-badge>
      </span>
    </div>
    <b-form v-if="updatable">
      <b-row>
        <b-col cols="3" class="text-center">
          <label>Key</label>
        </b-col>
        <b-col cols="3" class="text-center">
          <label>Value</label>
        </b-col>
      </b-row>
      <b-row align-v="center">
        <b-col cols="3">
          <b-form-input v-model="key" type="text" />
        </b-col> :
        <b-col cols="3">
          <b-form-input v-model="value" type="text" />
        </b-col>
        <b-col cols="3">
          <b-button type="button" size="sm" variant="light" @click="addTag">
            Add
          </b-button>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script>
export default {
  name: 'BaseTag',
  props: {
    tagsProp: {
      type: Array,
      default: () => []
    },
    updatable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      key: '',
      value: ''
    }
  },
  computed: {
    tags () {
      return this.tagsProp
    }
  },
  methods: {
    addTag () {
      let newTag = {}
      newTag[this.key] = this.value
      this.tags.push(newTag)
      this.key = ''
      this.value = ''
    },
    deleteTag (idx) {
      this.tags.splice(idx, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-badge {
  font-size: 1.3em;
  .tag-delete-btn {
    vertical-align: text-top;
    font-size: 0.95em;
    cursor: pointer;
  }
}
</style>
