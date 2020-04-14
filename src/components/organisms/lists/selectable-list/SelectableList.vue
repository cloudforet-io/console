<template>
    <div class="list-container" :class="[theme]">
        <div v-if="loading" class="spinner-container">
            <p-selectable-item>
                <template #side>
                    <div class="bg-primary3 rounded-sm h-8 w-8" />
                </template>
                <template #contents>
                    <div class="grid gap-1 grid-cols-1">
                        <div class="bg-primary3 rounded-sm h-3 w-3/5" />
                        <div class="bg-primary3 rounded-sm h-3 opacity-50 w-4/5" />
                    </div>
                </template>
            </p-selectable-item>
        </div>
        <template v-else>
            <p-selectable-item v-for="(item, idx) in items" :key="getItem(item, mapper.key) || idx"
                               :icon-url="getItem(item, mapper.iconUrl)"
                               :title="getItem(item, mapper.title)"
                               :active="proxySelectedIndexes.includes(idx)"
                               :disabled="proxyDisabledIndexes.includes(idx)"
                               :color="getItem(item, mapper.color)"
                               :theme="theme"
                               @click="onItemClick(item, idx)"
            >
                <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                    <slot :name="slot" v-bind="scope" :items="items"
                          :item="item" :index="idx"
                    />
                </template>
            </p-selectable-item>
        </template>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { selectableListProps, SelectableListPropsType, MapperKeyType } from '@/components/organisms/lists/selectable-list/SelectableList.toolset';
import PSelectableItem from '@/components/molecules/selectable-item/SelectableItem.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { makeProxy } from '@/lib/compostion-util';


export default defineComponent({
    name: 'SelectableList',
    components: { PSelectableItem, PLottie },
    props: selectableListProps,
    setup(props: SelectableListPropsType, { emit }) {
        const state = reactive({
            proxySelectedIndexes: makeProxy('selectedIndexes', props, emit),
            proxyDisabledIndexes: makeProxy('disabledIndexes', props, emit),
        });

        const getItem = (item, key: MapperKeyType) => {
            if (typeof key === 'function') return key(item);
            return _.get(item, key);
        };

        const onItemClick = (item, idx) => {
            const foundIdx = _.indexOf(state.proxySelectedIndexes, idx);
            if (foundIdx !== -1) {
                if (props.mustSelect && state.proxySelectedIndexes.length === 1) return;
                state.proxySelectedIndexes.splice(foundIdx, 1);
                emit('unselected', item, idx, state.proxySelectedIndexes);
            } else if (props.multiSelectable || state.proxySelectedIndexes.length === 0) {
                state.proxySelectedIndexes = [...state.proxySelectedIndexes, idx];
                emit('selected', item, idx, state.proxySelectedIndexes);
            } else {
                state.proxySelectedIndexes = [idx];
                emit('selected', item, idx, state.proxySelectedIndexes);
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
    .spinner-container {
        display: flex;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;
    }
    .list-container {
        display: grid;
        &.card {
            grid-row-gap: 0.5rem;
            grid-column-gap: 0.5rem;
        }
    }
</style>
