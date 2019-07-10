<template>
  <div>
    <div class="search-container">
      <b-input-group class="row no-gutters">
        <b-col cols="10" class="input-container">
          <div ref="inputBox" class="p-1 input-box" @click.self="focusOnInput">
            <InputTag v-for="(tag, idx) in tagList" :key="tag.id"
                      :list-data="contextData.queryList" :contents="tag"
                      @delete="deleteTag(idx)" @update="updateTag"
            />

            <BaseInput ref="input" :list-data="contextData.queryList" @add="addTag" />
          </div>
          <span class="input-delete-button" @click="deleteAll"><i class="fa fa-times" /></span>
        </b-col>

        <b-input-group-append class="col-2 pl-0">
          <b-button block variant="primary" @click="search">
            <i class="fa fa-search" />
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
  </div>
</template>

<script>
import { focus } from 'vue-focus'
import BaseInput from '@/components/base/input/BAIN_001_BaseInput'
import InputTag from '@/components/base/input/BAIN_002_EXT_InputTag'

const testdata = [{
  id: 0,
  key: 'test_key',
  label: 'TEST',
  value: 'cloud one',
  operator: ':',
  type: 'String',
  subKey: ''
}]

const contextDataModel = {
  queryList: [],
  autokeyList: []
}

export default {
  name: 'BaseSearch',
  event: ['search'],
  directives: { focus: focus },
  components: { BaseInput, InputTag },
  props: {
    contextData: {
      type: Object,
      default: () => Object.assign({}, contextDataModel),
      validator (obj) {
        /**
         * TODO: Add validation for queryList format
         */
        return obj.queryList !== undefined && obj.queryList !== null && obj.queryList instanceof Array &&
              obj.autokeyList !== undefined && obj.autokeyList !== null && obj.autokeyList instanceof Array
      }
    },
    searchData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      tagList: this.searchData.length > 0 ? this.searchData : [],
      lastId: 0,
      focusInput: false,
      filterList: []
    }
  },
  methods: {
    focusOnInput () {
      this.$refs.input.isFocused = true
    },
    getNewTag (item) {
      return Object.assign({ id: ++this.lastId }, item)
    },
    deleteAll () {
      this.tagList = []
    },
    deleteTag (idx) {
      this.$delete(this.tagList, idx)
    },
    updateTag (tagId, items) {
      let matchIdx
      items.map((item, idx) => {
        if (idx === 0) {
          this.tagList.some((tag, i) => {
            if (tag.id === tagId) matchIdx = i
            return tag.id === tagId
          })

          this.$set(this.tagList, matchIdx, Object.assign(this.tagList[matchIdx], item))
        } else {
          this.tagList.splice(matchIdx + idx, 0, this.getNewTag(item))
        }
      })
    },
    addTag (items) {
      items.map(item => {
        this.tagList.push(this.getNewTag(item))
      })
    },
    search () {
      this.$emit('search', this.tagList)
    }
  }
}
</script>

<style lang="scss" scoped>
$input-height: 23px;

.search-container {
  position: relative;
  .input-container {
      border: 1px solid lightgray;
      border-radius: 5px 0 0 5px;
      background-color: #fff;
    .input-box {
      display: inline-block;
      width: 95%;
      cursor: text;
    }
    .input-delete-button {
      display: inline-block;
      width: 5%;
      padding-right: 8px;
      font-size: 1.2em;
      color: gray;
      text-align: right;
      vertical-align: middle;
      cursor: pointer;
    }
  }
}
</style>
