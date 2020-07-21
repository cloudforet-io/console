<template>
    <div class="list-container" :class="[theme]">
        <div v-if="loading" class="spinner-container">
            <p-lottie name="spinner" auto
                      :size="1.5"
            />
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
import { get, indexOf } from 'lodash';
import {
    reactive, toRefs,
} from '@vue/composition-api';
import { selectableListProps, SelectableListPropsType, MapperKeyType } from '@/components/organisms/lists/selectable-list/PSelectableList.toolset';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { makeProxy } from '@/components/util/composition-helpers';


export default {
    name: 'PSelectableList',
    components: { PSelectableItem, PLottie },
    props: selectableListProps,
    setup(props: SelectableListPropsType, { emit }) {
        const state = reactive({
            proxySelectedIndexes: makeProxy('selectedIndexes', props, emit),
            proxyDisabledIndexes: makeProxy('disabledIndexes', props, emit),
        });

        const getItem = (item, key: MapperKeyType) => {
            if (typeof key === 'function') return key(item);
            return get(item, key);
        };

        const onItemClick = (item, idx) => {
            const foundIdx = indexOf(state.proxySelectedIndexes, idx);
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
};
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
