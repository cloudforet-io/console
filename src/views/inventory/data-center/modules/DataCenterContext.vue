<template>
    <div>
        <p-list-item
            v-for="(item, idx) in getSelectedData"
            :key="idx"
            :type="'CON'"
            class="menu"
            :contents="item.contents"
            :indent="item.indent"
            @click.stop="executeContext(item, $event)"
        />
    </div>
</template>
<script>
import _ from 'lodash';
import PListItem from '@/components/molecules/list-items/ListItem';

export default {
    name: 'DataCenterContext',
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
             * Flag:
             * */
            /**
             * When Back panel or Root has clicked
            */
            selectRT: [
                { flag: 'CRT_RE', contents: this.tr('ORGANISMS.CREATE_ARG', [this.tr('COMMON.REGION')]), indent: 0 },
            ],
            /**
             * When Region has Selected
             */
            selectRE: [
                { flag: 'CRT_ZN', contents: this.tr('ORGANISMS.CREATE_ARG', [this.tr('COMMON.ZONE')]), indent: 0 },
                {
                    flag: '', contents: '', indent: 0, divider: true,
                },
                { flag: 'UPT_RE', contents: this.tr('ORGANISMS.UPDATE_ARG', [this.tr('COMMON.REGION')]), indent: 0 },
                { flag: 'DEL_RE', contents: this.tr('ORGANISMS.DELETE_ARG', [this.tr('COMMON.REGION')]), indent: 0 },
            ],
            /**
             * When Zone has Selected
             */
            selectZN: [
                { flag: 'CRT_PL', contents: this.tr('ORGANISMS.CREATE_ARG', [this.tr('COMMON.POOL')]), indent: 0 },
                {
                    flag: '', contents: '', indent: 0, divider: true,
                },
                { flag: 'UPT_ZN', contents: this.tr('ORGANISMS.UPDATE_ARG', [this.tr('COMMON.ZONE')]), indent: 0 },
                { flag: 'DEL_ZN', contents: this.tr('ORGANISMS.DELETE_ARG', [this.tr('COMMON.ZONE')]), indent: 0 },
            ],
            /**
             * When Pool has Selected
             */
            selectPL: [
                { flag: 'UPT_PL', contents: this.tr('ORGANISMS.UPDATE_ARG', [this.tr('COMMON.POOL')]), indent: 0 },
                { flag: 'DEL_PL', contents: this.tr('ORGANISMS.DELETE_ARG', [this.tr('COMMON.POOL')]), indent: 0 },
            ],
        };
    },
    computed: {
        getSelectedData() {
            const hasClicked = _.get(this.contextData, 'node.data.back_panel_click');
            const initializing = _.get(this.contextData, 'node.data.init');
            const objectType = _.get(this.contextData, 'node.data.item_type');
            const arrContext = [this.selectRT, this.selectRE, this.selectZN, this.selectPL];

            let contextIndex = objectType === 'REGION' ? 1 : objectType === 'ZONE' ? 2 : 3;
            if (hasClicked || initializing) {
                contextIndex = 0;
            }

            return arrContext[contextIndex];
        },
    },
    methods: {
        executeContext(item, event) {
            if (!this.isEmpty(_.get(item, 'flag'))) {
                this.$parent.$parent.$refs.DataCenterTree.setContextVisible(false);
            }
            this.$emit('executeContext', _.get(item, 'flag'));
        },
    },
};
</script>

<style lang="scss" scoped>

</style>
