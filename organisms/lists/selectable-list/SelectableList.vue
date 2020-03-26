<template>
    <div>
        <p-selectable-item v-for="(item, idx) in items" :key="getItem(item, mapper.key)"
                           :icon="getItem(item, mapper.icon)"
                           :title="getItem(item, mapper.title)"
                           :active="proxySelectedIndexes.includes(idx)"
                           :disabled="proxyDisabledIndexes.includes(idx)"
                           @click="onItemClick(item, idx)"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" :items="items"
                      :item="item" :index="idx"
                />
            </template>
        </p-selectable-item>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { selectableListProps, SelectableListPropsType } from '@/components/organisms/lists/selectable-list/SelectableList.toolset';
import PSelectableItem from '@/components/molecules/selectable-item/SelectableItem.vue';
import { makeProxy } from '@/lib/compostion-util';

export default defineComponent({
    name: 'SelectableList',
    components: { PSelectableItem },
    props: selectableListProps,
    setup(props: SelectableListPropsType) {
        const vm: any = getCurrentInstance();

        const state = reactive({
            proxySelectedIndexes: makeProxy('selectedIndexes'),
            proxyDisabledIndexes: makeProxy('disabledIndexes'),
        });

        const getItem = (item, key) => _.get(item, key);

        const onItemClick = (item, idx) => {
            const foundIdx = _.indexOf(state.proxySelectedIndexes, idx);
            if (foundIdx !== -1) {
                state.proxySelectedIndexes.splice(foundIdx, 1);
                vm.$emit('unselected', item, idx, state.proxySelectedIndexes);
            } else if (props.multiSelectable || state.proxySelectedIndexes.length === 0) {
                state.proxySelectedIndexes = [...state.proxySelectedIndexes, idx];
                vm.$emit('selected', item, idx, state.proxySelectedIndexes);
            } else {
                state.proxySelectedIndexes = [idx];
                vm.$emit('selected', item, idx, state.proxySelectedIndexes);
            }
        };
        return {
            ...toRefs(state),
            getItem,
            onItemClick,
        };
    },
});
</script>

<style lang="postcss" scoped>

</style>
