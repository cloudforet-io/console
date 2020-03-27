<template>
    <div>
        <p-menu-item
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
import PMenuItem from '@/components/molecules/menu-item/MenuItem.vue';

export default {
    name: 'ProjectContext',
    components: {
        PMenuItem,
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
             * CRT_RT: Create Root
             * UPT_PJ: Update Project
             * DEL_PJ: Delete Project
             * CRT_PR: Create Project group
             * CRT_PJ: Create Project
             * UPT_PR: Update Project group
             * DEL_PR: Delete Project group
             * */
            /**
             * When Back panel or Root has clicked
            */
            selectRT: [
                { flag: 'CRT_RT', contents: this.$t('ORGANISMS.CREATE_ARG', [this.$t('COMMON.PROJECT_GRP')]), indent: 0 },
            ],
            /**
             * When Project has Selected
             */
            selectPT: [
                { flag: 'UPT_PJ', contents: this.$t('ORGANISMS.UPDATE_ARG', [this.$t('COMMON.PROJECT')]), indent: 0 },
                { flag: 'DEL_PJ', contents: this.$t('ORGANISMS.DELETE_ARG', [this.$t('COMMON.PROJECT')]), indent: 0 },
            ],
            /**
             * When Project Group has Selected
             */
            selectPG: [
                { flag: 'CRT_PR', contents: this.$t('ORGANISMS.CREATE_ARG', [this.$t('COMMON.PROJECT_GRP')]), indent: 0 },
                { flag: 'UPT_PR', contents: this.$t('ORGANISMS.UPDATE_ARG', [this.$t('COMMON.PROJECT_GRP')]), indent: 0 },
                { flag: 'DEL_PR', contents: this.$t('ORGANISMS.DELETE_ARG', [this.$t('COMMON.PROJECT_GRP')]), indent: 0 },
                {
                    flag: '', contents: '', indent: 0, divider: true,
                },
                { flag: 'CRT_PJ', contents: this.$t('ORGANISMS.CREATE_ARG', [this.$t('COMMON.PROJECT')]), indent: 0 },
            ],
        };
    },
    computed: {
        getSelectedData() {
            const hasClicked = _.get(this.contextData, 'node.data.back_panel_click');
            const initializing = _.get(this.contextData, 'node.data.init');
            const objectType = _.get(this.contextData, 'node.data.item_type');
            const arrContext = [this.selectRT, this.selectPT, this.selectPG];

            let contextIndex = objectType === 'PROJECT' ? 1 : 2;
            if (hasClicked || initializing) {
                contextIndex = 0;
            }

            return arrContext[contextIndex];
        },
    },
    methods: {
        executeContext(item, event) {
            if (!this.isEmpty(_.get(item, 'flag'))) {
                this.$parent.$parent.$refs.ProjectTree.setContextVisible(false);
            }
            this.$emit('executeContext', _.get(item, 'flag'));
        },
    },
};
</script>

<style lang="postcss" scoped>

</style>
