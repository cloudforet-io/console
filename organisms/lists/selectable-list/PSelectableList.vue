<template>
    <div class="p-selectable-list" :class="[theme]">
        <slot v-if="loading" name="loading">
            <div class="spinner-container">
                <p-lottie name="thin-spinner" auto
                          :size="1.5"
                />
            </div>
        </slot>
        <slot v-else-if="items.length === 0" name="no-data">
            <p-empty>
                <slot name="no-data-format">
                    No Items
                </slot>
            </p-empty>
        </slot>
        <template v-else>
            <p-selectable-item v-for="(item, idx) in items" :key="getItem(item, mapper.key) || idx"
                               :icon-url="getItem(item, mapper.iconUrl) || undefined"
                               :title="getItem(item, mapper.title) || undefined"
                               :active="proxyState.selectedIndexes.includes(idx)"
                               :disabled="disabled || proxyState.disabledIndexes.includes(idx)"
                               :color="getItem(item, mapper.color) || undefined"
                               :theme="theme"
                               :default-icon="getItem(item, mapper.icon) || defaultIcon"
                               :icon-size="iconSize"
                               @click="onItemClick(item, idx)"
            >
                <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                    <slot :name="slot" v-bind="scope"
                          :items="items" :item="item" :index="idx"
                    />
                </template>
            </p-selectable-item>
        </template>
    </div>
</template>

<script lang="ts">
import { get, indexOf, findIndex } from 'lodash';
import {
    ComponentRenderProxy,
    getCurrentInstance,
    reactive, toRefs,
} from '@vue/composition-api';
import { SelectableListProps, MapperKeyType } from '@/components/organisms/lists/selectable-list/type';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { makeOptionalProxy, makeProxy } from '@/components/util/composition-helpers';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';


export default {
    name: 'PSelectableList',
    components: { PEmpty, PSelectableItem, PLottie },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        /* sync */
        selectedIndexes: {
            type: Array,
            default: undefined,
        },
        /* sync */
        disabledIndexes: {
            type: Array,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: undefined,
        },
        mapper: {
            type: Object,
            default: () => ({}),
        },
        multiSelectable: {
            type: Boolean,
            default: true,
        },
        mustSelect: {
            type: Boolean,
            default: true,
        },
        defaultIcon: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: String,
            default: 'default',
            validator(theme) {
                return ['default', 'card'].includes(theme);
            },
        },
        iconSize: {
            type: String,
            default: undefined
        }
    },
    setup(props: SelectableListProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const proxyState = reactive({
            selectedIndexes: makeOptionalProxy('selectedIndexes', vm, [], ['select']),
            disabledIndexes: makeOptionalProxy('disabledIndexes', vm, []),
        });

        const getItem = (item, key: MapperKeyType) => {
            if (typeof key === 'function') return key(item);
            return get(item, key);
        };

        const onItemClick = (item, idx) => {
            // multi select case
            if (props.multiSelectable) {
                const foundIdx = findIndex(proxyState.selectedIndexes, idx);
                if (foundIdx === -1) {
                    if (props.mustSelect && proxyState.selectedIndexes.length === 1) return;
                    proxyState.selectedIndexes.splice(foundIdx, 1);
                    emit('unselected', item, idx, proxyState.selectedIndexes);
                } else {
                    proxyState.selectedIndexes = [...proxyState.selectedIndexes, idx];
                    emit('selected', item, idx, proxyState.selectedIndexes);
                }
                return;
            }

            // single select case
            if (proxyState.selectedIndexes.length === 0) {
                proxyState.selectedIndexes = [idx];
                emit('selected', item, idx, proxyState.selectedIndexes);
            } else {
                const isSame = proxyState.selectedIndexes[0] === idx;
                if (props.mustSelect) {
                    proxyState.selectedIndexes = [idx];
                    if (!isSame) emit('selected', item, idx, proxyState.selectedIndexes);
                    return;
                }

                if (isSame) {
                    proxyState.selectedIndexes = [];
                    emit('unselected', item, idx, proxyState.selectedIndexes);
                }
            }
        };
        return {
            proxyState,
            getItem,
            onItemClick,
        };
    },
};
</script>

<style lang="postcss">
.p-selectable-list {
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
}
</style>
