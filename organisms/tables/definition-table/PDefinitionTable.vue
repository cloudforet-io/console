<template>
    <div class="p-definition-table">
        <slot v-if="!loading && isNoData" name="empty">
            <p-empty class="py-8">
                No Data
            </p-empty>
        </slot>
        <table v-else-if="!isNoData">
            <tbody>
                <p-definition v-for="(bind, idx) in items" :key="idx"
                              class="def-row" v-bind="bind" @copy="onCopy(bind, idx)"
                >
                    <slot :name="`data-${bind.name}`" v-bind="{...bind, index: idx, items}" />
                    <template #copy>
                        <slot name="copy" v-bind="{...bind, index: idx, items}">
                            <slot :name="`copy-${bind.name}`" v-bind="{...bind, index: idx, items}" />
                        </slot>
                    </template>
                </p-definition>
            </tbody>
        </table>
        <slot v-if="loading" name="loading">
            <div class="loading-backdrop fade-in" />
            <p-lottie name="thin-spinner" :size="2.5"
                      :auto="true" class="loading"
            />
        </slot>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import {
    DefinitionTableProps, DefinitionData, DefinitionField,
} from '@/components/organisms/tables/definition-table/type';
import PDefinition from '@/components/organisms/definition/PDefinition.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import { every, range, get } from 'lodash';
import { DefinitionProps } from '@/components/organisms/definition/type';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

const makeDefItems = (fields: DefinitionField[], data?: DefinitionData): DefinitionProps[] => fields.map(item => ({
    ...item,
    data: get(data, item.name, ''),
}));

export default {
    name: 'PDefinitionTable',
    components: {
        PLottie, PEmpty, PDefinition,
    },
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
            items: computed(() => makeDefItems(props.fields, props.data)),
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
    @apply relative;
    min-height: 2.5rem;
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
    .loading-backdrop {
        @apply absolute w-full h-full overflow-hidden;
        background-color: white;
        opacity: 0.5;
        top: 0;
        z-index: 1;
    }
    .loading {
        @apply absolute flex w-full h-full justify-center items-center;
        top: 0;
        max-height: 16.875rem;
    }

    /* transitions */

    .fade-in-enter-active {
        transition: opacity 0.2s;
    }
    .fade-in-leave-active {
        transition: opacity 0.2s;
    }
    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }
    .fade-in-leave, .fade-in-enter-to {
        opacity: 0.5;
    }
}
</style>
