<template>
  <div>
    <div class="search-container">
      <b-input-group class="row no-gutters">
        <b-col cols="10" class="input-container">
          <div ref="inputBox" class="p-1 input-box" @click.self="focusOnInput">
            <InputTag v-for="(condi, idx) in conditionList" :key="condi.id"
                      :list-data="queryData" :contents="condi"
                      @delete="deleteTag(idx)" @update="updateTag"
            />

            <BaseInput ref="input" :list-data="queryData" @add="addQuery" />
          </div>
          <span class="input-delete-button" @click="deleteAll"><i class="fa fa-times" /></span>
        </b-col>

        <b-input-group-append class="col-2 pl-0">
          <b-button block variant="primary" @click="$emit('search', conditionList)">
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

export default {
  name: 'BaseSearch',
  event: ['search'],
  directives: { focus: focus },
  components: { BaseInput, InputTag },
  props: {
    searchData: {
      type: Array,
      default: () => []
    },
    queryData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      conditionList: this.searchData.length > 0 ? this.searchData : [],
      lastId: 0,
      focusInput: false
    }
  },
  methods: {
    focusOnInput () {
      this.$refs.input.isFocused = true
    },
    deleteAll () {
      this.conditionList = []
    },
    deleteTag (idx) {
      this.$delete(this.conditionList, idx)
    },
    updateTag (tagId, items) {
      let matchIdx
      items.map((item, idx) => {
        if (idx === 0) {
          this.conditionList.some((condi, i) => {
            if (condi.id === tagId) matchIdx = i
            return condi.id === tagId
          })

          this.$set(this.conditionList, matchIdx, Object.assign(this.conditionList[matchIdx], item))
        } else {
          this.conditionList.splice(matchIdx + idx, 0, Object.assign({ id: ++this.lastId }, item))
        }
      })
    },
    addQuery (items) {
      items.map(item => {
        this.conditionList.push(Object.assign({ id: ++this.lastId }, item))
      })
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
