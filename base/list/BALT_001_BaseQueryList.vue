<template>
  <div v-if="show" ref="container" class="query-list">
    <b-list-group>
      <b-list-group-item v-for="(query, idx) in queries" 
                         ref="listItems" 
                         :key="textOnly ? `key-${idx}` : `${query.key}-${idx}`"
                         :class="{ hovered: idx === hoveredItemIdx }"
                         :style="{paddingTop: `${itemVerticalPad / 2}px`, paddingBottom: `${itemVerticalPad / 2}px`}"
                         @mousedown.prevent="onClickItem(query, idx)"
                         @mouseover="onMouseover(idx)" 
                         @mouseout="onMouseout"
      >
        <template v-if="textOnly">
          {{ query }}
        </template>
        <b-row v-else no-gutters align-h="between">
          <b-col cols="8" class=" key-label">
            {{ query.label }}
          </b-col>
          <b-col v-if="query.values || query.ajax" cols="4" class="caret">
            <i class="fal fa-caret-right" />
          </b-col>
          <b-col v-else-if="query.type" cols="4" class="type-caption">
            {{ query.type }}
          </b-col>
        </b-row>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
    name: 'BaseQueryList',
    events: ['select'],
    props: {
        show: {
            type: Boolean,
            default: true
        },
        queries: {
            type: Array,
            required: true
        },
        textOnly: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            hoveredItemIdx: null,
            itemVerticalPad: 10
        };
    },
    watch: {
        show (val) {
            if (!val) {
                this.hoveredItemIdx = null;
            }
        }
    },
    methods: {
        onClickItem (query, idx) {
            this.$emit('select', query, idx);
        },
        emitSelectEvent () {
            if (this.hoveredItemIdx !== null) {
                this.$emit('select', this.queries[this.hoveredItemIdx], this.hoveredItemIdx);
            }
        },
        onMouseover (idx) {
            this.hoveredItemIdx = idx;
        },
        onMouseout () {
            this.hoveredItemIdx = null; 
        },
        setHoveredItemIdxDownward () {
            if (this.hoveredItemIdx === null || this.hoveredItemIdx >= this.queries.length - 1) {
                this.hoveredItemIdx = 0;
            } else {
                this.hoveredItemIdx++;
            }
        },
        setListScrollTopDownward () {
            if (this.hoveredItemIdx === 0) {
                this.$refs.container.scrollTop = 0;
                return;
            }

            let diff = this.$refs.listItems[this.hoveredItemIdx].getBoundingClientRect().bottom 
                        - this.$refs.container.getBoundingClientRect().bottom;
            if (diff > 0) {
                this.$refs.container.scrollTop += diff + this.itemVerticalPad;
            }
        },
        goDown () {
            this.setHoveredItemIdxDownward();
            if (this.$refs.container && this.$refs.listItems[this.hoveredItemIdx]) {
                this.setListScrollTopDownward();
            }
        },
        setHoveredItemIdxUpward () {
            if (this.hoveredItemIdx === null || this.hoveredItemIdx <= 0) {
                this.hoveredItemIdx = this.queries.length - 1;
            } else {
                this.hoveredItemIdx--;
            }
        },
        setListScrollTopUpward () {
            if (this.hoveredItemIdx === this.queries.length - 1) {
                this.$refs.container.scrollTop = this.$refs.container.scrollHeight;
                return;
            }

            let diff = this.$refs.listItems[this.hoveredItemIdx].getBoundingClientRect().top 
                        - this.$refs.container.getBoundingClientRect().top;
            if (diff < 0) {
                this.$refs.container.scrollTop += diff - this.itemVerticalPad;
            }
        },
        goUp () {
            this.setHoveredItemIdxUpward();
            if (this.$refs.container && this.$refs.listItems[this.hoveredItemIdx]) {
                this.setListScrollTopUpward();
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.query-list {
      display: inline-block;
      min-height: 100px;
      overflow-y: scroll;
      left: 0;
      width: auto;
      min-width: 250px;
      border-radius: 5px;
      .list-group {
        box-shadow: 0 0 4px 0 rgba($black, 0.4);
        border-radius: 5px;
        padding: 10px;
        background-color: darken($navy, 2%);
        width: auto;
      }
      .list-group-item {
        cursor: pointer;
        padding-left: 8px;
        padding-right: 8px;
        color: $lightgray;
        font-size: .9rem;
        background-color: transparent;
        border-radius: 5px;
        width: auto;
        white-space: nowrap;
        &.hovered {
          background-color: lighten($navy, 9%);
        }
        .key-label {
          white-space:nowrap;
          padding-right: 20px;
        }
        .caret {
          text-align: right;
          color: $darkgray;
        }
        .type-caption {
          text-align: right;
          font-weight: 300;
          color: $darkgray;
        }
      }
    }
</style>