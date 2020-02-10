<template>
    <div>
        <splitpanes style="height: 400px">
            <pane min-size="20">
                <span>1</span>
            </pane>
            <pane>
                <span>5</span>
            </pane>
        </splitpanes>
    </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes';

export default {
    name: 'PVerticalLayout2',
    components: {
        Splitpanes,
        Pane,
    },
    setup() {
    // .splitpanes {
        //         background: linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB);
        //     }
        //
        // .splitpanes__pane {
        //         box-shadow: 0 0 5px rgba(0, 0, 0, .2) inset;
        //         justify-content: center;
        //         align-items: center;
        //         display: flex;
        //     }
        //
        // .splitpanes--vertical > .splitpanes__splitter {
        //         min-width: 6px;
        //         background: linear-gradient(90deg, #ccc, #111);
        //     }
        //
        // .splitpanes--horizontal > .splitpanes__splitter {
        //         min-height: 6px;
        //         background: linear-gradient(0deg, #ccc, #111);
        //     }
        return {};
    },
};
</script>

<style lang="scss" scoped>

</style>
