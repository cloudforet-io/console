<template>
  <div style="position: relative;">
    <slot name="container" :width="containerWidth" />

    <div class="dragger-container"
         :style="{
           'height': `${containerHeight}px`,
           'left': `${containerWidth}px`
         }"
    >
      <div class="line top"
           :class="{'colored': line}" 
           :style="{ 'height': `${lineHeight}px` }"
      />

      <span class="dragger" 
            :style="draggerStyle"
            @mousedown="onMousedown"
      >
        <slot name="dragger" />
        <i v-if="!$slots.dragger" class="fal fa-grip-lines-vertical" />
      </span>

      <div class="line bottom" 
           :class="{ 'colored': line }" 
           :style="{ 'height': `${lineHeight}px` }"
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
            draggerStyle: {
                'font-size': this.draggerSize,
                'height': `${this.draggerHeight}px`
            },
            containerWidth: this.width,
            containerHeight: self.innerHeight,
            lineHeight: (this.containerHeight / 2) - this.draggerHeight,
            dragging: false,
            pageX: null
        };
    },
    mounted () {
        this.containerHeight = this.$scopedSlots.container()[0].context.$el.clientHeight;
        this.lineHeight = (this.containerHeight / 2) - this.draggerHeight;
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
  margin-left: 10px;
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
    cursor: col-resize;
    color: inherit;
  }
}
</style>
