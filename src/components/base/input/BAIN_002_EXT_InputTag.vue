<template>
  <span class="input-tag-container">
    <BaseInput v-if="isUpdateMode" :list-data="listData" :contents="contents"
               :autofocus="true" :autoselect="true" @update="onUpdate"
               @delete="$emit('delete')"
               @moveLeft="onMoveLeft"
               @moveRight="onMoveRight"
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
        },
        idx: {
            type: Number,
            required: true
        }
    },
    data () {
        return {
            isUpdateMode: false
        };
    },
    computed: {
        subKey () {
            return this.contents.subKey ? `.${this.contents.subKey}` : ''; 
        },
        label () {
            return this.contents.key ? `${this.contents.label}${this.subKey}` : 'Search';
        },
        value () {
            return this.contents.value || ''; 
        },
        operator () {
            return this.contents.operator; 
        }
    },
    methods: {
        onUpdateMode () {
            this.isUpdateMode = true;
        },
        onUpdate (items) {
            this.$emit('update', items, this.idx);
            this.isUpdateMode = false;
        },
        onMoveLeft () {
            this.isUpdateMode = false;
            this.$emit('moveLeft');
        },
        onMoveRight () {
            this.isUpdateMode = false;
            this.$emit('moveRight');
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
    background-color: lighten($blueviolet, 30%);//rgba($blue, 0.1);
    border-radius: 5px;
    padding: 6px 8px 0px 8px;
    .contents {
      display: inline-block;
      max-width: 96%;
      font-size: 1.25em;
      cursor: pointer;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      vertical-align: middle;
    }
    .icon {
      font-size: 1.3em;
      cursor: pointer;
      margin-left: 8px;
      color: $darkgray;
      vertical-align: middle;
    }
  }
}
</style>
