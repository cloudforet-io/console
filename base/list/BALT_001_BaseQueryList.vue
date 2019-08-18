<template>
  <b-list-group>
    <b-list-group-item v-for="(key, idx) in queryList" 
                       :key="`key:${idx}`"
                       ref="list" 
                       :class="{'hovered': idx === hoveredItemIdx}"
                       @mousedown.prevent="onSelectKey(key, idx)"
                       @mouseover="onMouseover(idx)" 
                       @mouseout="onMouseout"
    >
      <b-row class="no-gutters justify-content-between">
        <b-col class="col-8 key-label">
          {{ key.label }}
        </b-col>
        <b-col v-if="key.values || key.ajax" class="col-4 caret">
          <i class="fal fa-caret-right" />
        </b-col>
        <b-col v-else-if="key.type" class="col-4 type-caption">
          {{ key.type }}
        </b-col>
      </b-row>
    </b-list-group-item>
  </b-list-group>
</template>

<script>
export default {
    name: 'BaseQueryList',
    props: {
        queryData: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        queryList () {
            return this.queryData;
        }
    },
    methods: {
        async onSelectKey (item) {
            this.setKey(item);
            if (this.selected.type === 'SubKey') {
                this.inputText = `${this.selected.label}.`;
            } else {
                this.inputText = `${this.selected.label} ${this.selected.operator}`;
            }
            this.hideKeyList();
            await this.setValueListByKeyObj();
            this.showValueList();
        }
    }
};
</script>

<style lang="scss" scoped>

</style>