<template>
  <span class="input-tag-container">
    <!--  v-select="textCaptureOption" @select="onTextCaptured" @mouseup="onTextMouseUp"
    v-autowidth="{maxWidth: '100%', minWidth: '50px', comfortZone: 1}"
    -->

    <BaseInput v-if="isUpdateMode" :list-data="listData" :contents="contents"
               :autofocus="true" :autoselect="true" @update="onUpdate"
               @delete="$emit('delete')"
    />

    <span v-else class="badge tag-badge m-1">
      <span class="contents" @click="onUpdateMode">
        {{ `${label} ${operator} ${value}` }}
      </span>
      <span class="icon" @click="$emit('delete')"><i class="fal fa-times-circle" /></span>
    </span>

  </span>
</template>

<script>
import { focus } from 'vue-focus';
import BaseInput from '@/components/base/input/BAIN_001_BaseInput';
export default {
    name: 'InputTag',
    event: ['delete', 'update'],
    directives: { focus: focus },
    components: { BaseInput },
    props: {
        listData: {
            type: Array,
            default: () => []
        },
        contents: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            isUpdateMode: false
        };
    },
    computed: {
        subKey () { return this.contents.subKey ? `.${this.contents.subKey}` : ''; },
        label () {
            return this.contents.key ? `${this.contents.label}${this.subKey}` : 'Search';
        },
        value () { return this.contents.value || ''; },
        operator () { return this.contents.operator; }
    },
    methods: {
        onUpdateMode () {
            this.isUpdateMode = true;
        },
        onUpdate (items) {
            this.$emit('update', this.$vnode.key, items);
            this.isUpdateMode = false;
        }
    }
};
</script>

<style lang="scss" scoped>
$input-height: 23px;
.input-tag-container {
  .tag-badge {
    display: inline-block;
    max-width: 99%;
    height: $input-height;
    line-height: 16px;
    background-color: rgba($blue, 0.1);
    border-radius: 50px;
    padding-left: 10px;
    padding-right: 10px;
    .contents {
      display: inline-block;
      max-width: 96%;
      font-size: 1.25em;
      cursor: pointer;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      vertical-align: text-bottom;
    }
    .icon {
      font-size: 1.3em;
      cursor: pointer;
      margin-left: 5px;
      color: $darkgray;
    }
  }
}
</style>
