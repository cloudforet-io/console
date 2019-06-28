<template>
  <div>
    <div class="search-container">
      <b-input-group>
        <b-col ref="inputBox" cols="10" class="p-1 input-box">
          <BaseInputTag is="BaseInputTag" v-for="(condi, idx) in conditionList" :key="condi.id"
                        :list-data="queryData" :contents="condi"
                        @delete="onDeleteTag(idx)"
          />

          <BaseInput :list-data="queryData" @add="addQuery" />
        </b-col>

        <b-input-group-append class="col-2 pl-0">
          <b-button block variant="primary" :limit="limit" :skip="skip" :sort="sort"
                    @click.prevent="searchFn(limit, skip, sort, value)"
          >
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
import BaseInputTag from '@/components/base/input/BAIN_002_EXT_BaseInputTag'
export default {
  name: 'BaseSearch',
  directives: { focus: focus },
  components: { BaseInput, BaseInputTag },
  props: {
    searchFn: {
      type: Function,
      required: true
    },
    queryData: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 10
    },
    skip: {
      type: Number,
      default: 0
    },
    sort: {
      type: String,
      default: 'created_date'
    }
  },
  data () {
    return {
      conditionList: []
    }
  },
  methods: {
    onDeleteTag (idx) {
      this.$delete(this.conditionList, idx)
    },
    addQuery (item) {
      this.conditionList.push({
        id: this.conditionList.length + 1,
        key: item.key,
        value: item.value
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$input-height: 23px;

.search-container {
  position: relative;
  .input-box {
    border: 1px solid lightgray;
    border-radius: 5px 0 0 5px;
    background-color: #fff;
    cursor: text;
  }
}
</style>
