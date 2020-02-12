<template>
    <div>
        <splitpanes class="p-vertical-layout2"
                    :style="{'height':height, 'width':width}"
                    :line="true"
                    :db-click-splitter="true"
                    :sidebar.sync="sidebar"
        >
            <pane v-if="sidebar"
                  :min-size="minSize"
                  :max-size="maxSize"
            >
                <slot />
            </pane>
            <pane>
                <slot />
            </pane>
        </splitpanes>
    </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes';
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import VerticalSplitpane from '@/components/molecules/layouts/vertical-layout/VerticalSplitpane.vue';


export default {
    name: 'PVerticalLayout2',
    components: {
        Splitpanes: VerticalSplitpane,
        Pane,
    },
    props: {
        height: {
            type: String,
            default: '620px',
        },
        width: {
            type: String,
            default: '600px',
        },
        minSize: {
            type: Number,
            default: 20,
        },
        maxSize: {
            type: Number,
            default: 50,
        },
    },
    setup() {
        const state = reactive({
        });

        return {
            ...toRefs(state),
            sidebar: ref(true),
        };
    },
};
</script>

<style lang="scss" scoped>
    @import '~splitpanes/dist/splitpanes.css';


    .splitpanes__pane {
        /*box-shadow: 0 0 5px rgba(0, 0, 0, .2) inset;*/
        justify-content: center;
        align-items: center;
        display: flex;
    }


</style>
