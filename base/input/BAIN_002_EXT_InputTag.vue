<template>
  <span class="input-tag-container">
    <QueryInput v-if="isUpdateMode" 
                :context-data="listData" 
                :contents="contents"
                :autofocus="true"
                autoselect
                @commit="onUpdate"
                @empty="$emit('delete')"
                @deleteLeft="$emit('deleteLeft')"
    />

    <span v-else class="badge tag-badge">
      <span v-if="useTagOnly" class="contents" @click="onUpdateMode">
        {{ `${tagOnlyKey} : ${tagOnlySubKey}` }}
      </span>
      <span v-else class="contents" @click="onUpdateMode">
        {{ `${label} ${operator} ${value}` }}
      </span>
      <span class="icon" @click="$emit('delete')"><i class="fal fa-times-circle" /></span>
    </span>

  </span>
</template>

<script>
import QueryInput from '@/components/base/input/BAIN_004_EXT_QueryInput';
export default {
    name: 'InputTag',
    events: ['delete', 'update', 'deleteLeft'],
    components: { QueryInput },
    props: {
        listData: {
            type: Array,
            default: () => []
        },
        contents: {
            type: Object,
            default: () => {}
        },
        useTagOnly: {
            type: Boolean,
            default: false
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
        tagOnlyKey () {
            return this.contents.key ? ` ${this.contents.key}` : '';
        },
        tagOnlySubKey () {
            return this.contents.subKey ? `${this.contents.subKey}` : '';
        },
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
        }
    }
};
</script>

<style lang="scss" scoped>
$input-height: 30px;
$margin-top: 3px;
$margin-bottom: 3px;
.input-tag-container {
  .tag-badge {
    display: inline-block;
    max-width: 99%;
    height: calc(#{$input-height} - #{$margin-top} - #{$margin-bottom} );
    background-color: lighten($blueviolet, 30%);
    border-radius: 5px;
    padding: 6px 8px 0 8px;
    margin-right: 4px;
    margin-bottom: $margin-bottom;
    margin-top: $margin-top;
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
