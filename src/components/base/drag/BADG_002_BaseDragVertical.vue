<template>
  <div style="position: relative;">
    <slot name="container" :width="containerWidth" />

    <div class="dragger-container"
         :style="draggerContainerStyle"
    >
      <div class="line top"
           :class="{'colored': line}" 
           :style="lineStyle"
      />

      <span class="dragger" 
            :style="draggerStyle"
            @mousedown="onMousedown"
      >
        <slot name="dragger" />
        <i v-if="!$slots.dragger" class="fad fa-ellipsis-h" />
      </span>

      <div class="line bottom" 
           :class="{ 'colored': line }" 
           :style="lineStyle"
      />
    </div>
  </div>
</template>

<script>
export default {
    name: 'BaseDragVertical',
    props: {
        isCustom: {
            type: Boolean,
            default: false
        },
        height: {
            type: String,
            default: '100vh'
        },
        line: {
            type: Boolean,
            default: true
        },
        draggerSize: {
            type: String,
            default: '1.5rem'
        },
        draggerHeight: {
            type: Number,
            default: 30
        },
        width: {
            type: Number,
            default: 200
        },
        minWidth: {
            type: Number,
            default: 150
        },
        maxWidth: {
            type: Number,
            default: 600
        }
    },
    data () {
        return {
            lineStyle: {
                'height': `calc(50% - ${this.height}px)`
            },
            draggerStyle: {
                'font-size': this.draggerSize,
                'height': `${this.draggerHeight}px`
            },
            containerWidth: this.width,
            draggerContainerStyle: {
                'height': this.height,
                'left': `${this.containerWidth}px`
            },
            dragging: false,
            pageX: null
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
                if (this.pageX === null) { 
                    this.pageX = e.pageX;
                    return;
                }

                let newWidth = this.containerWidth - (this.pageX - e.pageX);
                if (newWidth < this.minWidth || newWidth > this.maxWidth) { 
                    return; 
                }
                this.containerWidth = newWidth;
                this.pageX = e.pageX;
            }
        },
        onMouseup () {
            if (this.dragging) { 
                this.dragging = false;
                this.pageX = null;
                self.document.removeEventListener('mousemove', this.onMousemove);
                self.document.removeEventListener('mouseup', this.onMouseup);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.dragger-container {
  position: absolute;
  top: 0;
  margin-left: 20px;
  padding-right: 20px;
  .line {
    position: absolute;
    display: inline-block;
    border-left: 1px solid;
    border-color: transparent;
    &.colored {
      border-color: $gray;
    }
    &.top {
      top: 0;
    }
    &.bottom {
      bottom: 0;
    }
  }
  .dragger {
    position: absolute;
    top: 50%;
    left: 1px;
    transform: translate(-50%, -50%);
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    cursor: row-resize;
    color: inherit;
  }
}
</style>
