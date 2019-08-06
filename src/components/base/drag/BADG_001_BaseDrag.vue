<template>
  <div>
    <slot name="top-container" :height="height" />

    <slot v-if="isCustom" name="dragger" />
    <div v-else class="dragger-container">
      <div class="line left"
           :class="{'colored': line}" 
           :style="lineStyle"
      />
      <span class="dragger" 
            :style="draggerStyle"
            @mousedown="onMousedown"
      >
        <i class="fad fa-ellipsis-h" />
      </span>
      <div class="line right" 
           :class="{ 'colored': line }" 
           :style="lineStyle"
      />
    </div>

    <slot name="bottom-container" />
  </div>
</template>

<script>
export default {
    name: 'BaseDrag',
    props: {
        isCustom: {
            type: Boolean,
            default: false
        },
        line: {
            type: Boolean,
            default: true
        },
        draggerSize: {
            type: String,
            default: '1.5rem'
        },
        draggerWidth: {
            type: Number,
            default: 30
        },
        topHeight: {
            type: Number,
            default: 400
        }
    },
    data () {
        return {
            lineStyle: {
                'width': `calc(50% - ${this.width}px)`
            },
            draggerStyle: {
                'font-size': this.draggerSize,
                'width': `${this.draggerWidth}px`
            },
            height: this.topHeight,
            dragging: false,
            pageY: null
        };
    },
    methods: {
        onMousedown () {
            this.dragging = true;
            self.document.addEventListener('mousemove', this.onMousemove);
            self.document.addEventListener('mouseup', this.onMouseup);
        },
        onMousemove (e) {
            if (this.dragging) { 
                if (this.pageY === null) { 
                    this.pageY = e.pageY;
                    return;
                }

                this.height = this.height - (this.pageY - e.pageY);
                this.pageY = e.pageY;
            }
        },
        onMouseup () {
            if (this.dragging) { 
                this.dragging = false;
                this.pageY = null;
                self.document.removeEventListener('mousemove', this.onMousemove);
                self.document.removeEventListener('mouseup', this.onMouseup);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.dragger-container {
  position: relative;
  margin: 30px 0;
  .line {
    position: absolute;
    display: inline-block;
    border-bottom: 1px solid;
    border-color: transparent;
    &.colored {
      border-color: $gray;
    }
    &.left {
      left: 0;
    }
    &.right {
      right: 0;
    }
  }
  .dragger {
    position: absolute;
    top: 1px;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    cursor: row-resize;
    color: $black;
  }
}
</style>
