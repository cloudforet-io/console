<script>
import { Splitpanes, Pane } from 'splitpanes';


export default {
    name: 'VerticalSplitpane',
    extends: Splitpanes,
    props: {
        line: {
            type: Boolean,
            default: true,
        },
        sidebar: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        addSplitter(paneIndex, nextPaneNode, isVeryFirst = false) {
            const draggerContainer = document.createElement('div');
            draggerContainer.classList.add('dragger-container');
            draggerContainer.classList.add('splitpanes__splitter');
            if (this.line) {
                draggerContainer.classList.add('line');
            }
            const dragger = document.createElement('span');
            dragger.classList.add('dragger');
            const drag = document.createElement('span');
            draggerContainer.appendChild(dragger);
            dragger.appendChild(drag);
            dragger.onclick = event => this.onDraggerClick(event);
            const splitterIndex = paneIndex - 1;
            if (!isVeryFirst) {
                draggerContainer.onmousedown = event => this.onMouseDown(event, splitterIndex);
                if (typeof window !== 'undefined' && 'ontouchstart' in window) {
                    draggerContainer.ontouchstart = event => this.onMouseDown(event, splitterIndex);
                }
                draggerContainer.onclick = event => this.onSplitterClick(event, splitterIndex + 1);
            }
            if (this.dblClickSplitter) {
                draggerContainer.ondblclick = event => this.onSplitterDblClick(event, splitterIndex + 1);
            }
            nextPaneNode.parentNode.insertBefore(draggerContainer, nextPaneNode);
        },
        onDraggerClick() {
            console.log('dragger click test')
            this.$emit('click', [{size:0}]);
        },
    },
};
</script>

<style lang="scss" scoped>
    @import '~splitpanes/dist/splitpanes.css';
    ::v-deep .dragger-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        width: 10px;
        &.line {
            border-left: 1px solid $lightgray;
            background-color: transparent;
            &:hover {
                border-left: 1px solid $secondary;
                cursor: ew-resize;
            }
        }
        .dragger {
            display: inline-block;
            cursor: pointer;
            height: 30px;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            z-index: 99999;
            cursor: col-resize;
            background-color: #3C2C84;
            color: $darkgray;
            > span {
                margin-right: 26px;
                cursor: pointer;
            }
        }
        .btn-vertical-dragger{
            margin-top: 1rem;
            margin-left: 1rem;
            justify-content: center;
            color: $darkgray;
        }
    }

</style>
