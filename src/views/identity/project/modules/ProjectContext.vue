<template>
    <div>
        <p-list-item
            v-for="(item, idx) in getSelectedData"
            :key="idx"
            :type="'CON'"
            class="menu"
            :contents="item.contents"
            :indent="item.indent"
            @click.stop="executeItem(item, $event)"
        />
    </div>
</template>
<script>
import _ from 'lodash';
import PListItem from '@/components/molecules/list-items/ListItem';

export default {
    name: 'ProjectContext',
    components: {
        PListItem,
    },
    props: {
        contextData: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            /**
             * When Back panel or Root has clicked
            */
            selectRT: [
                { contents: this.tr('ORGANISMS.CREATE_ARG', [this.tr('COMMON.PG_GR')]), indent: 0 },
            ],
            /**
             * When Project has Selected
             */
            selectPT: [
                { contents: this.tr('ORGANISMS.UPDATE_ARG', [this.tr('COMMON.PG')]), indent: 0 },
                { contents: this.tr('ORGANISMS.DELETE_ARG', [this.tr('COMMON.PG')]), indent: 0 },
            ],
            /**
             * When Project Group has Selected
             */
            selectPG: [
                { contents: this.tr('ORGANISMS.CREATE_ARG', [this.tr('COMMON.PG_GR')]), indent: 0 },
                { contents: this.tr('ORGANISMS.CREATE_ARG', [this.tr('COMMON.PG')]), indent: 0 },
                { contents: this.tr('ORGANISMS.UPDATE_ARG', [this.tr('COMMON.PG_GR')]), indent: 0 },
                { contents: this.tr('ORGANISMS.DELETE_ARG', [this.tr('COMMON.PG_GR')]), indent: 0 },
            ],
        };
    },
    computed: {
        getSelectedData() {
            const hasClicked = _.get(this.contextData, 'node.data.back_panel_click');
            const objectType = _.get(this.contextData, 'node.data.item_type');
            const arrContext = [this.selectRT, this.selectPT, this.selectPG];

            let contextIndex = objectType === 'PROJECT' ? 1 : 2;
            if (hasClicked) {
                contextIndex = 0;
            }

            return arrContext[contextIndex];
        },
    },
    methods: {
        executeItem(item, event) {

        },
    },
};
</script>

<style lang="scss" scoped>

</style>
