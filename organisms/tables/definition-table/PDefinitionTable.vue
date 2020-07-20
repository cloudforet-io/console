<template>
    <fragment>
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
    </fragment>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import {
    definitionTableProps,
    DefinitionTableProps,
} from '@/components/organisms/tables/definition-table/PDefinitionTable.toolset';
import PDefinition from '@/components/organisms/definition/PDefinition.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import _ from 'lodash';

export default {
    name: 'PDefinitionTable',
    components: { PSkeleton, PEmpty, PDefinition },
    props: definitionTableProps,
    setup(props: DefinitionTableProps, { emit }) {
        const state = reactive({
            isNoData: computed(() => _.every(props.items, def => !def.data)),
            skeletons: computed(() => _.range(props.skeletonRows)),
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

<style lang="postcss" scoped>
table {
    @apply w-full;
    td{
        line-height: 1.8;
    }
}
.def-row:nth-child(2n+1)::v-deep {
    td {
        &:first-child {
            @apply border-r-2 border-white;
        }
        @apply bg-violet-100;
    }
}
</style>
