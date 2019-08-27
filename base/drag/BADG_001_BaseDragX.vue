<template>
  <div class="box-container"
       :style="{'width': totalWidth,
                'height': `${containerHeight}px`}"
  >
    <div class="content-container left">
      <slot name="leftContainer" :width="`${leftContainerWidth}px`" />
    </div>

    <div ref="dragger" class="dragger-container"
         :style="{
           'height': `${containerHeight}px`,
           'left': `${leftContainerWidth}px`
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

    <div class="content-container right"
         :style="{'width': `calc(100vw - ${leftContainerWidth + draggerWidth}px)`,
                  'left': `${leftContainerWidth + draggerWidth}px`,
                  'height': `${containerHeight}px`}"
    >
      <slot name="rightContainer" :width="`calc(100vw - ${leftContainerWidth + draggerWidth}px)`" />
    </div>
  </div>
</template>

<script>
export default {
    name: 'BaseDragVertical',
    props: {
        height: {
            type: Number,
            default: self.innerHeight
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
        leftWidth: {
            type: Number,
            default: 200
        },
        minLeftWidth: {
            type: Number,
            default: 150
        },
        maxLeftWidth: {
            type: Number,
            default: 600
        },
        totalWidth: {
            type: String,
            default: '100vw'
        },
        rightWidth: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            draggerStyle: {
                'font-size': this.draggerSize,
                'height': `${this.draggerHeight}px`
            },
            leftContainerWidth: parseInt(this.leftWidth),
            // rightContainerWidth: this.totalWidth - this.leftWidth,
            containerHeight: this.height,
            lineHeight: (this.containerHeight / 2) - this.draggerHeight,
            draggerWidth: 30,
            dragging: false,
            pageX: null
        };
    },
    mounted () {
        this.lineHeight = (this.containerHeight / 2) - this.draggerHeight;
        this.draggerWidth = this.$refs.dragger.clientWidth + this.$refs.dragger.offsetWidth;
        // this.rightContainerWidth -= this.draggerWidth;
        this.consoleLogEnv('This is a height', this.height);
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
                let diff = this.pageX - e.pageX;
                let newWidth = this.leftContainerWidth - diff;
                if (newWidth < this.minLeftWidth || newWidth > this.maxLeftWidth) {
                    return;
                }

                this.leftContainerWidth = newWidth;
                const widthKey = this.$parent.$parent.$options.name + '_treeWidth';
                localStorage[widthKey] = this.leftContainerWidth;
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
.box-container {
    position: relative;
}
.content-container {
    display: inline-block;
    position: absolute;
    top: 0;
    overflow: scroll;
    &.left {
      left: 0;
    }
    &.right {

    }
}
.dragger-container {
    position: absolute;
    top: 0;
    margin-left: 7px;
    padding-right: 10px;
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
        color: $darkgray;
    }
}
</style>
