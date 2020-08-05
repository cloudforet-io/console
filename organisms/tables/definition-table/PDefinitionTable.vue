<template>
    <div class="p-definition-table">
        <slot v-if="isNoData" name="empty">
            <p-empty v-if="isNoData" class="py-8">
                No Data
            </p-empty>
        </slot>
        <table v-else>
            <tbody>
                <template v-if="loading">
                    <tr v-for="s in skeletons" :key="s">
                        <td class="w-1/4 py-2 px-4 h-8">
                            <p-skeleton />
                        </td>
                        <td class="py-2 pr-4 h-8">
                            <p-skeleton />
                        </td>
                    </tr>
                </template>
                <template v-else>
                    <p-definition v-for="(bind, idx) in items" :key="idx"
                                  class="def-row" v-bind="bind" @copy="onCopy(bind, idx)"
                    >
                        <slot :name="`data-${bind.name}`" v-bind="{...bind, index: idx, items}" />
                    </p-definition>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    DefinitionTableProps, DefinitionData, DefinitionField
} from '@/components/organisms/tables/definition-table/type';
import PDefinition from '@/components/organisms/definition/PDefinition.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { every, range, get } from 'lodash';
import { DynamicField } from '@/components/organisms/dynamic-field/type';
import { DefinitionProps } from '@/components/organisms/definition/type';

const makeDefItems = (fields: DefinitionField[], data?: DefinitionData): DefinitionProps[] => fields.map(item => ({
    ...item,
    data: get(data, item.name, ''),
}));

export default {
    name: 'PDefinitionTable',
    components: { PSkeleton, PEmpty, PDefinition },
    props: {
        fields: {
            type: Array,
            default: () => [],
        },
        data: {
            type: Object,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        skeletonRows: {
            type: Number,
            default: 5,
        },
    },
    setup(props: DefinitionTableProps, { emit }) {
        const state = reactive({
            isNoData: computed(() => every(state.items, def => !def.data)),
            skeletons: computed(() => range(props.skeletonRows)),
            items: [] as DefinitionProps[],
        });

        watch(() => props.data, () => {
            state.items = makeDefItems(props.fields, props.data);
        });

        return {
            ...toRefs(state),
            onCopy(bind, idx) {
                emit('copy', bind, idx);
                emit(`copy:${bind.name}`, bind, idx);
            },
        };
    },
};
</script>

<style lang="postcss">
.p-definition-table {
    table {
        @apply w-full;
        td {
            @apply border-white;
            line-height: 1.8;
        }
    }
    .def-row:nth-child(2n+1) {
        td {
            &:first-child {
                @apply border-r-2 border-white;
            }

            @apply bg-violet-100;
        }
    }
}
</style>
