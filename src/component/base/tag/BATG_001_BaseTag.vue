<template>
  <div>
    <b-row align-h="between" no-gutters>
      <b-col cols="12" class="mt-1 ">
        <b-button v-if="!isEditable && !showSaveBtn" variant="primary" class="edit-btn" @click="onEdit">
          Edit
        </b-button>
      </b-col>
    </b-row>

    <div class="mt-1 mb-1">
      <div v-for="(row, idx) in rows" :key="row.rowId">
        <KeyValueInput ref="tag" :data="row.tag" :read-only="!isEditable" @delete="deleteRow(idx)" />
      </div>
    </div>

    <b-row v-if="isEditable" no-gutters>
      <b-col cols="6" class="mt-1">
        <span class="add-btn" @click="addRow">
          <i class="fa fa-plus-square" /> Add New
        </span>
      </b-col>
      <b-col v-if="showSaveBtn" cols="5" class="text-right">
        <b-button class="cancel-btn mr-2" @click="onCancel">
          Cancel
        </b-button>
        <b-button variant="primary" class="save-btn" @click="onSave">
          Save
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import KeyValueInput from '@/component/base/input/BAIN_003_KeyValueInput'
export default {
  name: 'BaseTag',
  components: { KeyValueInput },
  props: {
    tagData: {
      type: Array,
      default: () => []
    },
    showFirstTagRow: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      rows: this.tagData.map((tag, i) => ({ rowId: i, tag: tag })),
      lastRowId: this.tagData.length,
      isEditable: this.editable,
      showSaveBtn: false
    }
  },
  computed: {
  },
  mounted: function () {
    if (this.showFirstTagRow) {
      this.isEditable = true;
      this.addRow();
    }
  },
  methods: {
    addRow () {
      this.rows.push({ rowId: this.lastRowId++, tag: {} })
    },
    deleteRow (idx) {
      this.$delete(this.rows, idx)
    },
    resetRows () {
      this.rows = this.tagData.map((tag, i) => ({ rowId: i, tag: tag }))
    },
    onSave () {
      this.showSaveBtn = false
      this.isEditable = false
    },
    onEdit () {
      this.showSaveBtn = true
      this.isEditable = true
    },
    onCancel () {
      this.showSaveBtn = false
      this.isEditable = false
    }
  }
}
</script>

<style lang="scss" scoped>
%btn {
  i {
      font-size: 1.3em;
      vertical-align: text-top;
    }
  cursor: pointer;
}
.add-btn {
  @extend %btn;
  color: #2D9E6E;
}
// .edit-btn {
//   @extend %btn;
//   color: #3E4AC7;
// }
// .save-btn {
//   @extend %btn;
//   color: #3E4AC7;
// }

</style>
