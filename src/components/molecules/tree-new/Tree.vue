<template>
    <div>
        <liquor-tree :data="data"
                     :options="options"
        />
    </div>
</template>

<script lang="ts">
/**
 * Vue Plugin 'LiquorTree'
 * Reference: https://amsik.github.io/liquor-tree
 */

import { reactive, toRefs, createComponent } from '@vue/composition-api';
import _ from 'lodash';
import TreeItem, { TreeOptionsType } from './TreeData';

export default createComponent({
    name: 'PTreeNew',
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        options: {
            type: Object as () => TreeOptionsType,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
        });
        return { ...toRefs(state) };
    },
});
</script>

<style lang="scss" scoped>

</style>
