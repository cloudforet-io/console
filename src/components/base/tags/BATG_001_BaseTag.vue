<template>
  <div>
    <b-row align-h="between" no-gutters>
      <b-col cols="12" class="mt-1">
        <b-button v-if="!isEditable && !showSaveBtn" 
                  variant="primary"
                  class="edit-btn" 
                  @click="onEdit"
        >
          {{ tr('BTN_EDIT') }}
        </b-button>
      </b-col>
    </b-row>

    <div>
      <div v-for="(row, idx) in rows" :key="row.rowId">
        <KeyValueInput ref="tag" 
                       :data="row.tag" 
                       :read-only="!isEditable" 
                       :align="align"
                       @delete="deleteRow(idx)"
                       @mounted="$emit('addedRow')"
        />
      </div>
    </div>

    <b-row v-if="isEditable" no-gutters align-h="between">
      <b-col cols="12">
        <span class="add-btn" 
              tabindex="0" 
              @click="addRow"
              @keyup.space="addRow"
              @keyup.enter="addRow"
        >
          <span class="icon">
            <i class="fas fa-plus-circle" />
          </span>
        </span>
      </b-col>
      <b-col v-if="showSaveBtn" cols="5" class="text-right">
        <b-button class="cancel-btn mr-2" @click="onCancel">
          {{ tr('BTN_CANCEL') }}
        </b-button>
        <b-button variant="primary" class="save-btn" @click="onSave">
          {{ tr('BTN_SAVE') }}
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import KeyValueInput from '@/components/base/input/BAIN_003_KeyValueInput';
export default {
    name: 'BaseTag',
    events: ['addedRow'],
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
        },
        align: {
            type: String,
            default: 'start'
        }
    },
    data () {
        return {
            rows: this.tagData.map((tag, i) => ({ rowId: i, tag: tag })),
            lastRowId: this.tagData.length,
            isEditable: this.editable,
            showSaveBtn: false,
            tags: {}
        };
    },
    watch: {
        tagData () {
            this.rows = this.tagData.map((tag, i) => ({ rowId: i, tag: tag }));
            this.lastRowId = this.tagData.length;
        }
    },
    created () {

    },
    mounted () {
        this.addFirstRowWhenStart();
    },
    methods: {
        addFirstRowWhenStart(trigger){
            if (this.isEmpty(trigger)){
                if (this.showFirstTagRow) {
                    this.isEditable = true;
                    this.addRow();
                }
            } else {
                this.isEditable = true;
                this.addRow();
            }
        },
        addRow () {
            this.rows.push({ rowId: this.lastRowId++, tag: {}});
        },
        deleteRow (idx) {
            this.$delete(this.rows, idx);
        },
        resetRows () {
            this.rows = this.tagData.map((tag, i) => ({ rowId: i, tag: tag }));
            if (this.showFirstTagRow) {
                this.addRow();
            }
        },
        onSave () {
            this.showSaveBtn = false;
            this.isEditable = false;
        },
        onEdit () {
            this.showSaveBtn = true;
            this.isEditable = true;
        },
        onCancel () {
            this.showSaveBtn = false;
            this.isEditable = false;
        },
        validate () {
            this.tags = {}; 
            let tag = null;
            let isValid = true;

            //Skip Validation When show First Row is True, and User hasn't punch in any tag values.
            if (this.showFirstTagRow && this.rows.length === 1 &&
                 this.isEmpty(this.$refs.tag[0].key) && this.isEmpty(this.$refs.tag[0].value)) {
                return isValid;
            }

            this.rows.map((row, i) => {
                tag = this.$refs.tag[i];
                if (!tag.isNotNull()) {
                    isValid = false;
                }
                if (tag.key in this.tags) {
                    tag.setDuplicated();
                    isValid = false;
                }
                this.tags[tag.key] = tag.value;
            });
            return isValid;
        }
    }
};
</script>

<style lang="scss" scoped>
.add-btn {
  vertical-align: text-bottom;
  cursor: pointer;
  color: $green;
  &:hover, &:focus {
      .icon {
          text-shadow: 0 0 10px rgba($green, 0.7);
      }
  }
  .icon {
      font-size: 1.33em;
      padding-right: 5px;
    }
}

</style>
